from ml.data import load_raw
from ml.data_quality import isolated_drops, summary


def test_known_afghanistan_glitch_is_flagged():
    df = load_raw()
    flag = isolated_drops(df, "exposure_mean_no2")
    row = df[(df.country == "Afghanistan") & (df.year == 1994)].index[0]
    assert bool(flag[row])


def test_target_column_is_clean_and_pollutants_are_not():
    s = summary()
    assert s["health_burden_mean"]["rows"] == 0
    assert all(s[c]["share"] > 0.05 for c in ("exposure_mean_no2", "exposure_mean_ozone", "exposure_mean_pm25"))
