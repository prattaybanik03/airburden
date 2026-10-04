# Data quality finding

`python -m ml.data_quality` (from `backend/`) flags pollutant readings that fall to under 30% of **both** neighbouring years for the same country.

| Column | Suspicious rows | Share | Countries affected |
|---|---|---|---|
| NO2 | 399 | 7.5% | 158 |
| Ozone | 418 | 7.8% | 164 |
| PM2.5 | 432 | 8.1% | 166 |
| Health burden | 0 | 0% | 0 |

Example, Afghanistan NO2, 1992-1998: `117, 114, 11, 106, 10, 944, 88`. A smooth series that has been written with its decimal point
removed (11.7, 11.4, 11.0, 10.6, 10.0, 9.44, 8.8) looks exactly like this. The same pattern explains why PM2.5 for Afghanistan appears as ~640
under a "µg/m3" label (about 64 µg/m3 is plausible; 640 is not).

## What I did and did not do

* I did **not** silently "repair" the data. The magnitude pattern depends on how many digits each value had, so a heuristic fix risks
  inventing numbers. My own quick attempt rescaled values using each country's median and changed the picture only a little (pollutants-only
  forecast R² 0.02 to 0.17, held-out countries 0.14 to 0.18), which is not enough to change the conclusions in [evaluation.md](evaluation.md).
* The unit labels in the UI come from the source file and should not be trusted until the data is re-sourced.
* Proper fix: re-download the original files from the publisher, load them with explicit numeric parsing, re-run `make evaluate`.
