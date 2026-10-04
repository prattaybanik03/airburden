import pytest
from fastapi.testclient import TestClient

from app.config import get_settings
from ml.train import BUNDLE_NAME, train


@pytest.fixture(scope="session")
def bundle_dir(tmp_path_factory):
    out = tmp_path_factory.mktemp("artifacts")
    train(out_dir=out, n_estimators=20)  # small forest: fast, deterministic (seeded)
    return out


@pytest.fixture()
def client(bundle_dir, monkeypatch):
    monkeypatch.setenv("MODEL_PATH", str(bundle_dir / BUNDLE_NAME))
    monkeypatch.setenv("NEWS_API_KEY", "test-news-key")
    monkeypatch.setenv("IQAIR_API_KEY", "test-iqair-key")
    monkeypatch.setenv("OPENCAGE_API_KEY", "test-opencage-key")
    get_settings.cache_clear()
    from app.main import app

    with TestClient(app) as c:
        yield c
    get_settings.cache_clear()


@pytest.fixture()
def payload():
    return {
        "features": {
            "year": 2015,
            "exposure_mean_no2": 400.0,
            "exposure_mean_ozone": 500.0,
            "exposure_mean_pm25": 600.0,
            "country": "Afghanistan",
            "region_name": "Eastern Mediterranean Region",
        }
    }
