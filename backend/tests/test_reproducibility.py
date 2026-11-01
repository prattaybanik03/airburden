"""Same code + data + params => identical models. Different seed => different models."""
import joblib
import numpy as np

from ml.config import TrainConfig
from ml.data import load_raw
from ml.train import train


def _small(seed=42):
    return TrainConfig(seed=seed, regressor={"n_estimators": 10}, classifier={"n_estimators": 10})


def test_training_is_deterministic(tmp_path):
    a = train(out_dir=tmp_path / "a", cfg=_small())
    b = train(out_dir=tmp_path / "b", cfg=_small())
    assert a["meta"]["model_fingerprint"] == b["meta"]["model_fingerprint"]
    assert a["risk_thresholds"] == b["risk_thresholds"] and a["cluster_profiles"] == b["cluster_profiles"]


def test_seed_changes_the_model(tmp_path):
    a = train(out_dir=tmp_path / "a", cfg=_small(1))
    b = train(out_dir=tmp_path / "b", cfg=_small(2))
    assert a["meta"]["model_fingerprint"] != b["meta"]["model_fingerprint"]


def test_saved_bundle_round_trips(tmp_path):
    from ml.data import build_features
    from ml.train import BUNDLE_NAME, model_fingerprint

    bundle = train(out_dir=tmp_path, cfg=_small())
    loaded = joblib.load(tmp_path / BUNDLE_NAME)
    df = load_raw()
    X = build_features(df, loaded["country_encoder"], loaded["region_encoder"])
    assert model_fingerprint(loaded, X) == bundle["meta"]["model_fingerprint"]
    assert np.allclose(loaded["regressor"].predict(X[:20]), bundle["regressor"].predict(X[:20]))
