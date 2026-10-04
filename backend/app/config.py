"""Runtime configuration, read from environment variables (see .env.example)."""
from __future__ import annotations

import os
from dataclasses import dataclass, field
from functools import lru_cache
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

DEFAULT_MODEL_PATH = Path(__file__).resolve().parents[1] / "artifacts" / "model_bundle.joblib"
DEFAULT_ORIGINS = "http://localhost:5175,http://127.0.0.1:5175"


@dataclass(frozen=True)
class Settings:
    model_path: Path = DEFAULT_MODEL_PATH
    cors_origins: tuple[str, ...] = field(default_factory=lambda: tuple(DEFAULT_ORIGINS.split(",")))
    iqair_api_key: str | None = None
    opencage_api_key: str | None = None
    news_api_key: str | None = None
    http_timeout: float = 10.0


@lru_cache
def get_settings() -> Settings:
    origins = os.getenv("CORS_ORIGINS", DEFAULT_ORIGINS)
    return Settings(
        model_path=Path(os.getenv("MODEL_PATH", str(DEFAULT_MODEL_PATH))),
        cors_origins=tuple(o.strip() for o in origins.split(",") if o.strip()),
        iqair_api_key=os.getenv("IQAIR_API_KEY"),
        opencage_api_key=os.getenv("OPENCAGE_API_KEY"),
        news_api_key=os.getenv("NEWS_API_KEY"),
        http_timeout=float(os.getenv("HTTP_TIMEOUT", "10")),
    )
