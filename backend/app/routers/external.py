"""Live air-quality and news lookups (OpenCage + IQAir + NewsAPI). API keys come from the environment."""
from __future__ import annotations

import requests
from fastapi import APIRouter, HTTPException

from app.config import get_settings

router = APIRouter(tags=["live-data"])

# US EPA AQI bands: (upper bound, category, advice)
AQI_BANDS = [
    (50, "Good", "Air quality is satisfactory; enjoy outdoor activities."),
    (100, "Moderate", "Unusually sensitive people should consider reducing prolonged outdoor exertion."),
    (150, "Unhealthy for Sensitive Groups", "Sensitive groups should reduce prolonged or heavy outdoor exertion."),
    (200, "Unhealthy", "Everyone may begin to experience effects; limit prolonged outdoor exertion."),
    (300, "Very Unhealthy", "Health alert: avoid outdoor exertion."),
    (10**6, "Hazardous", "Emergency conditions: stay indoors and avoid exertion."),
]


def aqi_category(aqi: int) -> tuple[str, str]:
    for upper, category, advice in AQI_BANDS:
        if aqi <= upper:
            return category, advice
    raise ValueError(aqi)  # pragma: no cover


def _require(key: str | None, name: str) -> str:
    if not key:
        raise HTTPException(status_code=503, detail=f"{name} is not configured on the server")
    return key


def _get_json(url: str, params: dict, what: str) -> dict:
    try:
        resp = requests.get(url, params=params, timeout=get_settings().http_timeout)
        data = resp.json()
    except (requests.RequestException, ValueError) as exc:
        raise HTTPException(status_code=502, detail=f"{what} is unavailable") from exc
    if resp.status_code != 200:
        raise HTTPException(status_code=502 if resp.status_code >= 500 else resp.status_code, detail=f"{what} request failed")
    return data


@router.get("/air_quality")
def get_air_quality(city: str):
    s = get_settings()
    geo = _get_json(
        "https://api.opencagedata.com/geocode/v1/json",
        {"q": city, "key": _require(s.opencage_api_key, "OPENCAGE_API_KEY"), "limit": 1},
        "Geocoding service",
    )
    if not geo.get("results"):
        raise HTTPException(status_code=404, detail="City not found")
    loc = geo["results"][0]["geometry"]

    aq = _get_json(
        "https://api.airvisual.com/v2/nearest_city",
        {"lat": loc["lat"], "lon": loc["lng"], "key": _require(s.iqair_api_key, "IQAIR_API_KEY")},
        "Air-quality service",
    )
    try:
        current = aq["data"]["current"]
        aqi = int(current["pollution"]["aqius"])
        w = current["weather"]
        weather = {
            "temperature": w["tp"],
            "humidity": w["hu"],
            "wind_speed": w["ws"],
            "wind_direction": w["wd"],
        }
    except (KeyError, TypeError, ValueError) as exc:
        raise HTTPException(status_code=502, detail="Unexpected response from air-quality service") from exc
    category, advice = aqi_category(aqi)
    return {
        "weather": weather,
        "air_quality": {"aqi": aqi, "category": category, "health_recommendations": advice},
    }


@router.get("/health_news")
def get_health_news(query: str = "health AND (air quality OR air)"):
    s = get_settings()
    data = _get_json(
        "https://newsapi.org/v2/everything",
        {
            "q": query,
            "apiKey": _require(s.news_api_key, "NEWS_API_KEY"),
            "language": "en",
            "sortBy": "relevancy",
            "pageSize": 5,
        },
        "News service",
    )
    articles = [
        {
            "title": a.get("title"),
            "description": a.get("description"),
            "url": a.get("url"),
            "publishedAt": a.get("publishedAt"),
            "source": (a.get("source") or {}).get("name"),
        }
        for a in data.get("articles", [])
    ]
    return {"query": query, "articles": articles}
