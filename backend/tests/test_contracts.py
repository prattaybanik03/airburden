import pytest

from ml.contracts import CLEAN_CONTRACT, RAW_CONTRACT, ContractViolation, validate
from ml.data import clean, read_source


@pytest.fixture(scope="module")
def raw():
    return read_source()


def test_source_extract_satisfies_raw_contract(raw):
    validate(raw, RAW_CONTRACT)


def test_cleaned_table_satisfies_clean_contract(raw):
    table, report = clean(raw)
    validate(table, CLEAN_CONTRACT)
    assert report["rows_dropped_regions"] == 31 and report["rows_out"] == 5332


def test_violations_are_collected_lazily(raw):
    bad = raw.copy()
    bad.loc[0, "exposure_mean_pm25"] = -5
    bad.loc[1, "region_name"] = "Atlantis Region"
    bad.loc[2, "iso3"] = "af"
    with pytest.raises(ContractViolation) as exc:
        validate(bad, RAW_CONTRACT)
    columns = {r["column"] for r in exc.value.report}
    assert {"exposure_mean_pm25", "region_name", "iso3"} <= columns


def test_duplicate_records_break_the_raw_contract(raw):
    import pandas as pd

    with pytest.raises(ContractViolation):
        validate(pd.concat([raw, raw.iloc[:3]]), RAW_CONTRACT)


def test_missing_values_break_the_clean_contract(raw):
    table, _ = clean(raw)
    table.loc[5, "health_burden_mean"] = None
    with pytest.raises(ContractViolation):
        validate(table, CLEAN_CONTRACT)


def test_country_in_two_regions_breaks_the_clean_contract(raw):
    table, _ = clean(raw)
    table.loc[table.country == "Afghanistan", "region_name"] = ["European Region"] + ["Eastern Mediterranean Region"] * 30
    with pytest.raises(ContractViolation, match="exactly one region"):
        validate(table, CLEAN_CONTRACT)


def test_unbalanced_panel_breaks_the_clean_contract(raw):
    table, _ = clean(raw)
    with pytest.raises(ContractViolation, match="balanced panel"):
        validate(table.drop(index=table.index[:2]), CLEAN_CONTRACT)
