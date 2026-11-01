"""Dataset loading, cleaning and feature definitions shared by the pipeline, evaluation and serving.

Keeping the feature list in ONE place matters: the v1 (2024) service built the model
input in a different column order from the one the models were trained on.

This module is imported by the serving API, so it only depends on pandas/numpy.
"""
from __future__ import annotations

import hashlib
import json
from collections.abc import Iterable
from pathlib import Path

import numpy as np
import pandas as pd

REPO_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_DATA = REPO_ROOT / "data" / "dataset.json"

POLLUTANTS = ["exposure_mean_no2", "exposure_mean_ozone", "exposure_mean_pm25"]
TARGET = "health_burden_mean"
# Column order used for training AND inference.
FEATURES = ["year", "country_encoded", "region_encoded", *POLLUTANTS]
CLEAN_COLUMNS = ["country", "region_name", "year", *POLLUTANTS, TARGET]
RISK_LABELS = ["Low Risk", "Moderate Risk", "High Risk"]


def sha256_file(path: str | Path) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as fh:
        for chunk in iter(lambda: fh.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def read_source(path: str | Path = DEFAULT_DATA) -> pd.DataFrame:
    """Read the source extract exactly as published (no cleaning)."""
    return pd.DataFrame(json.loads(Path(path).read_text()))


def isolated_drops(df: pd.DataFrame, column: str, ratio: float = 0.3) -> pd.Series:
    """True where a value is below `ratio` x the previous AND the next year's value for the same country."""
    s = df.sort_values(["country", "year"])
    g = s.groupby("country")[column]
    flag = (s[column] < ratio * g.shift(1)) & (s[column] < ratio * g.shift(-1))
    return flag.reindex(df.index)


def repair_pollutants(df: pd.DataFrame, ratio: float = 0.3) -> tuple[pd.DataFrame, dict[str, int]]:
    """Replace isolated drops with a within-country linear interpolation of the neighbouring years.

    Only interior points can be flagged (both neighbours must exist), so the interpolation is always bounded.
    Returns the repaired frame and the number of values replaced per column.
    """
    out = df.sort_values(["country", "year"]).copy()
    replaced: dict[str, int] = {}
    for col in POLLUTANTS:
        flag = isolated_drops(out, col, ratio)
        replaced[col] = int(flag.sum())
        out[col] = out[col].astype(float).mask(flag)
        out[col] = out.groupby("country")[col].transform(lambda s: s.interpolate(limit_direction="both"))
    return out.sort_index(), replaced


def clean(
    raw: pd.DataFrame,
    drop_regions: Iterable[str] = ("Australia",),
    pollutant_repair: str = "none",
    suspicious_ratio: float = 0.3,
) -> tuple[pd.DataFrame, dict]:
    """Turn the raw extract into the modelling table (CLEAN_COLUMNS). Returns (table, lineage report).

    Australia appears twice per year in the source extract: once as a pseudo-region called "Australia" and once
    under "Western Pacific Region", with identical values. Keeping both would double-count it and leak identical
    rows across train/test splits.
    """
    df = raw[CLEAN_COLUMNS].copy()
    for col in ["year", *POLLUTANTS, TARGET]:
        df[col] = pd.to_numeric(df[col])
    df["year"] = df["year"].astype(int)
    df[[*POLLUTANTS, TARGET]] = df[[*POLLUTANTS, TARGET]].astype(float)
    n_in = len(df)
    df = df[~df["region_name"].isin(list(drop_regions))]
    report: dict = {"rows_in": n_in, "rows_dropped_regions": n_in - len(df), "repaired_values": {}}
    if pollutant_repair == "interpolate":
        df, report["repaired_values"] = repair_pollutants(df, suspicious_ratio)
    elif pollutant_repair != "none":
        raise ValueError(f"unknown pollutant_repair: {pollutant_repair!r}")
    df = df.sort_values(["country", "year"]).reset_index(drop=True)
    report["rows_out"] = len(df)
    return df, report


def load_raw(path: str | Path = DEFAULT_DATA) -> pd.DataFrame:
    """Load and clean the extract with the default policy (kept for scripts and tests)."""
    df, _ = clean(read_source(path))
    assert not df.duplicated(["country", "year"]).any(), "duplicate country-year rows"
    return df


def load_table(path: str | Path) -> pd.DataFrame:
    """Load a modelling table: a validated parquet produced by the pipeline, or the raw JSON (cleaned on the fly)."""
    path = Path(path)
    if path.suffix == ".parquet":
        return pd.read_parquet(path)
    return load_raw(path)


def build_features(df: pd.DataFrame, country_encoder, region_encoder) -> pd.DataFrame:
    """Return a DataFrame with columns in exactly FEATURES order."""
    out = pd.DataFrame(
        {
            "year": df["year"].astype(int).to_numpy(),
            "country_encoded": country_encoder.transform(df["country"]),
            "region_encoded": region_encoder.transform(df["region_name"]),
        }
    )
    for col in POLLUTANTS:
        out[col] = df[col].astype(float).to_numpy()
    return out[FEATURES]


def quantile_profile(values: pd.Series | np.ndarray, bins: int = 10) -> dict:
    """Reference distribution for drift monitoring: interior quantile edges and the share of rows per bin."""
    v = np.asarray(values, dtype=float)
    edges = np.unique(np.quantile(v, np.linspace(0, 1, bins + 1))[1:-1])
    counts = np.bincount(np.searchsorted(edges, v, side="right"), minlength=len(edges) + 1)
    return {"edges": edges.round(6).tolist(), "proportions": (counts / counts.sum()).round(6).tolist()}
