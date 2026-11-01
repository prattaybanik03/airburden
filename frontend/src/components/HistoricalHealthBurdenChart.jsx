import { useMemo } from "react";
import { Box } from "@mui/material";
import Plot from "react-plotly.js";
import { chartConfig, chartLayout } from "../utils/plotly";
import { METRICS } from "../utils/dataset";
import { tokens } from "../theme";

/** Compare one metric over time for up to two countries. */
const HistoricalHealthBurdenChart = ({ data, countries, metric }) => {
  const m = METRICS.find((x) => x.value === metric);
  const traces = useMemo(
    () =>
      countries.filter(Boolean).map((c, i) => {
        const rows = data.filter((d) => d.country === c).sort((a, b) => a.year - b.year);
        const color = [tokens.teal, "#EC4899"][i];
        return {
          x: rows.map((d) => d.year),
          y: rows.map((d) => d[metric]),
          type: "scatter",
          mode: "lines",
          name: c,
          line: { color, width: 3, shape: "spline", smoothing: 0.4 },
          fill: "tozeroy",
          fillcolor: `${color}14`,
          hovertemplate: `${c}: %{y:,}<extra>%{x}</extra>`,
        };
      }),
    [data, countries, metric]
  );

  return (
    <Box sx={{ height: 420 }}>
      <Plot
        data={traces}
        layout={chartLayout({
          margin: { t: 40, l: 64, r: 16, b: 48 },
          hovermode: "x unified",
          xaxis: { title: { text: "Year" }, range: [1990, 2020] },
          yaxis: { title: { text: `${m.label} (${m.unit})` }, rangemode: "tozero" },
        })}
        config={chartConfig}
        useResizeHandler
        style={{ width: "100%", height: "100%" }}
      />
    </Box>
  );
};

export default HistoricalHealthBurdenChart;
