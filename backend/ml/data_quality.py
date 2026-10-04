"""Flag suspicious values in the dataset: pollutant readings that drop to a fraction of BOTH neighbouring years.

    python -m ml.data_quality

In the State of Global Air extract used here, roughly 7-8% of each pollutant column looks mangled
(e.g. Afghanistan NO2 1992-1998: 117, 114, 11, 106, 10, 944, 88), which suggests lost decimal points /
inconsistent scaling in the export. The health-burden column shows no such drops. See docs/data-quality.md.
"""
from __future__ import annotations

import pandas as pd

from ml.data import POLLUTANTS, TARGET, load_raw


def isolated_drops(df: pd.DataFrame, column: str, ratio: float = 0.3) -> pd.Series:
    """True where a value is below `ratio` x the previous AND the next year's value for the same country."""
    df = df.sort_values(["country", "year"])
    g = df.groupby("country")[column]
    flag = (df[column] < ratio * g.shift(1)) & (df[column] < ratio * g.shift(-1))
    return flag.reindex(df.index)


def summary(df: pd.DataFrame | None = None) -> dict:
    df = load_raw() if df is None else df
    out = {}
    for col in [*POLLUTANTS, TARGET]:
        flag = isolated_drops(df, col)
        out[col] = {"rows": int(flag.sum()), "share": round(float(flag.mean()), 4), "countries": int(df[flag.reindex(df.index)].country.nunique())}
    return out


if __name__ == "__main__":
    for col, s in summary().items():
        print(f"{col:22s} suspicious rows: {s['rows']:4d} ({s['share']:.1%}) in {s['countries']} countries")
