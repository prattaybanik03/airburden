import joblib

from ml.data import load_raw


def test_v1_burden_matches_legacy_and_reports_version(client, payload):
    v1 = client.post("/v1/predictions/health-burden", json=payload["features"])
    legacy = client.post("/predict_health_burden", json=payload)
    assert v1.status_code == 200 and v1.json()["prediction"] == legacy.json()["prediction"]
    assert v1.json()["model_version"] == v1.headers["X-Model-Version"]
    assert v1.json()["warnings"] == []


def test_v1_risk_level(client, payload):
    body = client.post("/v1/predictions/risk-level", json=payload["features"]).json()
    assert body["risk_level"] in {"Low Risk", "Moderate Risk", "High Risk"}


def test_extrapolation_is_flagged(client, payload):
    f = payload["features"] | {"year": 2040, "exposure_mean_pm25": 5000}
    warnings = client.post("/v1/predictions/health-burden", json=f).json()["warnings"]
    assert any("extrapolation" in w for w in warnings) and any("exposure_mean_pm25" in w for w in warnings)


def test_batch_is_consistent_with_single_predictions(client):
    df = load_raw().sample(25, random_state=1)
    items = [
        {"year": int(r.year), "exposure_mean_no2": r.exposure_mean_no2, "exposure_mean_ozone": r.exposure_mean_ozone,
         "exposure_mean_pm25": r.exposure_mean_pm25, "country": r.country, "region_name": r.region_name}
        for r in df.itertuples()
    ]
    body = client.post("/v1/predictions/batch", json={"items": items}).json()
    assert len(body["items"]) == 25 and body["unit"] == "DALY rate"
    single = client.post("/v1/predictions/health-burden", json=items[3]).json()["prediction"]
    assert body["items"][3]["prediction"] == single


def test_batch_rejects_bad_rows_with_their_index(client, payload):
    good = payload["features"]
    r = client.post("/v1/predictions/batch", json={"items": [good, good | {"country": "Atlantis"}]})
    assert r.status_code == 422 and "items[1]" in r.json()["detail"]


def test_batch_size_limits(client, payload):
    assert client.post("/v1/predictions/batch", json={"items": []}).status_code == 422
    assert client.post("/v1/predictions/batch", json={"items": [payload["features"]] * 501}).status_code == 422


def test_v1_cluster_and_model(client, payload):
    assert client.post("/v1/clusters/assign", json=payload["features"]).json()["cluster"] in {0, 1, 2}
    model = client.get("/v1/model").json()
    assert model["meta"]["model_fingerprint"] and "feature_ranges" in model


def test_readiness(client):
    body = client.get("/ready").json()
    assert body["status"] == "ready" and body["model_version"]


def test_request_id_is_propagated(client):
    r = client.get("/health", headers={"X-Request-ID": "abc-123"})
    assert r.headers["X-Request-ID"] == "abc-123"
    assert len(client.get("/health").headers["X-Request-ID"]) == 32


def test_prometheus_metrics(client, payload):
    client.post("/v1/predictions/health-burden", json=payload["features"] | {"year": 2050})
    text = client.get("/metrics").text
    assert 'airburden_http_requests_total{method="POST",route="/v1/predictions/health-burden",status="200"}' in text
    assert 'airburden_predictions_total{model="regressor",outcome="ok"}' in text
    assert 'airburden_out_of_range_inputs_total{feature="year"}' in text
    assert "airburden_model_info{" in text and "airburden_predicted_daly_rate_bucket" in text


def test_versioned_routes_are_documented_and_legacy_is_deprecated(client):
    paths = client.get("/openapi.json").json()["paths"]
    assert "/v1/predictions/batch" in paths
    assert paths["/predict_health_burden"]["post"]["deprecated"] is True


def test_incompatible_bundle_is_not_served(bundle_dir, tmp_path, monkeypatch, payload):
    from fastapi.testclient import TestClient

    from app.config import get_settings
    from ml.train import BUNDLE_NAME

    old = joblib.load(bundle_dir / BUNDLE_NAME)
    old["meta"] = {**old["meta"], "bundle_schema": 1}
    joblib.dump(old, tmp_path / "old.joblib")
    monkeypatch.setenv("MODEL_PATH", str(tmp_path / "old.joblib"))
    get_settings.cache_clear()
    from app.main import app

    with TestClient(app) as c:
        assert c.get("/ready").status_code == 503
        assert c.post("/v1/predictions/health-burden", json=payload["features"]).status_code == 503
    get_settings.cache_clear()


def test_json_logs_carry_request_id_and_severity():
    import json
    import logging

    from app.observability import JsonFormatter, request_id_var

    token = request_id_var.set("rid-1")
    try:
        line = JsonFormatter().format(logging.LogRecord("airburden.test", logging.WARNING, __file__, 1, "hello", None, None))
    finally:
        request_id_var.reset(token)
    entry = json.loads(line)
    assert entry["severity"] == "WARNING" and entry["request_id"] == "rid-1" and entry["msg"] == "hello"
