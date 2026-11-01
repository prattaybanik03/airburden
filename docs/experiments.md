# Experiments

Each experiment is a pipeline run with a params override, tracked in MLflow and compared with the default run.
Reproduce any row with the command shown.

## EXP-001: does repairing the corrupted pollutant values help? (2026-11-01)

**Question.** About 7-8% of each pollutant column looks corrupted (isolated drops to a fraction of both
neighbouring years, consistent with lost decimal points; see [data-quality.md](data-quality.md)). Does
replacing those values with a within-country linear interpolation improve the models?

**Run.**

```bash
python -m ml.pipeline run                                          # baseline: data.pollutant_repair=none
python -m ml.pipeline run --set data.pollutant_repair=interpolate --artifacts artifacts-repair
```

The repair replaced 399 NO2, 418 ozone and 432 PM2.5 values. The suspicious share fell from 7.5-8.1% to under 0.1%.
Everything else (seeds, hyper-parameters, splits) was identical.

**Results (R²).**

| Features | Split | none | interpolate | Δ |
|---|---|---|---|---|
| App features (served model) | random | 0.921 | 0.962 | +0.041 |
| | held-out countries | 0.306 | 0.322 | +0.017 |
| | temporal | 0.741 | 0.739 | -0.003 |
| No country id | random | 0.856 | 0.920 | +0.064 |
| | held-out countries | 0.434 | 0.424 | -0.010 |
| | temporal | 0.618 | 0.648 | +0.030 |
| Pollutants only | random | 0.646 | 0.744 | +0.098 |
| | held-out countries | 0.140 | 0.137 | -0.003 |
| | temporal | 0.022 | 0.108 | +0.086 |

Risk accuracy on held-out countries: 0.595 → 0.609. Both runs pass every release gate.

**Conclusion.** The repair clearly removes noise. Pollutant-only models improve the most, which fits the
corruption hypothesis. **But generalisation to unseen countries does not change** (held-out R² moves by less
than one fold's standard deviation of 0.12). The gap between the random and held-out splits comes from
structure, not noise: the model mostly learns country identity. Better data alone will not fix it. Covariates
(income, age structure) or within-country modelling are the next steps.

**Decision.** Keep `pollutant_repair: none` as the default. The corruption is a strong hypothesis but has not been
confirmed against the publisher's files. The gains are on the split that matters least, and changing the
served model's data needs that confirmation first. The repair stays available as a one-line param change, and
re-sourcing the data remains on the roadmap.
