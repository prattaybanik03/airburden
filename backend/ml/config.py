"""Typed pipeline configuration loaded from params.yaml.

Every tunable number lives in params.yaml so that a run is fully described by (code commit, params, dataset hash).
Values can be overridden with dotted keys, e.g. ``--set train.regressor.n_estimators=50``.
"""
from __future__ import annotations

import copy
from pathlib import Path
from typing import Any, Literal

import yaml
from pydantic import BaseModel, ConfigDict, Field

BACKEND_DIR = Path(__file__).resolve().parents[1]
DEFAULT_PARAMS = BACKEND_DIR / "params.yaml"


class _Strict(BaseModel):
    model_config = ConfigDict(extra="forbid")


class DataConfig(_Strict):
    path: Path = Path("../data/dataset.json")
    expected_sha256: str | None = None
    drop_regions: list[str] = Field(default_factory=lambda: ["Australia"])
    pollutant_repair: Literal["none", "interpolate"] = "none"
    suspicious_ratio: float = Field(0.3, gt=0, lt=1)
    max_suspicious_share: float = Field(0.10, ge=0, le=1)


class ForestConfig(_Strict):
    n_estimators: int = Field(200, ge=1)
    max_depth: int | None = Field(None, ge=1)
    min_samples_leaf: int = Field(1, ge=1)


class TrainConfig(_Strict):
    seed: int = 42
    regressor: ForestConfig = Field(default_factory=ForestConfig)
    classifier: ForestConfig = Field(default_factory=ForestConfig)
    n_clusters: int = Field(3, ge=2)
    drift_bins: int = Field(10, ge=2)


class EvaluateConfig(_Strict):
    seed: int = 42
    n_estimators: int = Field(100, ge=1)
    test_size: float = Field(0.3, gt=0, lt=1)
    n_group_folds: int = Field(5, ge=2)
    temporal_test_years: int = Field(7, ge=1)


class GateConfig(_Strict):
    min_r2_random: float = 0.85
    min_r2_held_out: float = 0.15
    min_r2_temporal: float = 0.60
    min_accuracy_held_out: float = 0.45
    max_r2_held_out_std: float = 0.40


class TrackingConfig(_Strict):
    enabled: bool = True
    experiment: str = "airburden"
    uri: str = "sqlite:///mlflow.db"


class PipelineConfig(_Strict):
    data: DataConfig = Field(default_factory=DataConfig)
    train: TrainConfig = Field(default_factory=TrainConfig)
    evaluate: EvaluateConfig = Field(default_factory=EvaluateConfig)
    gates: GateConfig = Field(default_factory=GateConfig)
    tracking: TrackingConfig = Field(default_factory=TrackingConfig)

    def data_path(self, base: Path = BACKEND_DIR) -> Path:
        """Relative data paths are resolved against the backend/ directory (where params.yaml lives)."""
        p = self.data.path
        return p if p.is_absolute() else (base / p).resolve()

    def flat(self) -> dict[str, Any]:
        """Flattened ``section.key`` view, used for experiment-tracking params."""
        out: dict[str, Any] = {}

        def walk(prefix: str, node: Any) -> None:
            if isinstance(node, dict):
                for k, v in node.items():
                    walk(f"{prefix}.{k}" if prefix else k, v)
            else:
                out[prefix] = node

        walk("", self.model_dump(mode="json"))
        return out


def parse_overrides(items: list[str] | None) -> dict[str, Any]:
    """Turn ``["a.b=1", "c=none"]`` into a nested dict, parsing values as YAML scalars."""
    nested: dict[str, Any] = {}
    for item in items or []:
        key, sep, raw = item.partition("=")
        if not sep or not key:
            raise ValueError(f"Override must look like section.key=value, got {item!r}")
        node = nested
        *parents, leaf = key.strip().split(".")
        for p in parents:
            node = node.setdefault(p, {})
        node[leaf] = yaml.safe_load(raw)
    return nested


def _deep_merge(base: dict, extra: dict) -> dict:
    out = copy.deepcopy(base)
    for k, v in extra.items():
        out[k] = _deep_merge(out[k], v) if isinstance(v, dict) and isinstance(out.get(k), dict) else v
    return out


def load_config(path: str | Path | None = DEFAULT_PARAMS, overrides: dict[str, Any] | list[str] | None = None) -> PipelineConfig:
    raw: dict[str, Any] = {}
    if path is not None and Path(path).exists():
        raw = yaml.safe_load(Path(path).read_text()) or {}
    if isinstance(overrides, list):
        overrides = parse_overrides(overrides)
    return PipelineConfig.model_validate(_deep_merge(raw, overrides or {}))
