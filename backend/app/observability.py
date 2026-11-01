"""Structured logging, request IDs and Prometheus metrics for the API."""
from __future__ import annotations

import json
import logging
import time
import uuid
from contextvars import ContextVar

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from prometheus_client import Counter, Gauge, Histogram

request_id_var: ContextVar[str] = ContextVar("request_id", default="-")
access_log = logging.getLogger("airburden.access")

# ---- metrics ---------------------------------------------------------------------------------------
HTTP_REQUESTS = Counter("airburden_http_requests_total", "HTTP requests", ["method", "route", "status"])
HTTP_LATENCY = Histogram(
    "airburden_http_request_duration_seconds",
    "HTTP request latency",
    ["method", "route"],
    buckets=(0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10),
)
PREDICTIONS = Counter("airburden_predictions_total", "Model predictions served", ["model", "outcome"])
PREDICTED_BURDEN = Histogram(
    "airburden_predicted_daly_rate",
    "Distribution of predicted DALY rates (watch for output drift)",
    buckets=(250, 500, 1000, 2000, 4000, 8000, 12000, 16000, 20000),
)
OUT_OF_RANGE = Counter("airburden_out_of_range_inputs_total", "Inputs outside the training range", ["feature"])
MODEL_INFO = Gauge("airburden_model_info", "Loaded model (value is always 1)", ["model_version", "git_commit", "fingerprint"])


# ---- logging ---------------------------------------------------------------------------------------
class JsonFormatter(logging.Formatter):
    """One JSON object per line, with the current request ID, for log aggregation (Loki, CloudWatch, ...)."""

    def format(self, record: logging.LogRecord) -> str:
        entry = {
            "ts": self.formatTime(record, "%Y-%m-%dT%H:%M:%S"),
            "level": record.levelname,
            "logger": record.name,
            "msg": record.getMessage(),
            "request_id": request_id_var.get(),
        }
        entry.update(getattr(record, "fields", {}))
        if record.exc_info:
            entry["exc"] = self.formatException(record.exc_info)
        return json.dumps(entry, default=str)


def configure_logging(level: str = "INFO", fmt: str = "json") -> None:
    handler = logging.StreamHandler()
    handler.setFormatter(
        JsonFormatter() if fmt == "json" else logging.Formatter("%(asctime)s %(levelname)s %(name)s: %(message)s")
    )
    root = logging.getLogger("airburden")
    root.handlers[:] = [handler]
    root.setLevel(level.upper())
    root.propagate = False


# ---- middleware ------------------------------------------------------------------------------------
def install(app: FastAPI) -> None:
    @app.middleware("http")
    async def observe(request: Request, call_next):
        rid = request.headers.get("x-request-id") or uuid.uuid4().hex
        token = request_id_var.set(rid[:64])
        started = time.perf_counter()
        status = 500
        try:
            response = await call_next(request)
            status = response.status_code
        finally:
            elapsed = time.perf_counter() - started
            route = getattr(request.scope.get("route"), "path", "unmatched")
            if route != "/metrics":
                HTTP_REQUESTS.labels(request.method, route, str(status)).inc()
                HTTP_LATENCY.labels(request.method, route).observe(elapsed)
                access_log.info(
                    "request",
                    extra={"fields": {"method": request.method, "route": route, "status": status, "ms": round(elapsed * 1000, 1)}},
                )
            request_id_var.reset(token)
        response.headers["X-Request-ID"] = rid[:64]
        service = getattr(request.app.state, "model_service", None)
        if service is not None:
            response.headers["X-Model-Version"] = service.version
        return response

    @app.exception_handler(Exception)
    async def unhandled(request: Request, exc: Exception):
        logging.getLogger("airburden.api").exception("unhandled error on %s", request.url.path)
        return JSONResponse({"detail": "Internal server error", "request_id": request_id_var.get()}, status_code=500)
