import { useMemo } from "react";
import { Box } from "@mui/material";
import Plot from "react-plotly.js";
import { chartConfig, chartLayout } from "../utils/plotly";

const SERIES = [
  { key: "exposure_mean_no2", name: "NO₂", color: "#F59E0B" },
  { key: "exposure_mean_ozone", name: "Ozone", color: "#0EA5E9" },
  { key: "exposure_mean_pm25", name: "PM2.5", color: "#6366F1" },
];

const HistoricalPollutantChart = ({ data, country }) => {
  const rows = useMemo(() => data.filter((d) => d.country === country).sort((a, b) => a.year - b.year), [data, country]);

  return (
    <Box sx={{ height: 420 }}>
      <Plot
        data={SERIES.map((s) => ({
          x: rows.map((d) => d.year),
          y: rows.map((d) => d[s.key]),
          type: "scatter",
          mode: "lines+markers",
          name: s.name,
          line: { color: s.color, width: 2.5, shape: "spline", smoothing: 0.4 },
          marker: { size: 5 },
          hovertemplate: `${s.name}: %{y}<extra>%{x}</extra>`,
        }))}
        layout={chartLayout({
          margin: { t: 40, l: 56, r: 16, b: 48 },
          hovermode: "x unified",
          xaxis: { title: { text: "Year" } },
          yaxis: { title: { text: "Exposure (source units)" }, rangemode: "tozero" },
        })}
        config={chartConfig}
        useResizeHandler
        style={{ width: "100%", height: "100%" }}
      />
    </Box>
  );
};

export default HistoricalPollutantChart;
