import json

import joblib
import pytest

from ml.config import load_config
from ml.data import POLLUTANTS, clean, isolated_drops, read_source
from ml.gates import check_gates
from ml.pipeline import Paths, PipelineError, main, stage_gate, stage_train, stage_validate
from tests.conftest import FAST


def test_full_run_writes_every_artifact(pipeline_run):
    paths, results = pipeline_run
    for p in (paths.validated, paths.validation_report, paths.bundle, paths.metadata, paths.metrics, paths.gate, paths.model_card):
        assert p.exists(), p
    assert set(results) == {"validate", "train", "evaluate", "gate"}


def test_validation_report_records_lineage(pipeline_run):
    paths, _ = pipeline_run
    report = json.loads(paths.validation_report.read_text())
    assert report["passed"] and report["rows"] == 5332 and report["countries"] == 172
    assert report["contracts"] == {"raw": "passed", "clean": "passed"}
    assert report["suspicious_share"]["health_burden_mean"] == 0
    assert len(report["source_sha256"]) == 64 and len(report["validated_sha256"]) == 64


def test_bundle_carries_lineage_and_monitoring_reference(pipeline_run):
    paths, _ = pipeline_run
    b = joblib.load(paths.bundle)
    lineage = b["meta"]["data_lineage"]
    assert lineage["validated_sha256"] == json.loads(paths.validation_report.read_text())["validated_sha256"]
    assert b["meta"]["dataset_sha256"] == load_config().data.expected_sha256
    assert set(b["reference_profile"]) == {"year", *POLLUTANTS}
    assert b["meta"]["training_params"]["regressor"]["n_estimators"] == 15


def test_metrics_and_model_card(pipeline_run):
    paths, results = pipeline_run
    metrics = json.loads(paths.metrics.read_text())
    assert metrics["r2_random"] > metrics["r2_held_out"]  # the panel-data leak the docs describe
    card = paths.model_card.read_text()
    assert "Release gates: PASSED" in card and "Intended use" in card
    assert results["gate"]["passed"]


def test_gate_logic():
    gates = load_config().gates
    good = {"r2_random": 0.9, "r2_held_out": 0.3, "r2_temporal": 0.7, "accuracy_held_out": 0.6, "r2_held_out_std": 0.1}
    assert check_gates(good, gates)["passed"]
    result = check_gates(good | {"r2_held_out": 0.05}, gates)
    assert not result["passed"] and [c["metric"] for c in result["checks"] if not c["passed"]] == ["r2_held_out"]
    assert not check_gates({}, gates)["passed"]  # missing metrics fail closed


def test_failing_gate_stops_the_pipeline(pipeline_run, tmp_path):
    paths, _ = pipeline_run
    strict = load_config(overrides=[*FAST, "gates.min_r2_held_out=0.99"])
    with pytest.raises(PipelineError, match="r2_held_out"):
        stage_gate(strict, paths, track=False)
    assert json.loads(paths.gate.read_text())["passed"] is False
    stage_gate(load_config(overrides=FAST), paths, track=False)  # restore the passing state for other tests


def test_changed_dataset_is_refused(tmp_path):
    cfg = load_config(overrides=["data.expected_sha256=" + "f" * 64])
    with pytest.raises(PipelineError, match="does not match"):
        stage_validate(cfg, Paths(tmp_path))
    assert json.loads((tmp_path / "reports" / "data_validation.json").read_text())["passed"] is False


def test_data_quality_threshold_is_enforced(tmp_path):
    cfg = load_config(overrides=["data.max_suspicious_share=0.05"])
    with pytest.raises(PipelineError, match="suspicious share"):
        stage_validate(cfg, Paths(tmp_path))


def test_corrupted_source_fails_the_contract(tmp_path):
    rows = json.loads(load_config().data_path().read_text())
    rows[0]["exposure_mean_no2"] = -1
    src = tmp_path / "bad.json"
    src.write_text(json.dumps(rows))
    cfg = load_config(overrides=[f"data.path={src}", "data.expected_sha256=null"])
    with pytest.raises(PipelineError, match="raw_state_of_global_air_extract"):
        stage_validate(cfg, Paths(tmp_path / "out"))


def test_training_requires_passing_validation(tmp_path):
    with pytest.raises(PipelineError, match="earlier pipeline stages"):
        stage_train(load_config(), Paths(tmp_path))


def test_interpolation_repair_removes_isolated_drops():
    table, report = clean(read_source(), pollutant_repair="interpolate")
    assert sum(report["repaired_values"].values()) > 1000
    for col in POLLUTANTS:
        assert isolated_drops(table, col).mean() < 0.02
    afg_1994 = table[(table.country == "Afghanistan") & (table.year == 1994)].exposure_mean_no2.iloc[0]
    assert 100 < afg_1994 < 120  # the 11 between 114 and 106 becomes ~110


def test_cli_exit_codes(tmp_path):
    assert main(["validate", "--artifacts", str(tmp_path), "--no-track"]) == 0
    assert main(["validate", "--artifacts", str(tmp_path), "--set", "data.max_suspicious_share=0.01"]) == 1
