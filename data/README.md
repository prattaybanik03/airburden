# Data

`dataset.json` holds country-level annual estimates (1990-2020) for 172 countries:

| Field | Meaning |
|---|---|
| `country`, `iso3`, `region_name` | Country and WHO region |
| `exposure_mean_no2`, `exposure_mean_ozone`, `exposure_mean_pm25` | Population-weighted exposure estimates (see source for units) |
| `health_burden_mean` | Burden of disease attributable to air pollution, as a **DALY rate** (`units_*` fields keep the source labels) |

## Source and attribution

Extract of the **State of Global Air** data published by the Health Effects Institute (HEI) with the Institute for Health Metrics and
Evaluation (IHME). Citation format requested by the publisher:

> Health Effects Institute. 2024. State of Global Air 2024. Available: www.stateofglobalair.org

This is an extract that was converted to JSON for the project. The extract contains the Australia rows twice
(once under a pseudo-region named "Australia"); `backend/ml/data.py` removes the duplicates at load time and the original file is
kept unchanged here.

The publisher's [FAQ](https://www.stateofglobalair.org/faq) allows distribution "without alteration, provided that proper credit is given", so `dataset.json` is included here unmodified. Any cleaning happens in code at load time, never in the file.

## Known issue

About 7-8% of each pollutant column looks corrupted in this extract (lost decimal points; PM2.5 values are ~10x too large for the stated unit). See `docs/data-quality.md`. Treat the pollutant units as unreliable until the data is re-sourced from the publisher.
