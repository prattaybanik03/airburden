import pytest

from ml.config import load_config
from ml.pipeline import stage_gate
from ml.tracking import NullTracker, make_tracker
from tests.conftest import FAST


def test_disabled_tracking_is_a_no_op():
    with make_tracker(False, "sqlite:///x.db", "e") as t:
        assert isinstance(t, NullTracker) and t.run_id is None
        t.log_params({"a": 1})
        t.log_metrics({"m": 1.0})


def test_gate_stage_logs_a_complete_mlflow_run(pipeline_run, tmp_path, monkeypatch):
    mlflow = pytest.importorskip("mlflow")
    paths, _ = pipeline_run
    uri = f"sqlite:///{tmp_path / 'mlflow.db'}"
    monkeypatch.chdir(tmp_path)
    cfg = load_config(overrides=[*FAST, "tracking.enabled=true", f"tracking.uri={uri}", "tracking.experiment=test"])
    gate = stage_gate(cfg, paths, track=True)

    run = mlflow.tracking.MlflowClient(uri).get_run(gate["tracking_run_id"])
    assert run.info.status == "FINISHED"
    assert run.data.params["train.regressor.n_estimators"] == "15"
    assert run.data.metrics["r2_held_out"] == pytest.approx(gate["checks"][1]["value"])
    assert run.data.tags["gate"] == "passed" and len(run.data.tags["dataset_sha256"]) == 64
