from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field


class Features(BaseModel):
    """Inputs for the health-burden regressor and the risk classifier."""

    model_config = ConfigDict(extra="ignore")

    year: int = Field(ge=1990, le=2100, description="Calendar year")
    exposure_mean_no2: float = Field(ge=0)
    exposure_mean_ozone: float = Field(ge=0)
    exposure_mean_pm25: float = Field(ge=0)
    country: str
    region_name: str


class FeaturesRequest(BaseModel):
    features: Features


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


class RiskResponse(BaseModel):
    risk_level: str
    probabilities: dict[str, float]


class ClusterResponse(BaseModel):
    cluster: int
    label: str
    centroid: dict[str, float]
