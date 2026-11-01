import numpy as np
import pandas as pd

from ml.data import load_raw, quantile_profile
from ml.drift import drift_report, psi


def test_psi_is_zero_on_the_reference_and_large_on_a_shift():
    df = load_raw()
    ref = quantile_profile(df["exposure_mean_pm25"], 10)
    assert psi(ref, df["exposure_mean_pm25"]) < 0.01
    assert psi(ref, df["exposure_mean_pm25"] * 3) > 0.25


def test_drift_report_flags_only_shifted_features():
    df = load_raw()
    profile = {c: quantile_profile(df[c]) for c in ["year", "exposure_mean_no2", "exposure_mean_pm25"]}
    sample = df.sample(500, random_state=0)
    current = pd.DataFrame({"year": sample["year"], "exposure_mean_no2": sample["exposure_mean_no2"],
                            "exposure_mean_pm25": np.full(500, 5000.0)})
    report = drift_report(profile, current)
    assert report["drift_detected"]
    assert report["features"]["exposure_mean_pm25"]["status"] == "significant"
    assert report["features"]["exposure_mean_no2"]["status"] == "stable"
