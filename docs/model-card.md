# Model card: AirBurden health-burden models v2.1.0

_Generated 2026-11-01 12:25 UTC by `python -m ml.pipeline gate`._

## Overview

| | |
|---|---|
| Models | Random Forest regressor (DALY rate), Random Forest classifier (risk tercile), K-Means exposure profiles |
| Model version | `2.1.0` |
| Code commit | `d17c019` |
| Dataset SHA-256 | `337f1e0608fd2394eb5c27c4e39b5e86385ab2a6398630bbf2f08bd146bd85d3` |
| Pollutant repair policy | `none` |
| Training rows / countries | 5332 / 172 ([1990, 2020]) |
| Trees (regressor / classifier) | 200 / 200, seed 42 |
| Prediction fingerprint | `885cf7f9d2f9ecee` |
| scikit-learn / Python | 1.9.1 / 3.12.3 |

## Intended use

Exploratory analysis of how country-level air-pollution exposure relates to the attributable health burden,
for countries and years **inside** the training data. It is **not** a medical, clinical or policy tool, and it is
not validated for countries it has not seen.

## Evaluation

| Metric | Value |
|---|---|
| R² random split (optimistic: the model sees every country) | 0.9206 |
| R² held-out countries (mean ± std over folds) | 0.3056 ± 0.1221 |
| R² temporal (forecast the last years) | 0.7413 |
| Baseline R²: last value carried forward (temporal) | 0.9371 |
| Baseline R²: region mean (held-out countries) | 0.293 |
| Risk accuracy random / held-out / temporal (chance 0.33) | 0.9281 / 0.5952 / 0.8264 |

## Release gates: PASSED

| Metric | Value | Rule | Result |
|---|---|---|---|
| `r2_random` | 0.9206 | >= 0.85 | pass |
| `r2_held_out` | 0.3056 | >= 0.15 | pass |
| `r2_temporal` | 0.7413 | >= 0.6 | pass |
| `accuracy_held_out` | 0.5952 | >= 0.45 | pass |
| `r2_held_out_std` | 0.1221 | <= 0.4 | pass |

## Data quality at training time

Share of each column flagged as a suspicious isolated drop (see `docs/data-quality.md`):

| Column | Suspicious |
|---|---|
| `exposure_mean_no2` | 7.5% |
| `exposure_mean_ozone` | 7.8% |
| `exposure_mean_pm25` | 8.1% |
| `health_burden_mean` | 0.0% |

## Limitations

* Ecological, country-level data: associations here say nothing about individuals.
* On unseen countries pollutant exposure adds little; a naive "last value carried forward" forecast is hard to beat.
* Roughly 7-8% of pollutant values in the source extract look corrupted; the pollutant units are unreliable.
