"""Data-drift check: compare a batch of new inputs with the training distribution stored in the model bundle.

    python -m ml.drift --current new_rows.json            # JSON list of records or a CSV with the feature columns
    python -m ml.drift --current new_rows.csv --bundle artifacts/model_bundle.joblib

Uses the Population Stability Index (PSI) per feature over the quantile bins recorded at training time:
PSI < 0.1 stable, 0.1-0.25 moderate shift, > 0.25 significant shift (exit code 1, so it can gate a batch job).
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

import joblib
import numpy as np
import pandas as pd

MODERATE, SIGNIFICANT = 0.10, 0.25
_EPS = 1e-4


def psi(reference: dict, values: np.ndarray) -> float:
    """PSI between a stored reference profile ({edges, proportions}) and new values."""
    edges = np.asarray(reference["edges"], dtype=float)
    expected = np.asarray(reference["proportions"], dtype=float)
    counts = np.bincount(np.searchsorted(edges, np.asarray(values, dtype=float), side="right"), minlength=len(expected))
    actual = counts / max(counts.sum(), 1)
    e, a = np.clip(expected, _EPS, None), np.clip(actual, _EPS, None)
    return float(np.sum((a - e) * np.log(a / e)))


def drift_report(reference_profile: dict, current: pd.DataFrame) -> dict:
    features = {}
    for col, ref in reference_profile.items():
        if col not in current:
            continue
        value = psi(ref, current[col].dropna().to_numpy())
        status = "significant" if value > SIGNIFICANT else "moderate" if value > MODERATE else "stable"
        features[col] = {"psi": round(value, 4), "status": status}
    return {
        "n_rows": len(current),
        "features": features,
        "drift_detected": any(f["status"] == "significant" for f in features.values()),
    }


def _read(path: Path) -> pd.DataFrame:
    if path.suffix == ".csv":
        return pd.read_csv(path)
    data = json.loads(path.read_text())
    return pd.DataFrame(data.get("items", data) if isinstance(data, dict) else data)


if __name__ == "__main__":
    from ml.train import ARTIFACT_DIR, BUNDLE_NAME

    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--current", required=True, type=Path)
    ap.add_argument("--bundle", type=Path, default=ARTIFACT_DIR / BUNDLE_NAME)
    a = ap.parse_args()
    report = drift_report(joblib.load(a.bundle)["reference_profile"], _read(a.current))
    print(json.dumps(report, indent=2))
    sys.exit(1 if report["drift_detected"] else 0)
