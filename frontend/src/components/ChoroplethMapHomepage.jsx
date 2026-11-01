import { useMemo, useState } from "react";
import { Box, Card, Slider, Stack, Typography } from "@mui/material";
import Plot from "react-plotly.js";
import data from "@data/dataset.json";
import { burdenScale, chartConfig, colorbar, geoLayout } from "../utils/plotly";
import { Section, SectionHeader } from "./ui";

const YEARS = [...new Set(data.map((d) => d.year))].sort((a, b) => a - b);
// The source lists Australia twice (once as a pseudo-region); keep one row per country-year.
const rows = data.filter((d) => d.region_name !== "Australia");

const ChoroplethMapHomepage = () => {
  const [year, setYear] = useState(YEARS[YEARS.length - 1]);
  const yearRows = useMemo(() => rows.filter((d) => d.year === year), [year]);

  return (
    <Section id="global-map">
      <SectionHeader
        eyebrow="Global picture"
        title="Where air pollution costs the most health"
        subtitle="Health burden attributable to air pollution (DALY rate) by country. Drag the slider to move through time."
      />
      <Card sx={{ p: { xs: 1.5, md: 3 } }}>
        <Box sx={{ height: { xs: 280, sm: 380, md: 480 } }}>
          <Plot
            data={[
              {
                type: "choropleth",
                locationmode: "ISO-3",
                locations: yearRows.map((d) => d.iso3),
                z: yearRows.map((d) => d.health_burden_mean),
                text: yearRows.map((d) => d.country),
                hovertemplate: "<b>%{text}</b><br>%{z:,} DALY rate<extra></extra>",
                colorscale: burdenScale,
                zmin: 0,
                zmax: 16000,
                marker: { line: { color: "#fff", width: 0.4 } },
                colorbar: colorbar("DALY rate"),
              },
            ]}
            layout={geoLayout()}
            config={chartConfig}
            useResizeHandler
            style={{ width: "100%", height: "100%" }}
          />
        </Box>
        <Stack direction="row" spacing={3} alignItems="center" sx={{ px: { xs: 1.5, md: 2 }, pt: 2 }}>
          <Typography className="tabular" sx={{ fontWeight: 800, fontSize: "1.6rem", minWidth: 64 }}>
            {year}
          </Typography>
          <Slider
            aria-label="Year"
            value={year}
            min={YEARS[0]}
            max={YEARS[YEARS.length - 1]}
            step={1}
            marks={[{ value: YEARS[0], label: String(YEARS[0]) }, { value: 2005, label: "2005" }, { value: YEARS[YEARS.length - 1], label: String(YEARS[YEARS.length - 1]) }]}
            onChange={(_, v) => setYear(v)}
            sx={{ flex: 1, mr: 2 }}
          />
        </Stack>
      </Card>
    </Section>
  );
};

export default ChoroplethMapHomepage;
