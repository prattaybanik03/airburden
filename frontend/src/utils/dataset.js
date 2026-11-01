import raw from "@data/dataset.json";

// The source extract lists Australia twice per year (once under a pseudo-region named "Australia").
// Drop the duplicate so every chart and the table show one row per country-year, as the models do.
export const rows = raw.filter((d) => d.region_name !== "Australia");

export const COUNTRIES = [...new Set(rows.map((d) => d.country))].sort();
export const YEARS = [...new Set(rows.map((d) => d.year))].sort((a, b) => a - b);
export const REGIONS = [...new Set(rows.map((d) => d.region_name))].sort();

export const METRICS = [
  { value: "health_burden_mean", label: "Health burden", unit: "DALY rate" },
  { value: "exposure_mean_pm25", label: "PM2.5", unit: "source units" },
  { value: "exposure_mean_ozone", label: "Ozone", unit: "source units" },
  { value: "exposure_mean_no2", label: "NO₂", unit: "source units" },
];
export const metricLabel = (v) => METRICS.find((m) => m.value === v)?.label || v;
