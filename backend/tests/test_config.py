import pytest
from pydantic import ValidationError

from ml.config import DEFAULT_PARAMS, load_config, parse_overrides


def test_params_file_loads_and_resolves_the_dataset():
    cfg = load_config(DEFAULT_PARAMS)
    assert cfg.data_path().name == "dataset.json" and cfg.data_path().exists()
    assert cfg.train.seed == 42 and cfg.data.expected_sha256


def test_dotted_overrides_are_typed():
    assert parse_overrides(["a.b=3", "a.c=none", "d=null", "e=0.5"]) == {"a": {"b": 3, "c": "none"}, "d": None, "e": 0.5}
    cfg = load_config(overrides=["train.regressor.n_estimators=7", "data.pollutant_repair=interpolate"])
    assert cfg.train.regressor.n_estimators == 7 and cfg.data.pollutant_repair == "interpolate"
    assert cfg.train.classifier.n_estimators == 200  # untouched sibling keeps the file value


@pytest.mark.parametrize("bad", ["train.regressor.n_estimators=0", "data.pollutant_repair=magic", "train.typo=1"])
def test_invalid_params_are_rejected(bad):
    with pytest.raises(ValidationError):
        load_config(overrides=[bad])


def test_malformed_override():
    with pytest.raises(ValueError):
        parse_overrides(["no-equals-sign"])


def test_flat_view_for_tracking():
    flat = load_config().flat()
    assert flat["train.regressor.n_estimators"] == 200 and "gates.min_r2_held_out" in flat
