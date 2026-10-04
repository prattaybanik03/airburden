from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Request

from app.schemas import (
    BurdenResponse,
    ClusterRequest,
    ClusterResponse,
    FeaturesRequest,
    RiskResponse,
)
from app.services.model_service import DISCLAIMER, INFO_NOTE, ModelService, UnknownInput

router = APIRouter(tags=["models"])


def get_service(request: Request) -> ModelService:
    service = getattr(request.app.state, "model_service", None)
    if service is None:
        raise HTTPException(status_code=503, detail="Model artifacts not loaded. Run `python -m ml.train`.")
    return service


@router.post("/predict_health_burden", response_model=BurdenResponse)
def predict_health_burden(body: FeaturesRequest, svc: ModelService = Depends(get_service)):
    try:
        value = svc.predict_burden(body.features.model_dump())
    except UnknownInput as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    return BurdenResponse(prediction=round(value, 1), unit="DALY rate", disclaimer=DISCLAIMER)


@router.post("/classify_risk_level", response_model=RiskResponse)
def classify_risk_level(body: FeaturesRequest, svc: ModelService = Depends(get_service)):
    try:
        label, probs = svc.classify_risk(body.features.model_dump())
    except UnknownInput as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    return RiskResponse(risk_level=label, probabilities=probs)


@router.post("/get_cluster_info", response_model=ClusterResponse)
def get_cluster_info(body: ClusterRequest, svc: ModelService = Depends(get_service)):
    return ClusterResponse(**svc.cluster(body.model_dump()))


@router.get("/model_info")
def model_info(svc: ModelService = Depends(get_service)):
    return svc.info() | {"disclaimer": INFO_NOTE}
