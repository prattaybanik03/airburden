"""Release gates and the model card.

A model is only promoted if it clears every threshold in ``params.yaml: gates``. The thresholds are deliberately
set on the *honest* splits (held-out countries, temporal), not just the flattering random split, so a change that
makes the model memorise countries harder cannot pass by looking good on random rows.
"""
from __future__ import annotations

from datetime import datetime, timezone


def check_gates(metrics: dict[str, float], gates) -> dict:
    """Return {"passed": bool, "checks": [...]}. ``gates`` is an ``ml.config.GateConfig``."""
    rules = [
        ("r2_random", ">=", gates.min_r2_random),
        ("r2_held_out", ">=", gates.min_r2_held_out),
        ("r2_temporal", ">=", gates.min_r2_temporal),
        ("accuracy_held_out", ">=", gates.min_accuracy_held_out),
        ("r2_held_out_std", "<=", gates.max_r2_held_out_std),
    ]
    checks = []
    for metric, op, threshold in rules:
        value = metrics.get(metric)
        ok = value is not None and (value >= threshold if op == ">=" else value <= threshold)
        checks.append({"metric": metric, "value": value, "op": op, "threshold": threshold, "passed": bool(ok)})
    return {"passed": all(c["passed"] for c in checks), "checks": checks}


def render_model_card(meta: dict, metrics: dict, gate: dict, validation: dict) -> str:
    """Markdown model card (Mitchell et al., 2019 layout, trimmed to what this project can state honestly)."""
    tp = meta.get("training_params", {})
    lineage = meta.get("data_lineage", {})
    status = "PASSED" if gate["passed"] else "FAILED"
    gate_rows = "\n".join(
        f"| `{c['metric']}` | {c['value']} | {c['op']} {c['threshold']} | {'pass' if c['passed'] else '**FAIL**'} |"
        for c in gate["checks"]
    )
    dq = validation.get("suspicious_share", {})
    dq_rows = "\n".join(f"| `{k}` | {v:.1%} |" for k, v in dq.items())
    return f"""# Model card: AirBurden health-burden models v{meta.get('model_version')}

_Generated {datetime.now(timezone.utc):%Y-%m-%d %H:%M} UTC by `python -m ml.pipeline gate`._

## Overview

| | |
|---|---|
| Models | Random Forest regressor (DALY rate), Random Forest classifier (risk tercile), K-Means exposure profiles |
| Model version | `{meta.get('model_version')}` |
| Code commit | `{meta.get('git_commit')}` |
| Dataset SHA-256 | `{meta.get('dataset_sha256')}` |
| Pollutant repair policy | `{lineage.get('pollutant_repair', 'none')}` |
| Training rows / countries | {meta.get('n_rows')} / {meta.get('n_countries')} ({meta.get('year_range')}) |
| Trees (regressor / classifier) | {tp.get('regressor', {}).get('n_estimators')} / {tp.get('classifier', {}).get('n_estimators')}, seed {tp.get('seed')} |
| Prediction fingerprint | `{str(meta.get('model_fingerprint'))[:16]}` |
| scikit-learn / Python | {meta.get('sklearn_version')} / {meta.get('python_version')} |

## Intended use

Exploratory analysis of how country-level air-pollution exposure relates to the attributable health burden,
for countries and years **inside** the training data. It is **not** a medical, clinical or policy tool, and it is
not validated for countries it has not seen.

## Evaluation

| Metric | Value |
|---|---|
| R² random split (optimistic: the model sees every country) | {metrics.get('r2_random')} |
| R² held-out countries (mean ± std over folds) | {metrics.get('r2_held_out')} ± {metrics.get('r2_held_out_std')} |
| R² temporal (forecast the last years) | {metrics.get('r2_temporal')} |
| Baseline R²: last value carried forward (temporal) | {metrics.get('baseline_r2_last_value')} |
| Baseline R²: region mean (held-out countries) | {metrics.get('baseline_r2_region_mean')} |
| Risk accuracy random / held-out / temporal (chance 0.33) | {metrics.get('accuracy_random')} / {metrics.get('accuracy_held_out')} / {metrics.get('accuracy_temporal')} |

## Release gates: {status}

| Metric | Value | Rule | Result |
|---|---|---|---|
{gate_rows}

## Data quality at training time

Share of each column flagged as a suspicious isolated drop (see `docs/data-quality.md`):

| Column | Suspicious |
|---|---|
{dq_rows}

## Limitations

* Ecological, country-level data: associations here say nothing about individuals.
* On unseen countries pollutant exposure adds little; a naive "last value carried forward" forecast is hard to beat.
* Roughly 7-8% of pollutant values in the source extract look corrupted; the pollutant units are unreliable.
"""
