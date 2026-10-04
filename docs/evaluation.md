# Model evaluation

Reproduce with `cd backend && python -m ml.evaluate` (writes `docs/evaluation_results.json`).

Data: 5,332 country-year rows, 172 countries, 1990-2020 (after removing duplicated Australia rows, see [v1-vs-v2](v1-vs-v2.md)).
Model: Random Forest, 100 trees, `random_state=42`. Target: health burden (DALY rate).

## Why three different splits?

The data is a **panel**: every country appears in every year. A random row split puts 2012 Brazil in the test set
and 2011 and 2013 Brazil in the training set, so the model only has to recognise *which country this is*.

| Split | Question it answers |
|---|---|
| Random 70/30 | "Can the model fill in a missing row of a country it has already seen?" (the 2024 notebook's setup) |
| Held-out countries (5-fold `GroupKFold` by country) | "Does it generalise to a country it has never seen?" |
| Temporal (train 1990-2013, test 2014-2020) | "Can it forecast later years for countries it has seen?" |

## Regression results (R², higher is better)

| Features | Random split | Held-out countries | Temporal |
|---|---|---|---|
| **App features** (year, country id, region id, NO2, ozone, PM2.5) | **0.92** | 0.31 ± 0.12 | 0.74 |
| No country id (year, region id, 3 pollutants) | 0.86 | **0.43 ± 0.09** | 0.62 |
| Pollutants only | 0.65 | 0.14 ± 0.07 | 0.02 |
| Year + region only (no pollutants) | 0.36 | 0.38 ± 0.18 | 0.36 |

### Baselines that any model should beat

| Setting | Baseline | R² | MAE | Random Forest (app features) |
|---|---|---|---|---|
| Temporal | Last observed value carried forward | **0.94** | 333 | 0.74 (MAE 712) |
| Temporal | Country mean of training years | 0.04 | 1,409 | 0.74 |
| Held-out countries | Region mean | 0.29 | 1,891 | 0.31 (MAE 1,743) |

## Classification (risk tercile: Low / Moderate / High)

| Split | Accuracy |
|---|---|
| Random | 0.93 |
| Held-out countries | 0.60 ± 0.04 (chance = 0.33) |
| Temporal | 0.83 |

## What this means

1. **The headline score depends on the split.** The same model scores R² 0.92 on a random split and 0.31 on unseen countries.
2. **Pollutant exposure carries little independent signal.** Pollutants alone reach 0.65 on a random split, because exposure
   levels identify the country. On unseen countries that falls to 0.14, and for forecasting to 0.02.
3. **The model does not beat trivial baselines.** Carrying a country's last observed value forward (R² 0.94) is far better than the
   Random Forest (0.74) for forecasting, and a region average (0.29) is about as good as the model (0.31) on unseen countries.
4. **The data is ecological and confounded.** Country-year averages cannot show that pollution *causes* a health burden. Income,
   healthcare access, age structure and smoking all move with pollution.

## Intended use

An exploratory demo of a full-stack ML application (data, training, API, UI). It is **not** a validated health-risk predictor and
the API says so in every prediction response (`disclaimer`) and in `/model_info`.

## Next steps worth trying

* Model the **change** in burden against the change in exposure within a country (fixed-effects / panel regression), which removes
  country identity from the problem.
* Add covariates (income, age structure, health expenditure). The 2024 notebook already explored a household-income dataset.
* Report prediction intervals (quantile forest or conformal prediction) instead of a point estimate.
* Treat the tercile classifier as what it is, a discretisation of the regression target, and say so in the UI.
