from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from prometheus_client import CONTENT_TYPE_LATEST, generate_latest

from app import observability
from app.config import get_settings
from app.routers import external, predictions
from app.schemas import HealthResponse, ReadyResponse
from app.services.model_service import IncompatibleBundle, ModelService

log = logging.getLogger("airburden.api")


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    observability.configure_logging(settings.log_level, settings.log_format)
    app.state.model_service = None
    try:
        service = ModelService.load(settings.model_path)
    except FileNotFoundError:
        log.error("Model bundle not found at %s. Run `python -m ml.pipeline run`.", settings.model_path)
    except IncompatibleBundle as exc:
        log.error("Refusing to serve %s: %s", settings.model_path, exc)
    else:
        app.state.model_service = service
        observability.MODEL_INFO.clear()
        observability.MODEL_INFO.labels(service.version, service.b["meta"].get("git_commit"), (service.fingerprint or "")[:12]).set(1)
        log.info("Loaded model %s from %s", service.version, settings.model_path)
    yield


app = FastAPI(
    title="AirBurden API",
    version="2.1.0",
    description=(
        "Exploratory models relating air-pollution exposure to health burden, plus live air-quality lookups.\n\n"
        "Use the versioned `/v1` endpoints. The unversioned endpoints are kept for the dashboard and are deprecated."
    ),
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=list(get_settings().cors_origins),
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "X-Request-ID"],
    expose_headers=["X-Request-ID", "X-Model-Version"],
)
observability.install(app)

app.include_router(predictions.router)
app.include_router(predictions.legacy_router)
app.include_router(external.router)


@app.get("/", include_in_schema=False)
def root():
    return {"message": "AirBurden API. See /docs."}


@app.get("/health", tags=["ops"], response_model=HealthResponse, summary="Liveness: the process is up")
def health():
    return {"status": "ok", "model_loaded": app.state.model_service is not None}


@app.get(
    "/ready",
    tags=["ops"],
    response_model=ReadyResponse,
    responses={503: {"description": "No model loaded"}},
    summary="Readiness: a compatible model is loaded and traffic can be routed here",
)
def ready():
    svc = app.state.model_service
    if svc is None:
        return JSONResponse({"status": "not ready", "detail": "no model loaded"}, status_code=503)
    return {"status": "ready", "model_version": svc.version, "model_fingerprint": svc.fingerprint}


@app.get("/metrics", tags=["ops"], summary="Prometheus metrics")
def metrics():
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)
