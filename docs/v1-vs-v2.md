# v1 (2024 coursework) vs v2 (2026 rebuild)

v1 was built in 2024 for the COS30049 *Computing Technology Innovation Project* unit at Swinburne. It worked well enough to demo. Two years later I went back, tested it properly, and found problems I could not see then. This page records
what I found and what changed. I'm keeping it public on purpose: finding and fixing your own old mistakes is part of the job.

## What I found in v1

| # | Finding | Evidence | Severity |
|---|---|---|---|
| 1 | **Inputs were fed to the model in the wrong column order.** The models were trained on `[year, country_id, region_id, NO2, ozone, PM2.5]`, but the service built `[year, NO2, ozone, PM2.5, country_id, region_id]` from the request dict. The model therefore read NO2 as the country and the country code as ozone. | Replayed the original service code against the original trained models | **High** |
| 2 | **The output was un-scaled with the wrong scaler column.** The scaler had four features (year + 3 pollutants) but the code treated its last column, PM2.5, as the health-burden column. | Same replay | **High** |
| 3 | Combined effect: for Afghanistan 1990 (observed 15,700) the v1 service returned **1,053**. Over 300 random country-years the served values were uncorrelated with the truth (r = 0.15, R² = -1.37). Fed correctly, the same model returns 15,570. | Same replay | **High** |
| 4 | The 2024 notebook evaluated with a **random split** on panel data. Reproduced here, that setup gives R² 0.92 / 93% accuracy; on unseen countries the same model scores R² 0.31 / 60% accuracy, and it does not beat a region average. | `ml/evaluate.py`, [evaluation.md](evaluation.md) | Medium |
| 5 | Australia was listed twice per year (as its own "region" and under Western Pacific) with identical values: 31 duplicated country-years that leaked across train/test. | `ml/data.py` | Low |
| 6 | About 7-8% of each pollutant column looks corrupted (decimal points lost in the export), so the values and the unit labels shown in the UI cannot be taken at face value. The health-burden column is clean. | `python -m ml.data_quality`, [data-quality.md](data-quality.md) | Medium |
| 7 | The NewsAPI key was printed to the server log on import, and the unused `/predict_historical_and_future` router imported a model that did not exist. | Code review | Medium |
| 8 | Exceptions were returned verbatim as HTTP 500, outbound HTTP calls had no timeouts, CORS was hard-coded, and there were no tests. | Code review | Low |

## What v2 changes

| Area | v1 | v2 |
|---|---|---|
| Feature order | implicit (dict order) | single `FEATURES` list shared by training and serving, with a regression test |
| Scaling | `StandardScaler` + manual inverse transform | none for tree models (not needed), so there is nothing to invert; the API returns real DALY-rate units |
| Validation | untyped `dict` | Pydantic models; unknown country or a country/region mismatch returns 422 |
| Evaluation | random split | random + held-out-country + temporal splits, plus trivial baselines |
| Honesty | no caveats | every prediction response carries a disclaimer; `/model_info` exposes thresholds and clusters |
| Cluster output | an integer | integer + label + centroid (clusters ordered by total exposure) |
| Secrets | key printed to log | keys only from env, never logged; `.env.example` provided |
| External APIs | no timeouts, 500s | timeouts, 502/503/404 with clean messages, US EPA AQI bands |
| Ops | none | `/health`, configurable CORS, GitHub Actions CI |
| Tests | 0 | 31 backend tests |
| Frontend | dataset duplicated inside the UI, 10 unused dependencies, a 5.7 MB video | one shared dataset, unused dependencies removed, optional hero video |

## Thanks

The project began as a three-person group assignment. Christine Bong and William Bakos were my teammates on the unit, and I'm grateful for
their help.
