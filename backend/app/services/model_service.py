"""Loads the trained bundle once and exposes validated prediction helpers."""
from __future__ import annotations

import logging
import os
from pathlib import Path

import joblib
import pandas as pd
import sklearn

from ml.data import FEATURES, POLLUTANTS

DISCLAIMER_BASE = (
    "Exploratory estimate from a model trained on country-level data. "
    "It is not validated for unseen countries and is not a medical or policy tool"
)
DISCLAIMER = f"{DISCLAIMER_BASE}; see /model_info."
INFO_NOTE = f"{DISCLAIMER_BASE}."


log = logging.getLogger("airburden.model")


class UnknownInput(ValueError):
    """Raised for inputs the model cannot represent (unknown country, region mismatch)."""


class ModelService:
    def __init__(self, bundle: dict):
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

    # ---- helpers -------------------------------------------------------
    def _feature_frame(self, f: dict) -> pd.DataFrame:
        country, region = f["country"], f["region_name"]
        known_region = self.b["country_region"].get(country)
        if known_region is None:
            raise UnknownInput(f"Unknown country: {country!r}")
        if known_region != region:
            raise UnknownInput(f"{country} belongs to {known_region!r}, not {region!r}")
        row = {
            "year": f["year"],
            "country_encoded": int(self.b["country_encoder"].transform([country])[0]),
            "region_encoded": int(self.b["region_encoder"].transform([region])[0]),
            **{p: float(f[p]) for p in POLLUTANTS},
        }
        # Column order is taken from the trained model, never from the request dict.
        return pd.DataFrame([row])[list(FEATURES)]

    # ---- public API ----------------------------------------------------
    def predict_burden(self, f: dict) -> float:
        return float(self.b["regressor"].predict(self._feature_frame(f))[0])

    def classify_risk(self, f: dict) -> tuple[str, dict[str, float]]:
        X = self._feature_frame(f)
        clf = self.b["classifier"]
        proba = clf.predict_proba(X)[0]
        probs = {str(c): round(float(p), 4) for c, p in zip(clf.classes_, proba)}
        return str(clf.predict(X)[0]), probs

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
            "risk_thresholds": self.b["risk_thresholds"],
            "cluster_profiles": self.b["cluster_profiles"],
            "countries": sorted(self.b["country_region"]),
        }
