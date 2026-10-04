from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.routers import external, predictions
from app.services.model_service import ModelService

log = logging.getLogger("air_quality")


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    try:
        app.state.model_service = ModelService.load(settings.model_path)
        log.info("Loaded model bundle from %s", settings.model_path)
    except FileNotFoundError:
        app.state.model_service = None
        log.error("Model bundle not found at %s. Run `python -m ml.train`.", settings.model_path)
    yield


app = FastAPI(
    title="AirBurden API",
    version="2.0.0",
    description="Exploratory models relating air-pollution exposure to health burden, plus live air-quality lookups.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=list(get_settings().cors_origins),
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

app.include_router(predictions.router)
app.include_router(external.router)


@app.get("/", include_in_schema=False)
def root():
    return {"message": "AirBurden API. See /docs."}


@app.get("/health", tags=["ops"])
def health():
    return {"status": "ok", "model_loaded": app.state.model_service is not None}
