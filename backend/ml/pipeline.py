"""The AirBurden ML pipeline: validate -> train -> evaluate -> gate.

    python -m ml.pipeline run                       # every stage, in order (what CI and the Docker build run)
    python -m ml.pipeline validate|train|evaluate|gate
    python -m ml.pipeline run --set data.pollutant_repair=interpolate --set train.regressor.n_estimators=50
    dvc repro                                       # same stages, cached and re-run only when inputs change (dvc.yaml)

Stages and outputs (under backend/artifacts/ by default):

  validate  data contract + data-quality checks       data/validated.parquet, reports/data_validation.json
  train     fit the models from the validated table   model_bundle.joblib, metadata.json
  evaluate  random / held-out / temporal + baselines  reports/evaluation.json, reports/metrics.json
  gate      release criteria, model card, tracking    reports/gate.json, model_card.md (+ one MLflow run)

Each stage only reads files written by earlier stages, so the stages can run as separate processes (DVC) or in one.
Any stage that fails exits non-zero and the following stages do not run.
"""
from __future__ import annotations

import argparse
import json
import logging
import sys
import time
from dataclasses import dataclass
from pathlib import Path

from ml.config import BACKEND_DIR, DEFAULT_PARAMS, PipelineConfig, load_config
from ml.data import CLEAN_COLUMNS, POLLUTANTS, REPO_ROOT, TARGET, clean, isolated_drops, read_source, sha256_file
from ml.train import ARTIFACT_DIR, BUNDLE_NAME, METADATA_NAME, train

log = logging.getLogger("airburden.pipeline")


class PipelineError(RuntimeError):
    """A stage refused to continue (bad data, failed gate)."""


@dataclass(frozen=True)
class Paths:
    root: Path

    @property
    def validated(self) -> Path:
        return self.root / "data" / "validated.parquet"

    @property
    def validation_report(self) -> Path:
        return self.root / "reports" / "data_validation.json"

    @property
    def bundle(self) -> Path:
        return self.root / BUNDLE_NAME

    @property
    def metadata(self) -> Path:
        return self.root / METADATA_NAME

    @property
    def evaluation(self) -> Path:
        return self.root / "reports" / "evaluation.json"

    @property
    def metrics(self) -> Path:
        return self.root / "reports" / "metrics.json"

    @property
    def gate(self) -> Path:
        return self.root / "reports" / "gate.json"

    @property
    def model_card(self) -> Path:
        return self.root / "model_card.md"


def _write_json(path: Path, obj) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(obj, indent=2, default=str) + "\n")


def _read_json(path: Path) -> dict:
    if not path.exists():
        raise PipelineError(f"{path} not found: run the earlier pipeline stages first")
    return json.loads(path.read_text())


# --------------------------------------------------------------------------------------------- stages
def stage_validate(cfg: PipelineConfig, paths: Paths) -> dict:
    from ml.contracts import CLEAN_CONTRACT, RAW_CONTRACT, ContractViolation, validate

    src = cfg.data_path()
    if not src.exists():
        raise PipelineError(f"dataset not found: {src}")
    sha = sha256_file(src)
    try:
        shown = src.relative_to(REPO_ROOT).as_posix()  # machine-independent, so reports and dvc.lock are portable
    except ValueError:
        shown = str(src)
    report: dict = {"source": shown, "source_sha256": sha, "contracts": {}, "passed": False}

    def fail(msg: str) -> PipelineError:
        report["error"] = msg
        _write_json(paths.validation_report, report)
        return PipelineError(msg)

    if cfg.data.expected_sha256 and sha != cfg.data.expected_sha256:
        raise fail(f"dataset hash {sha[:12]} does not match the pinned data.expected_sha256 {cfg.data.expected_sha256[:12]}")

    raw = read_source(src)
    try:
        validate(raw, RAW_CONTRACT)
        report["contracts"]["raw"] = "passed"
        ratio = cfg.data.suspicious_ratio
        table, lineage = clean(raw, cfg.data.drop_regions, cfg.data.pollutant_repair, ratio)
        unrepaired = table if cfg.data.pollutant_repair == "none" else clean(raw, cfg.data.drop_regions, "none")[0]
        source_share = _suspicious_share(unrepaired, ratio)
        table = validate(table, CLEAN_CONTRACT)[CLEAN_COLUMNS]
        report["contracts"]["clean"] = "passed"
    except ContractViolation as exc:
        report["contracts"][exc.contract] = {"failed": exc.report}
        raise fail(str(exc)) from exc

    share = _suspicious_share(table, ratio)
    report.update(
        rows=len(table),
        countries=int(table["country"].nunique()),
        years=[int(table["year"].min()), int(table["year"].max())],
        lineage=lineage | {"pollutant_repair": cfg.data.pollutant_repair},
        suspicious_share_source=source_share,
        suspicious_share=share,
        max_suspicious_share=cfg.data.max_suspicious_share,
    )
    too_noisy = {c: v for c, v in share.items() if v > cfg.data.max_suspicious_share}
    if too_noisy:
        raise fail(f"data-quality check failed, suspicious share above {cfg.data.max_suspicious_share}: {too_noisy}")

    paths.validated.parent.mkdir(parents=True, exist_ok=True)
    table.to_parquet(paths.validated, index=False)
    report["validated_sha256"] = sha256_file(paths.validated)
    report["passed"] = True
    _write_json(paths.validation_report, report)
    log.info("validate: %d rows, %d countries, suspicious share %s", len(table), report["countries"], share)
    return report


def _suspicious_share(table, ratio: float) -> dict[str, float]:
    return {c: round(float(isolated_drops(table, c, ratio).mean()), 4) for c in [*POLLUTANTS, TARGET]}


def stage_train(cfg: PipelineConfig, paths: Paths) -> dict:
    validation = _read_json(paths.validation_report)
    if not validation.get("passed"):
        raise PipelineError("data validation did not pass; refusing to train")
    lineage = {
        "source_sha256": validation["source_sha256"],
        "validated_sha256": validation["validated_sha256"],
        **validation["lineage"],
    }
    bundle = train(paths.validated, paths.root, cfg=cfg.train, lineage=lineage)
    log.info("train: saved %s (fingerprint %s)", paths.bundle, bundle["meta"]["model_fingerprint"][:12])
    return bundle["meta"]


def stage_evaluate(cfg: PipelineConfig, paths: Paths) -> dict:
    from ml.evaluate import evaluate, headline

    if not paths.validated.exists():
        raise PipelineError(f"{paths.validated} not found: run the validate stage first")
    started = time.perf_counter()
    res = evaluate(paths.validated, cfg.evaluate, cfg.train)
    metrics = headline(res)
    _write_json(paths.evaluation, res)
    _write_json(paths.metrics, metrics)
    log.info("evaluate: %s (%.1fs)", metrics, time.perf_counter() - started)
    return metrics


def stage_gate(cfg: PipelineConfig, paths: Paths, track: bool = True) -> dict:
    from ml.gates import check_gates, render_model_card
    from ml.tracking import make_tracker

    metrics = _read_json(paths.metrics)
    meta = _read_json(paths.metadata)["meta"]
    validation = _read_json(paths.validation_report)
    gate = check_gates(metrics, cfg.gates)
    gate |= {"model_version": meta["model_version"], "model_fingerprint": meta["model_fingerprint"]}
    _write_json(paths.gate, gate)
    paths.model_card.write_text(render_model_card(meta, metrics, gate, validation))

    tracking = cfg.tracking
    uri = tracking.uri
    if uri.startswith("sqlite:///") and not uri.startswith("sqlite:////"):  # relative sqlite path: keep it in backend/
        uri = f"sqlite:///{(BACKEND_DIR / uri.removeprefix('sqlite:///')).as_posix()}"
    run_name = f"v{meta['model_version']}-{meta['git_commit']}-{cfg.data.pollutant_repair}"
    with make_tracker(track and tracking.enabled, uri, tracking.experiment, run_name, BACKEND_DIR / "mlruns") as t:
        t.log_params(cfg.flat())
        t.log_metrics(metrics | {f"data.suspicious_share.{k}": v for k, v in validation["suspicious_share"].items()})
        t.set_tags(
            {
                "git_commit": meta["git_commit"],
                "dataset_sha256": meta["dataset_sha256"],
                "model_version": meta["model_version"],
                "model_fingerprint": meta["model_fingerprint"],
                "gate": "passed" if gate["passed"] else "failed",
            }
        )
        for p in (paths.metrics, paths.evaluation, paths.validation_report, paths.gate, paths.metadata):
            t.log_artifact(p, "reports")
        t.log_artifact(paths.model_card)
        if gate["passed"]:
            t.log_artifact(paths.bundle, "model")
        gate["tracking_run_id"] = t.run_id
    _write_json(paths.gate, gate)

    failed = [c for c in gate["checks"] if not c["passed"]]
    if failed:
        raise PipelineError("release gates failed: " + ", ".join(f"{c['metric']}={c['value']} (needs {c['op']} {c['threshold']})" for c in failed))
    log.info("gate: all %d checks passed%s", len(gate["checks"]), f" (MLflow run {t.run_id})" if t.run_id else "")
    return gate


STAGES = ("validate", "train", "evaluate", "gate")


def run(cfg: PipelineConfig, paths: Paths, stages=STAGES, track: bool = True) -> dict:
    results = {}
    for name in stages:
        started = time.perf_counter()
        if name == "gate":
            results[name] = stage_gate(cfg, paths, track=track)
        else:
            results[name] = {"validate": stage_validate, "train": stage_train, "evaluate": stage_evaluate}[name](cfg, paths)
        log.info("stage %s finished in %.1fs", name, time.perf_counter() - started)
    return results


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(prog="python -m ml.pipeline", description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("stage", choices=[*STAGES, "run"])
    ap.add_argument("--params", default=str(DEFAULT_PARAMS), help="params file (default: backend/params.yaml)")
    ap.add_argument("--set", dest="overrides", action="append", metavar="KEY=VALUE", help="override a param, repeatable")
    ap.add_argument("--artifacts", default=str(ARTIFACT_DIR), help="output directory (default: backend/artifacts)")
    ap.add_argument("--no-track", action="store_true", help="do not log the run to MLflow")
    args = ap.parse_args(argv)
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")

    cfg = load_config(args.params, args.overrides)
    stages = STAGES if args.stage == "run" else (args.stage,)
    try:
        run(cfg, Paths(Path(args.artifacts)), stages, track=not args.no_track)
    except PipelineError as exc:
        log.error("%s", exc)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
