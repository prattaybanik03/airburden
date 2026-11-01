from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field

MAX_BATCH = 500


class Features(BaseModel):
    """Inputs for the health-burden regressor and the risk classifier."""

    model_config = ConfigDict(
        extra="ignore",
        json_schema_extra={
            "examples": [
                {
                    "year": 2015,
                    "exposure_mean_no2": 400,
                    "exposure_mean_ozone": 500,
                    "exposure_mean_pm25": 600,
                    "country": "Afghanistan",
                    "region_name": "Eastern Mediterranean Region",
                }
            ]
        },
    )

    year: int = Field(ge=1990, le=2100, description="Calendar year")
    exposure_mean_no2: float = Field(ge=0)
    exposure_mean_ozone: float = Field(ge=0)
    exposure_mean_pm25: float = Field(ge=0)
    country: str
    region_name: str


class FeaturesRequest(BaseModel):
    """Legacy (unversioned) request envelope used by the dashboard."""

    features: Features


class BatchRequest(BaseModel):
    items: list[Features] = Field(min_length=1, max_length=MAX_BATCH)


class ClusterRequest(BaseModel):
    """Clustering only uses the three pollutant exposures; extra keys are ignored."""

    model_config = ConfigDict(extra="ignore")

    exposure_mean_no2: float = Field(ge=0)
    exposure_mean_ozone: float = Field(ge=0)
    exposure_mean_pm25: float = Field(ge=0)


class BurdenResponse(BaseModel):
    prediction: float
    unit: str
    disclaimer: str
    model_version: str | None = None
    warnings: list[str] = Field(default_factory=list, description="e.g. inputs outside the training range")


class RiskResponse(BaseModel):
    risk_level: str
    probabilities: dict[str, float]
    model_version: str | None = None
    warnings: list[str] = Field(default_factory=list)


class ClusterResponse(BaseModel):
    cluster: int
    label: str
    centroid: dict[str, float]


class BatchItem(BaseModel):
    prediction: float
    risk_level: str
    probabilities: dict[str, float]
    warnings: list[str] = Field(default_factory=list)


class BatchResponse(BaseModel):
    model_version: str
    unit: str
    disclaimer: str
    items: list[BatchItem]


class HealthResponse(BaseModel):
    status: str
    model_loaded: bool


class ReadyResponse(BaseModel):
    status: str
    model_version: str
    model_fingerprint: str | None = None
