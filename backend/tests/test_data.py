from ml.data import load_raw


def test_australia_duplicates_removed():
    df = load_raw()
    assert not df.duplicated(["country", "year"]).any()
    assert set(df.region_name) >= {"Western Pacific Region"} and "Australia" not in set(df.region_name)
    assert df.country.nunique() == 172 and len(df) == 5332
