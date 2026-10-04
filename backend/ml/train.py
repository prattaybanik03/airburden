"""Train the three models used by the API and write them to backend/artifacts/.

    python -m ml.train                # from the backend/ directory

Differences from the 2024 coursework version (see docs/v1-vs-v2.md):
  * trees are trained on raw values: no scaler, so no inverse-transform step to get wrong
  * the same FEATURES list is used for training and serving
  * rows duplicated in the source extract are removed
  * the model bundle records library versions and risk-class thresholds
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import subprocess
from datetime import datetime, timezone
from pathlib import Path

import joblib
import numpy as np
import sklearn
from sklearn.cluster import KMeans
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.preprocessing import LabelEncoder, StandardScaler

from ml.data import DEFAULT_DATA, FEATURES, POLLUTANTS, RISK_LABELS, TARGET, build_features, load_raw

ARTIFACT_DIR = Path(__file__).resolve().parents[1] / "artifacts"
BUNDLE_NAME = "model_bundle.joblib"
MODEL_VERSION = "2.0.0"  # bump when features, targets or training procedure change
SEED = 42
N_CLUSTERS = 3
POLLUTANT_NAMES = {"exposure_mean_no2": "NO2", "exposure_mean_ozone": "ozone", "exposure_mean_pm25": "PM2.5"}


def _sha256(path) -> str:
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def _git_commit() -> str:
    """Commit the model was trained from; GIT_COMMIT can be injected where .git is unavailable (Docker)."""
    injected = os.getenv("GIT_COMMIT") or os.getenv("RENDER_GIT_COMMIT")  # the latter is set by Render builds
    if injected and injected != "unknown":
        return injected[:7]
    try:
        out = subprocess.run(
            ["git", "rev-parse", "--short", "HEAD"], capture_output=True, text=True, check=True, cwd=Path(__file__).parent
        )
        return out.stdout.strip()
    except (OSError, subprocess.CalledProcessError):
        return "unknown"


def risk_labels(y, low_cut: float, high_cut: float) -> np.ndarray:
    return np.where(y <= low_cut, RISK_LABELS[0], np.where(y <= high_cut, RISK_LABELS[1], RISK_LABELS[2]))


def describe_clusters(kmeans: KMeans, scaler: StandardScaler):
    """Order clusters from highest to lowest overall exposure and give each a readable label."""
    z = kmeans.cluster_centers_
    order = np.argsort(-z.sum(axis=1))  # new id 0 = highest combined exposure
    centres = scaler.inverse_transform(z)
    profiles = []
    for new_id, old_id in enumerate(order):
        dominant = POLLUTANTS[int(np.argmax(z[old_id]))]
        profiles.append(
            {
                "cluster": new_id,
                "label": f"Exposure profile led by {POLLUTANT_NAMES[dominant]}",
                "centroid": {p: round(float(v), 1) for p, v in zip(POLLUTANTS, centres[old_id])},
            }
        )
    remap = {int(old): new for new, old in enumerate(order)}
    return profiles, remap


def train(data_path=DEFAULT_DATA, out_dir=ARTIFACT_DIR, n_estimators: int = 200, seed: int = SEED) -> dict:
    df = load_raw(data_path)
    country_enc = LabelEncoder().fit(df["country"])
    region_enc = LabelEncoder().fit(df["region_name"])
    X = build_features(df, country_enc, region_enc)
    y = df[TARGET].to_numpy()

    regressor = RandomForestRegressor(n_estimators=n_estimators, random_state=seed, n_jobs=-1).fit(X, y)

    low_cut, high_cut = (float(q) for q in np.quantile(y, [1 / 3, 2 / 3]))
    classifier = RandomForestClassifier(n_estimators=n_estimators, random_state=seed, n_jobs=-1).fit(
        X, risk_labels(y, low_cut, high_cut)
    )

    pollutant_scaler = StandardScaler().fit(df[POLLUTANTS])
    kmeans = KMeans(n_clusters=N_CLUSTERS, n_init=10, random_state=seed).fit(pollutant_scaler.transform(df[POLLUTANTS]))
    cluster_profiles, cluster_remap = describe_clusters(kmeans, pollutant_scaler)

    country_region = df.drop_duplicates("country").set_index("country")["region_name"].to_dict()
    bundle = {
        "regressor": regressor,
        "classifier": classifier,
        "kmeans": kmeans,
        "pollutant_scaler": pollutant_scaler,
        "country_encoder": country_enc,
        "region_encoder": region_enc,
        "country_region": country_region,
        "risk_thresholds": {"low_max": low_cut, "moderate_max": high_cut},
        "cluster_profiles": cluster_profiles,
        "cluster_remap": cluster_remap,
        "features": FEATURES,
        "meta": {
            "model_version": MODEL_VERSION,
            "git_commit": _git_commit(),
            "dataset_sha256": _sha256(data_path),
            "training_params": {"n_estimators": n_estimators, "seed": seed, "n_clusters": N_CLUSTERS},
            "trained_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
            "sklearn_version": sklearn.__version__,
            "n_rows": len(df),
            "n_countries": int(df["country"].nunique()),
            "year_range": [int(df["year"].min()), int(df["year"].max())],
            "target_unit": "DALY rate",
        },
    }
    out_dir = Path(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    joblib.dump(bundle, out_dir / BUNDLE_NAME, compress=3)
    (out_dir / "metadata.json").write_text(
        json.dumps(
            {k: bundle[k] for k in ("risk_thresholds", "cluster_profiles", "features", "meta")}, indent=2
        )
    )
    return bundle


if __name__ == "__main__":
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--data", default=str(DEFAULT_DATA))
    ap.add_argument("--out", default=str(ARTIFACT_DIR))
    ap.add_argument("--trees", type=int, default=200)
    args = ap.parse_args()
    b = train(args.data, args.out, args.trees)
    print(f"Saved {Path(args.out) / BUNDLE_NAME}  rows={b['meta']['n_rows']}  thresholds={b['risk_thresholds']}")
