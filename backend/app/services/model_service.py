"""Loads the trained bundle once and exposes validated prediction helpers."""
from __future__ import annotations

import logging
import os
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
import sklearn

from ml.data import FEATURES, POLLUTANTS
from ml.train import BUNDLE_SCHEMA, REQUIRED_BUNDLE_KEYS

DISCLAIMER_BASE = (
    "Exploratory estimate from a model trained on country-level data. "
    "It is not validated for unseen countries and is not a medical or policy tool"
)
DISCLAIMER = f"{DISCLAIMER_BASE}; see /model_info."
INFO_NOTE = f"{DISCLAIMER_BASE}."


log = logging.getLogger("airburden.model")


class UnknownInput(ValueError):
    """Raised for inputs the model cannot represent (unknown country, region mismatch)."""


class IncompatibleBundle(RuntimeError):
    """The artifact on disk was produced by an incompatible training pipeline; retrain it."""


class ModelService:
    def __init__(self, bundle: dict):
        missing = [k for k in REQUIRED_BUNDLE_KEYS if k not in bundle]
        schema = bundle.get("meta", {}).get("bundle_schema")
        if missing or schema != BUNDLE_SCHEMA:
            raise IncompatibleBundle(
                f"bundle schema {schema!r} (expected {BUNDLE_SCHEMA}), missing keys {missing}; run `python -m ml.pipeline run`"
            )
        self.b = bundle

    @classmethod
    def load(cls, path: Path) -> ModelService:
        service = cls(joblib.load(path))
        trained_with = service.b["meta"].get("sklearn_version")
        if trained_with != sklearn.__version__:
            log.warning(
                "Bundle trained with scikit-learn %s but %s is installed; retrain to be safe", trained_with, sklearn.__version__
            )
        return service

    @property
    def version(self) -> str:
        return str(self.b["meta"].get("model_version", "unknown"))

    @property
    def fingerprint(self) -> str | None:
        return self.b["meta"].get("model_fingerprint")

    # ---- helpers -------------------------------------------------------
    def _row(self, f: dict) -> dict:
        country, region = f["country"], f["region_name"]
        known_region = self.b["country_region"].get(country)
        if known_region is None:
            raise UnknownInput(f"Unknown country: {country!r}")
        if known_region != region:
            raise UnknownInput(f"{country} belongs to {known_region!r}, not {region!r}")
        return {
            "year": f["year"],
            "country_encoded": int(self.b["country_encoder"].transform([country])[0]),
            "region_encoded": int(self.b["region_encoder"].transform([region])[0]),
            **{p: float(f[p]) for p in POLLUTANTS},
        }

    def _feature_frame(self, f: dict | list[dict]) -> pd.DataFrame:
        rows = [f] if isinstance(f, dict) else f
        built = []
        for i, r in enumerate(rows):
            try:
                built.append(self._row(r))
            except UnknownInput as exc:
                raise UnknownInput(f"items[{i}]: {exc}" if len(rows) > 1 else str(exc)) from None
        # Column order is taken from the trained model, never from the request dict.
        return pd.DataFrame(built)[list(FEATURES)]

    def range_warnings(self, f: dict) -> list[str]:
        """Flag inputs outside what the model saw in training: its output there is an extrapolation."""
        out = []
        for col, (lo, hi) in self.b["feature_ranges"].items():
            v = float(f[col])
            if col == "year" and v > hi:
                out.append(f"year {int(v)} is after the last training year ({int(hi)}): the estimate is an extrapolation")
            elif not lo <= v <= hi:
                out.append(f"{col}={v:g} is outside the training range [{lo:g}, {hi:g}]")
        return out

    def out_of_range_features(self, f: dict) -> list[str]:
        return [c for c, (lo, hi) in self.b["feature_ranges"].items() if not lo <= float(f[c]) <= hi]

    # ---- public API ----------------------------------------------------
    def predict_burden(self, f: dict) -> float:
        return float(self.b["regressor"].predict(self._feature_frame(f))[0])

    def classify_risk(self, f: dict) -> tuple[str, dict[str, float]]:
        X = self._feature_frame(f)
        clf = self.b["classifier"]
        proba = clf.predict_proba(X)[0]
        probs = {str(c): round(float(p), 4) for c, p in zip(clf.classes_, proba)}
        return str(clf.predict(X)[0]), probs

    def predict_batch(self, rows: list[dict]) -> list[dict]:
        """Vectorised burden + risk for many rows; one invalid row rejects the whole batch (with its index)."""
        X = self._feature_frame(rows)
        burden = self.b["regressor"].predict(X)
        clf = self.b["classifier"]
        proba = clf.predict_proba(X)
        labels = clf.classes_[np.argmax(proba, axis=1)]
        return [
            {
                "prediction": round(float(burden[i]), 1),
                "risk_level": str(labels[i]),
                "probabilities": {str(c): round(float(p), 4) for c, p in zip(clf.classes_, proba[i])},
                "warnings": self.range_warnings(row),
            }
            for i, row in enumerate(rows)
        ]

    def cluster(self, f: dict) -> dict:
        X = self.b["pollutant_scaler"].transform(pd.DataFrame([{p: f[p] for p in POLLUTANTS}]))
        raw = int(self.b["kmeans"].predict(X)[0])
        new_id = self.b["cluster_remap"][raw]
        return dict(self.b["cluster_profiles"][new_id])

    def info(self) -> dict:
        meta = dict(self.b["meta"])
        if meta.get("git_commit") in (None, "unknown") and os.getenv("RENDER_GIT_COMMIT"):
            meta["git_commit"] = os.environ["RENDER_GIT_COMMIT"][:7]  # commit of the running deploy
        return {
            "meta": meta,
            "features": self.b["features"],
            "feature_ranges": self.b["feature_ranges"],
            "risk_thresholds": self.b["risk_thresholds"],
            "cluster_profiles": self.b["cluster_profiles"],
            "countries": sorted(self.b["country_region"]),
        }
