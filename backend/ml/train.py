"""Train the three models used by the API and write them to backend/artifacts/.

    python -m ml.train                # quick path: train from the raw extract with params.yaml settings
    python -m ml.pipeline run         # full path: validate -> train -> evaluate -> gate, with tracking

Differences from the 2024 coursework version (see docs/v1-vs-v2.md):
  * trees are trained on raw values: no scaler, so no inverse-transform step to get wrong
  * the same FEATURES list is used for training and serving
  * rows duplicated in the source extract are removed
  * every hyper-parameter comes from params.yaml and is recorded in the bundle with the dataset hash,
    git commit, library versions and a prediction fingerprint, so a run can be reproduced and verified
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import platform
import subprocess
from datetime import datetime, timezone
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
import sklearn
from sklearn.cluster import KMeans
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.preprocessing import LabelEncoder, StandardScaler

from ml.data import (
    DEFAULT_DATA,
    FEATURES,
    POLLUTANTS,
    RISK_LABELS,
    TARGET,
    build_features,
    load_table,
    quantile_profile,
    sha256_file,
)

ARTIFACT_DIR = Path(__file__).resolve().parents[1] / "artifacts"
BUNDLE_NAME = "model_bundle.joblib"
METADATA_NAME = "metadata.json"
MODEL_VERSION = "2.1.0"  # bump when features, targets or training procedure change
BUNDLE_SCHEMA = 2  # bump when the bundle layout changes (checked by the serving API)
SEED = 42
POLLUTANT_NAMES = {"exposure_mean_no2": "NO2", "exposure_mean_ozone": "ozone", "exposure_mean_pm25": "PM2.5"}
REQUIRED_BUNDLE_KEYS = (
    "regressor", "classifier", "kmeans", "pollutant_scaler", "country_encoder", "region_encoder",
    "country_region", "risk_thresholds", "cluster_profiles", "cluster_remap", "features", "feature_ranges", "meta",
)  # fmt: skip


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


def model_fingerprint(bundle: dict, X: pd.DataFrame) -> str:
    """Hash of every model's output on the training inputs.

    Two runs with the same code, data, params and library versions must produce the same fingerprint;
    this is how reproducibility is verified (tests/test_reproducibility.py) and compared across runs.
    """
    h = hashlib.sha256()
    h.update(np.round(bundle["regressor"].predict(X), 6).tobytes())
    h.update(np.round(bundle["classifier"].predict_proba(X), 6).tobytes())
    h.update(bundle["kmeans"].predict(bundle["pollutant_scaler"].transform(X[POLLUTANTS])).astype(np.int64).tobytes())
    return h.hexdigest()


def _forest_kwargs(forest_cfg, n_estimators: int | None, seed: int) -> dict:
    return {
        "n_estimators": n_estimators or forest_cfg.n_estimators,
        "max_depth": forest_cfg.max_depth,
        "min_samples_leaf": forest_cfg.min_samples_leaf,
        "random_state": seed,
        "n_jobs": -1,
    }


def train(
    data_path=DEFAULT_DATA,
    out_dir=ARTIFACT_DIR,
    n_estimators: int | None = None,
    seed: int | None = None,
    *,
    cfg=None,
    lineage: dict | None = None,
) -> dict:
    """Train and save the bundle.

    ``cfg`` is an ``ml.config.TrainConfig`` (defaults are used when omitted). ``n_estimators`` and ``seed`` are
    convenience overrides for both forests. ``lineage`` (from the validate stage) is recorded in the metadata.
    """
    if cfg is None:
        from ml.config import TrainConfig

        cfg = TrainConfig()
    seed = cfg.seed if seed is None else seed

    df = load_table(data_path)
    country_enc = LabelEncoder().fit(df["country"])
    region_enc = LabelEncoder().fit(df["region_name"])
    X = build_features(df, country_enc, region_enc)
    y = df[TARGET].to_numpy()

    regressor = RandomForestRegressor(**_forest_kwargs(cfg.regressor, n_estimators, seed)).fit(X, y)

    low_cut, high_cut = (float(q) for q in np.quantile(y, [1 / 3, 2 / 3]))
    classifier = RandomForestClassifier(**_forest_kwargs(cfg.classifier, n_estimators, seed)).fit(
        X, risk_labels(y, low_cut, high_cut)
    )

    pollutant_scaler = StandardScaler().fit(df[POLLUTANTS])
    kmeans = KMeans(n_clusters=cfg.n_clusters, n_init=10, random_state=seed).fit(
        pollutant_scaler.transform(df[POLLUTANTS])
    )
    cluster_profiles, cluster_remap = describe_clusters(kmeans, pollutant_scaler)

    training_params = cfg.model_dump()
    training_params["seed"] = seed
    if n_estimators:
        training_params["regressor"]["n_estimators"] = training_params["classifier"]["n_estimators"] = n_estimators

    lineage = dict(lineage or {})
    if Path(data_path).suffix == ".json":
        lineage.setdefault("source_sha256", sha256_file(data_path))

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
        # Used by the API to warn about out-of-distribution inputs and by ml.drift as the reference distribution.
        "feature_ranges": {c: [float(df[c].min()), float(df[c].max())] for c in ["year", *POLLUTANTS]},
        "reference_profile": {c: quantile_profile(df[c], cfg.drift_bins) for c in ["year", *POLLUTANTS]},
        "meta": {
            "model_version": MODEL_VERSION,
            "bundle_schema": BUNDLE_SCHEMA,
            "git_commit": _git_commit(),
            "dataset_sha256": lineage.get("source_sha256"),
            "data_lineage": lineage,
            "training_params": training_params,
            "trained_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
            "sklearn_version": sklearn.__version__,
            "python_version": platform.python_version(),
            "n_rows": len(df),
            "n_countries": int(df["country"].nunique()),
            "year_range": [int(df["year"].min()), int(df["year"].max())],
            "target_unit": "DALY rate",
        },
    }
    bundle["meta"]["model_fingerprint"] = model_fingerprint(bundle, X)

    out_dir = Path(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    joblib.dump(bundle, out_dir / BUNDLE_NAME, compress=3)
    metadata = {k: bundle[k] for k in ("risk_thresholds", "cluster_profiles", "features", "feature_ranges", "meta")}
    (out_dir / METADATA_NAME).write_text(json.dumps(metadata, indent=2))
    return bundle


if __name__ == "__main__":
    from ml.config import DEFAULT_PARAMS, load_config

    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--data", default=str(DEFAULT_DATA))
    ap.add_argument("--out", default=str(ARTIFACT_DIR))
    ap.add_argument("--params", default=str(DEFAULT_PARAMS))
    ap.add_argument("--trees", type=int, default=None, help="override n_estimators for both forests")
    args = ap.parse_args()
    b = train(args.data, args.out, args.trees, cfg=load_config(args.params).train)
    print(f"Saved {Path(args.out) / BUNDLE_NAME}  rows={b['meta']['n_rows']}  thresholds={b['risk_thresholds']}")
