import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Alert, Autocomplete, Box, Chip, Grid, Link, Stack, TextField } from "@mui/material";
import { alpha } from "@mui/material/styles";
import TableRowsRoundedIcon from "@mui/icons-material/TableRowsRounded";
import PublicRoundedIcon from "@mui/icons-material/PublicRounded";
import TimelineRoundedIcon from "@mui/icons-material/TimelineRounded";
import CompareArrowsRoundedIcon from "@mui/icons-material/CompareArrowsRounded";
import DataTable from "../components/DataTable";
import ChoroplethMap, { MetricToggle } from "../components/ChoroplethMap";
import HistoricalPollutantChart from "../components/HistoricalPollutantChart";
import HistoricalHealthBurdenChart from "../components/HistoricalHealthBurdenChart";
import { PageHeader, Panel, Section, Stat } from "../components/ui";
import { REPO_URL } from "../utils/site";
import { COUNTRIES, METRICS, rows } from "../utils/dataset";

const JUMP = [
  { id: "table", label: "Table" },
  { id: "choropleth-map", label: "World map" },
  { id: "trends", label: "Pollutant trends" },
  { id: "compare", label: "Compare countries" },
];

const CountryPicker = ({ label, value, onChange, allowEmpty = false }) => (
  <Autocomplete
    size="small"
    options={COUNTRIES}
    value={value || null}
    disableClearable={!allowEmpty}
    onChange={(_, v) => onChange(v || "")}
    sx={{ minWidth: { xs: "100%", sm: 220 } }}
    renderInput={(p) => <TextField {...p} label={label} />}
  />
);

const AirQualityDataPage = () => {
  const location = useLocation();
  const [mapMetric, setMapMetric] = useState("exposure_mean_pm25");
  const [trendCountry, setTrendCountry] = useState("Afghanistan");
  const [compare, setCompare] = useState(["Afghanistan", "Lesotho"]);
  const [compareMetric, setCompareMetric] = useState("health_burden_mean");

  useEffect(() => {
    if (location.hash) document.querySelector(location.hash)?.scrollIntoView({ behavior: "smooth" });
  }, [location]);

  return (
    <>
      <PageHeader
        eyebrow="Data explorer"
        title="Explore the dataset"
        subtitle="Country-level exposure to NO₂, ozone and PM2.5, and the health burden attributed to them, from the State of Global Air."
      >
        <Box sx={{ mt: 5, display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, max-content)" }, columnGap: 6, rowGap: 3 }}>
          <Stat light value="172" label="countries" />
          <Stat light value="1990-2020" label="annual estimates" />
          <Stat light value={rows.length.toLocaleString()} label="country-years" />
          <Stat light value="4" label="measures" />
        </Box>
      </PageHeader>

      <Box
        sx={{
          position: "sticky",
          top: { xs: 64, md: 72 },
          zIndex: 5,
          backgroundColor: alpha("#F6F8FB", 0.85),
          backdropFilter: "blur(10px)",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Stack direction="row" spacing={1} sx={{ maxWidth: 1200, mx: "auto", px: { xs: 2, sm: 3 }, py: 1.25, overflowX: "auto" }}>
          {JUMP.map((j) => (
            <Chip key={j.id} label={j.label} component="a" href={`#${j.id}`} clickable variant="outlined" sx={{ bgcolor: "#fff" }} />
          ))}
        </Stack>
      </Box>

      <Section sx={{ pt: { xs: 4, md: 6 } }}>
        <Alert severity="warning" sx={{ mb: 3 }}>
          About 7-8% of each pollutant column in this extract looks corrupted (lost decimal points), so pollutant values are shown in
          &quot;source units&quot;. The health-burden column is unaffected.{" "}
          <Link href={`${REPO_URL}/blob/main/docs/data-quality.md`} target="_blank" rel="noopener" sx={{ fontWeight: 600 }}>
            Read the data-quality notes
          </Link>
          .
        </Alert>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Panel id="table" icon={<TableRowsRoundedIcon />} title="Data table" subtitle="Filter, sort and export any slice of the data.">
              <DataTable data={rows} />
            </Panel>
          </Grid>

          <Grid item xs={12}>
            <Panel
              id="choropleth-map"
              icon={<PublicRoundedIcon />}
              title="World map"
              subtitle="Pick a measure and a year."
              action={<MetricToggle value={mapMetric} onChange={setMapMetric} />}
            >
              <ChoroplethMap data={rows} metric={mapMetric} />
            </Panel>
          </Grid>

          <Grid item xs={12} lg={6}>
            <Panel
              id="trends"
              icon={<TimelineRoundedIcon />}
              title="Pollutant trends"
              subtitle="All three exposures for one country."
              action={<CountryPicker label="Country" value={trendCountry} onChange={setTrendCountry} />}
            >
              <HistoricalPollutantChart data={rows} country={trendCountry} />
            </Panel>
          </Grid>

          <Grid item xs={12} lg={6}>
            <Panel id="compare" icon={<CompareArrowsRoundedIcon />} title="Compare countries" subtitle="One measure, two countries, 31 years.">
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mb: 2 }}>
                <CountryPicker label="Country A" value={compare[0]} onChange={(v) => setCompare([v, compare[1]])} />
                <CountryPicker label="Country B" value={compare[1]} allowEmpty onChange={(v) => setCompare([compare[0], v])} />
              </Stack>
              <MetricToggle value={compareMetric} onChange={setCompareMetric} options={METRICS} />
              <HistoricalHealthBurdenChart data={rows} countries={compare} metric={compareMetric} />
            </Panel>
          </Grid>
        </Grid>
      </Section>
    </>
  );
};

export default AirQualityDataPage;
