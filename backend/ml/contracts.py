"""Data contracts for the pipeline, expressed as pandera schemas.

Two contracts are enforced:

* ``RAW_CONTRACT`` - what the source extract must look like before we touch it (types, ranges, allowed regions,
  no duplicated records). A failure here means the upstream file changed and nobody should train on it.
* ``CLEAN_CONTRACT`` - what the cleaned modelling table must look like (one row per country-year, one region per
  country, a balanced panel). Training, evaluation and serving all assume these properties.

Validation is *lazy*: every violation is collected and reported, not just the first one.
"""
from __future__ import annotations

from typing import Any

import pandas as pd
import pandera.pandas as pa
from pandera.errors import SchemaErrors

from ml.data import POLLUTANTS, TARGET

WHO_REGIONS = [
    "African Region",
    "Eastern Mediterranean Region",
    "European Region",
    "Region of the Americas",
    "SouthEast Asia Region",
    "Western Pacific Region",
]
MIN_YEAR, MAX_YEAR = 1990, 2100

_pollutant = pa.Column(float, [pa.Check.ge(0), pa.Check.le(10_000)], coerce=True, nullable=False)
_common_columns = {
    "country": pa.Column(str, pa.Check.str_length(min_value=1), nullable=False),
    "year": pa.Column(int, pa.Check.in_range(MIN_YEAR, MAX_YEAR), coerce=True, nullable=False),
    **{p: _pollutant for p in POLLUTANTS},
    TARGET: pa.Column(float, [pa.Check.gt(0), pa.Check.le(100_000)], coerce=True, nullable=False),
}

RAW_CONTRACT = pa.DataFrameSchema(
    {
        **_common_columns,
        "iso3": pa.Column(str, pa.Check.str_matches(r"^[A-Z]{3}$"), nullable=False),
        # The source also carries a pseudo-region named "Australia"; it is removed during cleaning.
        "region_name": pa.Column(str, pa.Check.isin([*WHO_REGIONS, "Australia"]), nullable=False),
        "units_health_burden": pa.Column(str, pa.Check.eq("daly")),
        "units_health_burden_metric": pa.Column(str, pa.Check.eq("rate")),
    },
    unique=["country", "region_name", "year"],
    strict=False,  # extra descriptive columns (pollutant names, unit labels) are allowed
    name="raw_state_of_global_air_extract",
)


def _one_region_per_country(df: pd.DataFrame) -> bool:
    return bool((df.groupby("country")["region_name"].nunique() == 1).all())


def _balanced_panel(df: pd.DataFrame) -> bool:
    """Every country is observed in every year of the dataset (required by the temporal split and drift profile)."""
    return bool(df.groupby("country")["year"].nunique().nunique() == 1)


CLEAN_CONTRACT = pa.DataFrameSchema(
    {**_common_columns, "region_name": pa.Column(str, pa.Check.isin(WHO_REGIONS), nullable=False)},
    unique=["country", "year"],
    checks=[
        pa.Check(_one_region_per_country, error="each country belongs to exactly one region"),
        pa.Check(_balanced_panel, error="every country must cover the same years (balanced panel)"),
    ],
    strict=True,
    ordered=False,
    name="clean_modelling_table",
)


class ContractViolation(ValueError):
    """Raised when a dataframe breaks its contract. ``report`` holds every failure case."""

    def __init__(self, contract: str, report: list[dict[str, Any]]):
        self.contract = contract
        self.report = report
        lines = "\n".join(f"  - {r['column']}: {r['check']} (e.g. {r['failure_case']!r})" for r in report[:10])
        super().__init__(f"{len(report)} violation(s) of contract {contract!r}:\n{lines}")


def validate(df: pd.DataFrame, contract: pa.DataFrameSchema) -> pd.DataFrame:
    """Validate lazily and return the (type-coerced) dataframe, or raise ContractViolation with all failures."""
    df = df.reset_index(drop=True)  # failure cases are reported by row position; a duplicated index breaks that
    try:
        return contract.validate(df, lazy=True)
    except SchemaErrors as exc:
        cases = exc.failure_cases.drop_duplicates(subset=["column", "check"]).head(50)
        report = [
            {
                "column": None if pd.isna(r["column"]) else str(r["column"]),
                "check": str(r["check"]),
                "failure_case": None if pd.isna(r["failure_case"]) else str(r["failure_case"]),
                "index": None if pd.isna(r["index"]) else str(r["index"]),
            }
            for _, r in cases.iterrows()
        ]
        raise ContractViolation(contract.name, report) from exc
