"""The drift endpoint: PSI of a batch of served inputs against the training reference stored in the bundle."""
import pytest

from ml.data import POLLUTANTS, load_raw

COLUMNS = ["year", *POLLUTANTS]


@pytest.fixture(scope="module")
def training_rows():
    """A sample drawn from the training data itself: by construction it should not drift."""
    return load_raw()[COLUMNS].sample(500, random_state=0).to_dict(orient="records")


def test_sample_of_the_training_data_is_stable(client, training_rows):
    r = client.post("/v1/monitoring/drift", json={"items": training_rows})
    assert r.status_code == 200
    body = r.json()
    assert body["n_rows"] == 500
    assert set(body["features"]) == set(COLUMNS)
    assert body["drift_detected"] is False
    assert all(f["status"] == "stable" for f in body["features"].values())
    assert body["thresholds"] == {"moderate": 0.10, "significant": 0.25}


def test_shifted_pollutant_is_flagged_and_only_that_one(client, training_rows):
    shifted = [r | {"exposure_mean_pm25": r["exposure_mean_pm25"] * 10} for r in training_rows]
    body = client.post("/v1/monitoring/drift", json={"items": shifted}).json()
    assert body["drift_detected"] is True
    assert body["features"]["exposure_mean_pm25"]["status"] == "significant"
    assert body["features"]["exposure_mean_no2"]["status"] == "stable"


def test_psi_is_exported_to_prometheus(client, training_rows):
    shifted = [r | {"exposure_mean_ozone": r["exposure_mean_ozone"] * 10} for r in training_rows]
    psi = client.post("/v1/monitoring/drift", json={"items": shifted}).json()["features"]["exposure_mean_ozone"]["psi"]
    metrics = client.get("/metrics").text
    line = next(m for m in metrics.splitlines() if m.startswith('airburden_feature_psi{feature="exposure_mean_ozone"}'))
    assert float(line.split()[-1]) == pytest.approx(psi)


def test_extra_keys_are_ignored(client, training_rows):
    rows = [r | {"country": "Afghanistan", "region_name": "Eastern Mediterranean Region"} for r in training_rows]
    assert client.post("/v1/monitoring/drift", json={"items": rows}).status_code == 200


@pytest.mark.parametrize("n", [0, 49])
def test_batch_too_small_for_psi_is_rejected(client, training_rows, n):
    assert client.post("/v1/monitoring/drift", json={"items": training_rows[:n]}).status_code == 422


def test_negative_exposure_is_rejected(client, training_rows):
    rows = [dict(r) for r in training_rows]
    rows[3]["exposure_mean_no2"] = -1.0
    assert client.post("/v1/monitoring/drift", json={"items": rows}).status_code == 422
