"""Honest evaluation of the health-burden models.

    python -m ml.evaluate             # writes ../docs/evaluation_results.json

The 2024 notebook used a random train/test split. On panel data (the same country observed
every year) that lets the model memorise each country. This script compares:

  random          random 70/30 row split (what the notebook reported)
  held-out        GroupKFold by country: test countries are never seen in training
  temporal        train on the first 24 years, test on the last 7 (forecasting)

and adds two trivial baselines that any model should beat.
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path

import numpy as np
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.metrics import accuracy_score, mean_absolute_error, r2_score
from sklearn.model_selection import GroupKFold, train_test_split
from sklearn.preprocessing import LabelEncoder

from ml.data import DEFAULT_DATA, FEATURES, POLLUTANTS, REPO_ROOT, TARGET, build_features, load_raw
from ml.train import risk_labels

SEED = 42
TEST_YEARS = 7

FEATURE_SETS = {
    "app features (year, country id, region id, 3 pollutants)": FEATURES,
    "no country id (year, region id, 3 pollutants)": ["year", "region_encoded", *POLLUTANTS],
    "pollutants only": POLLUTANTS,
    "year + region only (no pollutants)": ["year", "region_encoded"],
}


def _rf_reg():
    return RandomForestRegressor(n_estimators=100, random_state=SEED, n_jobs=-1)


def _score(y_true, y_pred) -> dict:
    return {"r2": float(r2_score(y_true, y_pred)), "mae": float(mean_absolute_error(y_true, y_pred))}


def evaluate(data_path=DEFAULT_DATA) -> dict:
    df = load_raw(data_path)
    X = build_features(df, LabelEncoder().fit(df["country"]), LabelEncoder().fit(df["region_name"]))
    y = df[TARGET].to_numpy()
    groups = df["country"].to_numpy()
    low, high = np.quantile(y, [1 / 3, 2 / 3])
    y_cls = risk_labels(y, low, high)
    res: dict = {"n_rows": len(df), "n_countries": int(df["country"].nunique()), "regression": {}, "classification": {}}

    # --- regression ---
    idx_tr, idx_te = train_test_split(np.arange(len(df)), test_size=0.3, random_state=SEED)
    gkf = list(GroupKFold(n_splits=5).split(X, y, groups))
    cutoff = df["year"].max() - TEST_YEARS
    tr_t, te_t = np.where(df["year"] <= cutoff)[0], np.where(df["year"] > cutoff)[0]

    for name, cols in FEATURE_SETS.items():
        Xs = X[cols]
        row = {}
        m = _rf_reg().fit(Xs.iloc[idx_tr], y[idx_tr])
        row["random"] = _score(y[idx_te], m.predict(Xs.iloc[idx_te]))
        scores = []
        for tr, te in gkf:
            scores.append(_score(y[te], _rf_reg().fit(Xs.iloc[tr], y[tr]).predict(Xs.iloc[te])))
        row["held_out_countries"] = {
            "r2": float(np.mean([s["r2"] for s in scores])),
            "r2_std": float(np.std([s["r2"] for s in scores])),
            "mae": float(np.mean([s["mae"] for s in scores])),
        }
        row["temporal"] = _score(y[te_t], _rf_reg().fit(Xs.iloc[tr_t], y[tr_t]).predict(Xs.iloc[te_t]))
        res["regression"][name] = row

    # baselines for the temporal split: per-country mean of the training years, and "last value carried forward"
    train_df, test_df = df.iloc[tr_t], df.iloc[te_t]
    country_mean = test_df["country"].map(train_df.groupby("country")[TARGET].mean())
    last_value = test_df["country"].map(train_df.sort_values("year").groupby("country")[TARGET].last())
    res["baselines_temporal"] = {
        "country mean of training years": _score(test_df[TARGET], country_mean),
        "last observed value carried forward": _score(test_df[TARGET], last_value),
    }
    # baseline for held-out countries: region mean
    scores = []
    for tr, te in gkf:
        reg_mean = df.iloc[te]["region_name"].map(df.iloc[tr].groupby("region_name")[TARGET].mean())
        scores.append(_score(y[te], reg_mean))
    res["baselines_held_out"] = {
        "region mean": {"r2": float(np.mean([s["r2"] for s in scores])), "mae": float(np.mean([s["mae"] for s in scores]))}
    }

    # --- classification (risk tercile) ---
    clf = lambda: RandomForestClassifier(n_estimators=100, random_state=SEED, n_jobs=-1)
    acc_random = accuracy_score(y_cls[idx_te], clf().fit(X.iloc[idx_tr], y_cls[idx_tr]).predict(X.iloc[idx_te]))
    accs = [accuracy_score(y_cls[te], clf().fit(X.iloc[tr], y_cls[tr]).predict(X.iloc[te])) for tr, te in gkf]
    acc_t = accuracy_score(y_cls[te_t], clf().fit(X.iloc[tr_t], y_cls[tr_t]).predict(X.iloc[te_t]))
    res["classification"] = {
        "random": float(acc_random),
        "held_out_countries": {"accuracy": float(np.mean(accs)), "std": float(np.std(accs))},
        "temporal": float(acc_t),
        "chance": 1 / 3,
    }
    res["temporal_split"] = {"train_years": [int(df["year"].min()), int(cutoff)], "test_years": [int(cutoff) + 1, int(df["year"].max())]}
    return res


def to_markdown(res: dict) -> str:
    lines = ["| Features | Random split R² | Held-out countries R² | Temporal split R² |", "|---|---|---|---|"]
    for name, r in res["regression"].items():
        lines.append(
            f"| {name} | {r['random']['r2']:.2f} | {r['held_out_countries']['r2']:.2f} ± {r['held_out_countries']['r2_std']:.2f} | {r['temporal']['r2']:.2f} |"
        )
    return "\n".join(lines)


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--data", default=str(DEFAULT_DATA))
    ap.add_argument("--out", default=str(REPO_ROOT / "docs" / "evaluation_results.json"))
    a = ap.parse_args()
    out = evaluate(a.data)
    Path(a.out).write_text(json.dumps(out, indent=2))
    print(to_markdown(out))
    print(json.dumps({k: out[k] for k in ("baselines_temporal", "baselines_held_out", "classification", "temporal_split")}, indent=2))
