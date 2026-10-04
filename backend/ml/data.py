"""Dataset loading and feature definitions shared by training, evaluation and serving.

Keeping the feature list in ONE place matters: the v1 (2024) service built the model
input in a different column order from the one the models were trained on.
"""
from __future__ import annotations

import json
from pathlib import Path

import pandas as pd

REPO_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_DATA = REPO_ROOT / "data" / "dataset.json"

POLLUTANTS = ["exposure_mean_no2", "exposure_mean_ozone", "exposure_mean_pm25"]
TARGET = "health_burden_mean"
# Column order used for training AND inference.
FEATURES = ["year", "country_encoded", "region_encoded", *POLLUTANTS]
RISK_LABELS = ["Low Risk", "Moderate Risk", "High Risk"]


def load_raw(path: str | Path = DEFAULT_DATA) -> pd.DataFrame:
    """Load the State of Global Air extract and remove the duplicated Australia rows.

    Australia appears twice per year in the source extract: once as a pseudo-region
    called "Australia" and once under "Western Pacific Region", with identical values.
    Keeping both would double-count it and leak identical rows across train/test splits.
    """
    df = pd.DataFrame(json.loads(Path(path).read_text()))
    df = df[["country", "region_name", "year", *POLLUTANTS, TARGET]].copy()
    for col in ["year", *POLLUTANTS, TARGET]:
        df[col] = pd.to_numeric(df[col])
    df = df[df["region_name"] != "Australia"]
    assert not df.duplicated(["country", "year"]).any(), "duplicate country-year rows"
    return df.reset_index(drop=True)


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
