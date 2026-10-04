import pytest

from app.routers.external import aqi_category


@pytest.mark.parametrize(
    "aqi,expected",
    [(0, "Good"), (50, "Good"), (51, "Moderate"), (100, "Moderate"), (101, "Unhealthy for Sensitive Groups"),
     (151, "Unhealthy"), (201, "Very Unhealthy"), (301, "Hazardous")],
)
def test_aqi_bands(aqi, expected):
    assert aqi_category(aqi)[0] == expected


class FakeResp:
    def __init__(self, data, status=200):
        self._d, self.status_code = data, status

    def json(self):
        return self._d


def test_air_quality_happy_path(client, monkeypatch):
    def fake_get(url, params=None, timeout=None):
        assert timeout, "every outbound call must have a timeout"
        if "opencage" in url:
            return FakeResp({"results": [{"geometry": {"lat": -37.8, "lng": 144.9}}]})
        return FakeResp({"data": {"current": {"pollution": {"aqius": 42}, "weather": {"tp": 18, "hu": 60, "ws": 3, "wd": 180}}}})

    monkeypatch.setattr("app.routers.external.requests.get", fake_get)
    body = client.get("/air_quality", params={"city": "Melbourne"}).json()
    assert body["air_quality"]["category"] == "Good" and body["weather"]["temperature"] == 18


def test_air_quality_city_not_found(client, monkeypatch):
    monkeypatch.setattr("app.routers.external.requests.get", lambda *a, **k: FakeResp({"results": []}))
    assert client.get("/air_quality", params={"city": "zzzz"}).status_code == 404


def test_news_missing_key_is_503_not_500(client, monkeypatch):
    from app.config import get_settings
    monkeypatch.delenv("NEWS_API_KEY")
    get_settings.cache_clear()
    assert client.get("/health_news").status_code == 503


def test_news_never_echoes_key(client, monkeypatch, capsys):
    monkeypatch.setattr("app.routers.external.requests.get", lambda *a, **k: FakeResp({"articles": [
        {"title": "t", "description": "d", "url": "u", "publishedAt": "p", "source": {"name": "s"}}]}))
    r = client.get("/health_news")
    assert r.status_code == 200 and r.json()["articles"][0]["source"] == "s"
    assert "test-news-key" not in r.text and "test-news-key" not in capsys.readouterr().out
