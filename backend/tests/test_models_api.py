import pandas as pd

from ml.data import FEATURES, TARGET, load_raw


def test_health_ok(client):
    assert client.get("/health").json() == {"status": "ok", "model_loaded": True}


def test_predict_returns_value_in_daly_units(client, payload):
    r = client.post("/predict_health_burden", json=payload)
    assert r.status_code == 200
    body = r.json()
    assert body["unit"] == "DALY rate"
    # observed range in the dataset is 102 - 19,200 DALY rate
    assert 100 <= body["prediction"] <= 20000


def test_prediction_close_to_observed_for_a_training_row(client):
    """Regression test for the v1 bug (inputs were fed to the model in the wrong column order,
    and the output was un-scaled with the wrong scaler column)."""
    df = load_raw()
    row = df[(df.country == "Afghanistan") & (df.year == 2015)].iloc[0]
    payload = {
        "features": {
            "year": int(row.year),
            "exposure_mean_no2": float(row.exposure_mean_no2),
            "exposure_mean_ozone": float(row.exposure_mean_ozone),
            "exposure_mean_pm25": float(row.exposure_mean_pm25),
            "country": row.country,
            "region_name": row.region_name,
        }
    }
    pred = client.post("/predict_health_burden", json=payload).json()["prediction"]
    assert abs(pred - row[TARGET]) < 0.15 * row[TARGET]


def test_feature_frame_matches_trained_column_order(client, payload):
    svc = client.app.state.model_service
    frame = svc._feature_frame(payload["features"])
    assert list(frame.columns) == list(svc.b["regressor"].feature_names_in_) == FEATURES
    assert list(svc.b["classifier"].feature_names_in_) == FEATURES


def test_dict_key_order_in_request_does_not_matter(client, payload):
    reordered = {"features": dict(reversed(list(payload["features"].items())))}
    a = client.post("/predict_health_burden", json=payload).json()["prediction"]
    b = client.post("/predict_health_burden", json=reordered).json()["prediction"]
    assert a == b


def test_unknown_country_is_422(client, payload):
    payload["features"]["country"] = "Atlantis"
    assert client.post("/predict_health_burden", json=payload).status_code == 422


def test_country_region_mismatch_is_422(client, payload):
    payload["features"]["region_name"] = "European Region"
    r = client.post("/classify_risk_level", json=payload)
    assert r.status_code == 422 and "belongs to" in r.json()["detail"]


def test_negative_exposure_is_rejected(client, payload):
    payload["features"]["exposure_mean_pm25"] = -1
    assert client.post("/predict_health_burden", json=payload).status_code == 422


def test_classify_returns_label_and_probabilities(client, payload):
    body = client.post("/classify_risk_level", json=payload).json()
    assert body["risk_level"] in {"Low Risk", "Moderate Risk", "High Risk"}
    assert abs(sum(body["probabilities"].values()) - 1) < 1e-3


def test_high_burden_country_is_not_low_risk(client):
    df = load_raw()
    row = df.sort_values(TARGET).iloc[-1]
    payload = {"features": {
        "year": int(row.year), "exposure_mean_no2": float(row.exposure_mean_no2),
        "exposure_mean_ozone": float(row.exposure_mean_ozone), "exposure_mean_pm25": float(row.exposure_mean_pm25),
        "country": str(row.country), "region_name": str(row.region_name)}}
    assert client.post("/classify_risk_level", json=payload).json()["risk_level"] == "High Risk"


def test_cluster_accepts_the_flat_payload_the_frontend_sends(client, payload):
    flat = payload["features"]
    body = client.post("/get_cluster_info", json=flat).json()
    assert body["cluster"] in {0, 1, 2}
    assert body["label"].startswith("Exposure profile")


def test_cluster_ids_are_ordered_by_total_exposure(client):
    svc = client.app.state.model_service
    z = [svc.b["pollutant_scaler"].transform(pd.DataFrame([p["centroid"]]))[0].sum() for p in svc.b["cluster_profiles"]]
    assert z == sorted(z, reverse=True)


def test_model_info_exposes_disclaimer_and_thresholds(client):
    body = client.get("/model_info").json()
    assert "disclaimer" in body and body["risk_thresholds"]["low_max"] < body["risk_thresholds"]["moderate_max"]


def test_service_unavailable_without_artifacts(tmp_path, monkeypatch, payload):
    from fastapi.testclient import TestClient

    from app.config import get_settings

    monkeypatch.setenv("MODEL_PATH", str(tmp_path / "missing.joblib"))
    get_settings.cache_clear()
    from app.main import app

    with TestClient(app) as c:
        assert c.get("/health").json()["model_loaded"] is False
        assert c.post("/predict_health_burden", json=payload).status_code == 503
    get_settings.cache_clear()


def test_model_info_reports_version_and_data_provenance(client):
    meta = client.get("/model_info").json()["meta"]
    assert meta["model_version"]
    assert len(meta["dataset_sha256"]) == 64
    assert meta["training_params"]["seed"] == 42
