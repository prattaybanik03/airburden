"""Model endpoints.

``/v1/...``  versioned API (documented in the OpenAPI schema).
Legacy unversioned paths (``/predict_health_burden`` etc.) are kept for the dashboard and marked deprecated.
"""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Request

from app.observability import OUT_OF_RANGE, PREDICTED_BURDEN, PREDICTIONS
from app.schemas import (
    BatchItem,
    BatchRequest,
    BatchResponse,
    BurdenResponse,
    ClusterRequest,
    ClusterResponse,
    Features,
    FeaturesRequest,
    RiskResponse,
)
from app.services.model_service import DISCLAIMER, INFO_NOTE, ModelService, UnknownInput

UNIT = "DALY rate"
router = APIRouter(prefix="/v1", tags=["models v1"])
legacy_router = APIRouter(tags=["models (legacy)"], deprecated=True)


def get_service(request: Request) -> ModelService:
    service = getattr(request.app.state, "model_service", None)
    if service is None:
        raise HTTPException(status_code=503, detail="Model artifacts not loaded. Run `python -m ml.pipeline run`.")
    return service


def _rejected(model: str, exc: UnknownInput) -> HTTPException:
    PREDICTIONS.labels(model, "rejected").inc()
    return HTTPException(status_code=422, detail=str(exc))


def _warnings(svc: ModelService, f: dict) -> list[str]:
    for feature in svc.out_of_range_features(f):
        OUT_OF_RANGE.labels(feature).inc()
    return svc.range_warnings(f)


def _burden(f: Features, svc: ModelService) -> BurdenResponse:
    data = f.model_dump()
    try:
        value = svc.predict_burden(data)
    except UnknownInput as exc:
        raise _rejected("regressor", exc) from exc
    PREDICTIONS.labels("regressor", "ok").inc()
    PREDICTED_BURDEN.observe(value)
    return BurdenResponse(
        prediction=round(value, 1), unit=UNIT, disclaimer=DISCLAIMER, model_version=svc.version, warnings=_warnings(svc, data)
    )


def _risk(f: Features, svc: ModelService) -> RiskResponse:
    data = f.model_dump()
    try:
        label, probs = svc.classify_risk(data)
    except UnknownInput as exc:
        raise _rejected("classifier", exc) from exc
    PREDICTIONS.labels("classifier", "ok").inc()
    return RiskResponse(risk_level=label, probabilities=probs, model_version=svc.version, warnings=_warnings(svc, data))


def _cluster(body: ClusterRequest, svc: ModelService) -> ClusterResponse:
    PREDICTIONS.labels("kmeans", "ok").inc()
    return ClusterResponse(**svc.cluster(body.model_dump()))


def _info(svc: ModelService) -> dict:
    return svc.info() | {"disclaimer": INFO_NOTE}


# ---- v1 -----------------------------------------------------------------------------------------------
@router.post("/predictions/health-burden", response_model=BurdenResponse, summary="Estimate the DALY rate")
def v1_health_burden(body: Features, svc: ModelService = Depends(get_service)):
    return _burden(body, svc)


@router.post("/predictions/risk-level", response_model=RiskResponse, summary="Classify the risk tercile")
def v1_risk_level(body: Features, svc: ModelService = Depends(get_service)):
    return _risk(body, svc)


@router.post("/predictions/batch", response_model=BatchResponse, summary="Burden and risk for up to 500 rows")
def v1_batch(body: BatchRequest, svc: ModelService = Depends(get_service)):
    rows = [item.model_dump() for item in body.items]
    try:
        items = svc.predict_batch(rows)
    except UnknownInput as exc:
        raise _rejected("batch", exc) from exc
    PREDICTIONS.labels("batch", "ok").inc(len(items))
    for item, row in zip(items, rows):
        PREDICTED_BURDEN.observe(item["prediction"])
        for feature in svc.out_of_range_features(row):
            OUT_OF_RANGE.labels(feature).inc()
    return BatchResponse(model_version=svc.version, unit=UNIT, disclaimer=DISCLAIMER, items=[BatchItem(**i) for i in items])


@router.post("/clusters/assign", response_model=ClusterResponse, summary="Nearest exposure profile")
def v1_cluster(body: ClusterRequest, svc: ModelService = Depends(get_service)):
    return _cluster(body, svc)


@router.get("/model", summary="Model metadata, lineage, thresholds and clusters")
def v1_model(svc: ModelService = Depends(get_service)):
    return _info(svc)


# ---- legacy (dashboard) ---------------------------------------------------------------------------------
@legacy_router.post("/predict_health_burden", response_model=BurdenResponse)
def predict_health_burden(body: FeaturesRequest, svc: ModelService = Depends(get_service)):
    return _burden(body.features, svc)


@legacy_router.post("/classify_risk_level", response_model=RiskResponse)
def classify_risk_level(body: FeaturesRequest, svc: ModelService = Depends(get_service)):
    return _risk(body.features, svc)


@legacy_router.post("/get_cluster_info", response_model=ClusterResponse)
def get_cluster_info(body: ClusterRequest, svc: ModelService = Depends(get_service)):
    return _cluster(body, svc)


@legacy_router.get("/model_info")
def model_info(svc: ModelService = Depends(get_service)):
    return _info(svc)
