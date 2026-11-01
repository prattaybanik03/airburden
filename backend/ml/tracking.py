"""Experiment tracking with MLflow, behind a small interface so the pipeline runs without it.

MLflow is a development/CI dependency (requirements-dev). The Docker image trains without it, and so does anyone
who installs only requirements-train. In that case ``make_tracker`` returns a no-op tracker.

    pip install mlflow                                      # the UI needs the full package; logging only needs mlflow-skinny
    mlflow ui --backend-store-uri sqlite:///mlflow.db       # from backend/, then open http://127.0.0.1:5000
"""
from __future__ import annotations

import logging
import os
from contextlib import AbstractContextManager
from pathlib import Path
from typing import Any

log = logging.getLogger("airburden.tracking")


class NullTracker(AbstractContextManager):
    """Does nothing; used when tracking is disabled or MLflow is not installed."""

    run_id: str | None = None

    def __exit__(self, *exc) -> None:
        return None

    def log_params(self, params: dict[str, Any]) -> None: ...

    def log_metrics(self, metrics: dict[str, float]) -> None: ...

    def set_tags(self, tags: dict[str, Any]) -> None: ...

    def log_artifact(self, path: str | Path, subdir: str | None = None) -> None: ...


class MlflowTracker(AbstractContextManager):
    def __init__(self, uri: str, experiment: str, run_name: str | None = None, artifact_root: Path | None = None):
        import mlflow

        self._mlflow = mlflow
        mlflow.set_tracking_uri(uri)
        if mlflow.get_experiment_by_name(experiment) is None:
            location = (artifact_root or Path("mlruns")).resolve().as_uri()
            mlflow.create_experiment(experiment, artifact_location=location)
        mlflow.set_experiment(experiment)
        self._run = mlflow.start_run(run_name=run_name)
        self.run_id = self._run.info.run_id

    def __exit__(self, exc_type, *exc) -> None:
        self._mlflow.end_run(status="FAILED" if exc_type else "FINISHED")

    def log_params(self, params: dict[str, Any]) -> None:
        self._mlflow.log_params({k: "null" if v is None else v for k, v in params.items()})

    def log_metrics(self, metrics: dict[str, float]) -> None:
        self._mlflow.log_metrics({k: float(v) for k, v in metrics.items() if isinstance(v, (int, float))})

    def set_tags(self, tags: dict[str, Any]) -> None:
        self._mlflow.set_tags({k: str(v) for k, v in tags.items()})

    def log_artifact(self, path: str | Path, subdir: str | None = None) -> None:
        if Path(path).exists():
            self._mlflow.log_artifact(str(path), artifact_path=subdir)


def make_tracker(enabled: bool, uri: str, experiment: str, run_name: str | None = None, artifact_root: Path | None = None):
    if not enabled:
        return NullTracker()
    try:
        os.environ.setdefault("MLFLOW_DISABLE_AGENT_HINT", "1")
        import mlflow  # noqa: F401
    except ImportError:
        log.warning("Tracking enabled but mlflow is not installed (pip install -r requirements-dev.lock); skipping")
        return NullTracker()
    return MlflowTracker(uri, experiment, run_name, artifact_root)
