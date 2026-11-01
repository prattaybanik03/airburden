import { useMemo, useState } from "react";
import { Box, Slider, Stack, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import Plot from "react-plotly.js";
import { METRICS, YEARS } from "../utils/dataset";
import { burdenScale, chartConfig, colorbar, exposureScale, geoLayout } from "../utils/plotly";

export const MetricToggle = ({ value, onChange, options = METRICS }) => (
  <ToggleButtonGroup
    exclusive
    size="small"
    value={value}
    onChange={(_, v) => v && onChange(v)}
    sx={{ flexWrap: "wrap", "& .MuiToggleButton-root": { px: 1.75, textTransform: "none", fontWeight: 600, borderRadius: 2 } }}
  >
    {options.map((m) => (
      <ToggleButton key={m.value} value={m.value}>
        {m.label}
      </ToggleButton>
    ))}
  </ToggleButtonGroup>
);

const ChoroplethMap = ({ data, metric }) => {
  const [year, setYear] = useState(YEARS[YEARS.length - 1]);
  const m = METRICS.find((x) => x.value === metric);
  const yearRows = useMemo(() => data.filter((d) => d.year === year), [data, year]);
  const isBurden = metric === "health_burden_mean";

  return (
    <>
      <Box sx={{ height: { xs: 280, sm: 400, md: 500 } }}>
        <Plot
          data={[
            {
              type: "choropleth",
              locationmode: "ISO-3",
              locations: yearRows.map((d) => d.iso3),
              z: yearRows.map((d) => d[metric]),
              text: yearRows.map((d) => d.country),
              hovertemplate: `<b>%{text}</b><br>${m.label}: %{z:,} ${m.unit}<extra></extra>`,
              colorscale: isBurden ? burdenScale : exposureScale,
              marker: { line: { color: "#fff", width: 0.4 } },
              colorbar: colorbar(m.unit),
            },
          ]}
          layout={geoLayout()}
          config={chartConfig}
          useResizeHandler
          style={{ width: "100%", height: "100%" }}
        />
      </Box>
      <Stack direction="row" spacing={3} alignItems="center" sx={{ pt: 2, pr: 2 }}>
        <Typography className="tabular" sx={{ fontWeight: 800, fontSize: "1.4rem", minWidth: 56 }}>
          {year}
        </Typography>
        <Slider aria-label="Year" value={year} min={YEARS[0]} max={YEARS[YEARS.length - 1]} step={1} valueLabelDisplay="auto" onChange={(_, v) => setYear(v)} />
      </Stack>
    </>
  );
};

export default ChoroplethMap;
