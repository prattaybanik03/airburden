import { useEffect, useMemo, useRef, useState } from "react";
import { useFormik } from "formik";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  InputAdornment,
  LinearProgress,
  Link,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import AutoFixHighRoundedIcon from "@mui/icons-material/AutoFixHighRounded";
import MonitorHeartRoundedIcon from "@mui/icons-material/MonitorHeartRounded";
import ShieldRoundedIcon from "@mui/icons-material/ShieldRounded";
import BubbleChartRoundedIcon from "@mui/icons-material/BubbleChartRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import ScienceRoundedIcon from "@mui/icons-material/ScienceRounded";
import { predictionFormSchema } from "../utils/validationSchema";
import countriesRegions from "../assets/countriesRegions.json";
import { apiErrorMessage, getClusterInfo, getHealthPrediction, getRiskClassification } from "../services/apiService";
import { IconTile, PageHeader, Panel, Reveal, Section, SectionHeader } from "../components/ui";
import { REPO_URL } from "../utils/site";
import { tokens } from "../theme";

const REGIONS = Object.keys(countriesRegions);
const COUNTRY_REGION = Object.fromEntries(Object.entries(countriesRegions).flatMap(([r, cs]) => cs.map((c) => [c, r])));
const ALL_COUNTRIES = Object.keys(COUNTRY_REGION).sort();

const EMPTY = { year: "", exposureNo2: "", exposureOzone: "", exposurePm25: "", country: "", regionName: "" };
const EXAMPLE = {
  year: 1990,
  exposureNo2: 123,
  exposureOzone: 566,
  exposurePm25: 642,
  country: "Afghanistan",
  regionName: "Eastern Mediterranean Region",
};
const RISK_ORDER = ["Low Risk", "Moderate Risk", "High Risk"];
const POLLUTANT_LABEL = { exposure_mean_no2: "NO₂", exposure_mean_ozone: "Ozone", exposure_mean_pm25: "PM2.5" };

const toPayload = (v) => ({
  year: parseInt(v.year, 10),
  exposure_mean_no2: parseFloat(v.exposureNo2),
  exposure_mean_ozone: parseFloat(v.exposureOzone),
  exposure_mean_pm25: parseFloat(v.exposurePm25),
  country: v.country,
  region_name: v.regionName,
});

// ---------------------------------------------------------------------------------------------- results
const ResultCard = ({ icon, color, title, state, children }) => (
  <Card sx={{ p: 3, boxShadow: "none", height: "100%" }}>
    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
      <IconTile color={color} size={36}>
        {icon}
      </IconTile>
      <Typography variant="h6">{title}</Typography>
    </Stack>
    {state?.status === "rejected" ? (
      <Alert severity="error" variant="outlined">
        {state.message}
      </Alert>
    ) : (
      children
    )}
  </Card>
);

const BurdenResult = ({ data }) => (
  <>
    <Typography className="tabular" sx={{ fontSize: { xs: "2.4rem", md: "2.8rem" }, fontWeight: 800, letterSpacing: "-0.035em", lineHeight: 1 }}>
      {Math.round(data.prediction).toLocaleString()}
    </Typography>
    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
      {data.unit} attributable to air pollution
    </Typography>
    {data.warnings?.length > 0 && (
      <Alert severity="warning" icon={<WarningAmberRoundedIcon fontSize="small" />} sx={{ mt: 2 }}>
        {data.warnings.map((w) => (
          <div key={w}>{w}</div>
        ))}
      </Alert>
    )}
  </>
);

const RiskResult = ({ data }) => {
  const color = tokens.risk[data.risk_level] || tokens.teal;
  return (
    <>
      <Chip label={data.risk_level} sx={{ bgcolor: alpha(color, 0.12), color, fontSize: "1rem", height: 36, px: 1 }} />
      <Stack spacing={1.5} sx={{ mt: 2.5 }}>
        {RISK_ORDER.filter((k) => k in (data.probabilities || {})).map((k) => (
          <Box key={k}>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
              <Typography variant="body2">{k}</Typography>
              <Typography variant="body2" className="tabular" sx={{ fontWeight: 650 }}>
                {Math.round(data.probabilities[k] * 100)}%
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={data.probabilities[k] * 100}
              sx={{ bgcolor: alpha(tokens.risk[k], 0.12), "& .MuiLinearProgress-bar": { bgcolor: tokens.risk[k] } }}
            />
          </Box>
        ))}
      </Stack>
    </>
  );
};

const ClusterResult = ({ data }) => (
  <>
    <Typography variant="overline" color="text.secondary">
      Profile {data.cluster}
    </Typography>
    <Typography variant="h5" sx={{ mt: 0.25 }}>
      {data.label}
    </Typography>
    {data.centroid && (
      <>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2, mb: 1 }}>
          Typical exposure in this profile
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {Object.entries(data.centroid).map(([k, v]) => (
            <Chip key={k} variant="outlined" label={`${POLLUTANT_LABEL[k] || k} ${Math.round(v)}`} className="tabular" />
          ))}
        </Stack>
      </>
    )}
  </>
);

const EmptyResults = () => (
  <Card
    sx={{
      height: "100%",
      minHeight: 420,
      boxShadow: "none",
      borderStyle: "dashed",
      display: "grid",
      placeItems: "center",
      textAlign: "center",
      p: 4,
      background: `radial-gradient(400px 200px at 50% 0%, ${alpha(tokens.teal, 0.06)}, transparent)`,
    }}
  >
    <Box>
      <IconTile size={56}>
        <ScienceRoundedIcon />
      </IconTile>
      <Typography variant="h5" sx={{ mt: 2.5 }}>
        Results appear here
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1, maxWidth: 320, mx: "auto" }}>
        Fill in a country, year and exposure levels, or load the example, then run all three models at once.
      </Typography>
    </Box>
  </Card>
);

// ---------------------------------------------------------------------------------------------- form
const NumberField = ({ formik, name, label, unit, placeholder }) => (
  <TextField
    fullWidth
    type="number"
    name={name}
    label={label}
    placeholder={placeholder}
    value={formik.values[name]}
    onChange={formik.handleChange}
    onBlur={formik.handleBlur}
    error={formik.touched[name] && Boolean(formik.errors[name])}
    helperText={formik.touched[name] && formik.errors[name]}
    inputProps={{ inputMode: "decimal", step: "any" }}
    InputProps={unit ? { endAdornment: <InputAdornment position="end">{unit}</InputAdornment> } : undefined}
  />
);

const AiMlPage = () => {
  const [results, setResults] = useState(null);
  const resultsRef = useRef(null);

  // On narrow screens the results render below the form: bring them into view after a run.
  useEffect(() => {
    if (results && window.innerWidth < 900) resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [results]);

  const formik = useFormik({
    initialValues: EMPTY,
    validationSchema: predictionFormSchema,
    onSubmit: async (values) => {
      const payload = toPayload(values);
      const settled = await Promise.allSettled([
        getHealthPrediction({ features: payload }),
        getRiskClassification({ features: payload }),
        getClusterInfo(payload),
      ]);
      const [burden, risk, cluster] = settled.map((s) =>
        s.status === "fulfilled" ? { status: "fulfilled", data: s.value } : { status: "rejected", message: apiErrorMessage(s.reason) }
      );
      setResults({ burden, risk, cluster, input: values });
    },
  });

  const { values, setFieldValue } = formik;
  const countryOptions = useMemo(() => (values.regionName ? countriesRegions[values.regionName] || [] : ALL_COUNTRIES), [values.regionName]);
  const modelVersion = results?.burden?.data?.model_version || results?.risk?.data?.model_version;
  const disclaimer = results?.burden?.data?.disclaimer;

  return (
    <>
      <PageHeader
        eyebrow="Model workbench"
        title="Ask the models"
        subtitle="Three models trained on 31 years of country-level data. Enter a scenario and get the estimated health burden, a risk level and the closest exposure profile."
      />

      <Section sx={{ pt: { xs: 5, md: 7 } }}>
        <Grid container spacing={3}>
          {/* ---- inputs ---- */}
          <Grid item xs={12} md={5}>
            <Panel
              title="Scenario"
              subtitle="Pollutant values use the dataset's source units."
              action={
                <Button size="small" startIcon={<AutoFixHighRoundedIcon />} onClick={() => formik.setValues(EXAMPLE, true)} sx={{ alignSelf: { xs: "flex-start", md: "center" }, whiteSpace: "nowrap", flexShrink: 0 }}>
                  Load example
                </Button>
              }
            >
              <Box component="form" noValidate onSubmit={formik.handleSubmit}>
                <Stack spacing={2.5}>
                  <Autocomplete
                    options={REGIONS}
                    value={values.regionName || null}
                    onChange={(_, region) => {
                      setFieldValue("regionName", region || "");
                      if (values.country && COUNTRY_REGION[values.country] !== region) setFieldValue("country", "");
                    }}
                    onBlur={() => formik.setFieldTouched("regionName", true)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="WHO region"
                        error={formik.touched.regionName && Boolean(formik.errors.regionName)}
                        helperText={formik.touched.regionName && formik.errors.regionName}
                      />
                    )}
                  />
                  <Autocomplete
                    options={countryOptions}
                    value={values.country || null}
                    onChange={(_, country) => {
                      setFieldValue("country", country || "");
                      if (country) setFieldValue("regionName", COUNTRY_REGION[country]);
                    }}
                    onBlur={() => formik.setFieldTouched("country", true)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Country"
                        error={formik.touched.country && Boolean(formik.errors.country)}
                        helperText={formik.touched.country && formik.errors.country}
                      />
                    )}
                  />
                  <NumberField formik={formik} name="year" label="Year" placeholder="e.g. 2015" />
                  <Divider textAlign="left">
                    <Typography variant="caption" color="text.secondary">
                      Exposure (source units)
                    </Typography>
                  </Divider>
                  <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" }, gap: 2 }}>
                    <NumberField formik={formik} name="exposureNo2" label="NO₂" placeholder="123" />
                    <NumberField formik={formik} name="exposureOzone" label="Ozone" placeholder="566" />
                    <NumberField formik={formik} name="exposurePm25" label="PM2.5" placeholder="642" />
                  </Box>
                  <Stack direction="row" spacing={1.5}>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      fullWidth
                      disabled={formik.isSubmitting}
                      startIcon={formik.isSubmitting ? <CircularProgress size={18} color="inherit" /> : <PlayArrowRoundedIcon />}
                    >
                      {formik.isSubmitting ? "Running models" : "Run models"}
                    </Button>
                    <Button
                      size="large"
                      variant="outlined"
                      onClick={() => {
                        formik.resetForm();
                        setResults(null);
                      }}
                    >
                      Reset
                    </Button>
                  </Stack>
                </Stack>
              </Box>
            </Panel>
          </Grid>

          {/* ---- results ---- */}
          <Grid item xs={12} md={7} ref={resultsRef} sx={{ scrollMarginTop: 80 }}>
            {!results ? (
              <EmptyResults />
            ) : (
              <Stack spacing={2.5} sx={{ height: "100%" }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" useFlexGap spacing={1}>
                  <Typography variant="h5">
                    {results.input.country} · {results.input.year}
                  </Typography>
                  {modelVersion && <Chip size="small" label={`model v${modelVersion}`} variant="outlined" />}
                </Stack>
                <Grid container spacing={2.5}>
                  <Grid item xs={12} sm={6}>
                    <ResultCard icon={<MonitorHeartRoundedIcon />} color={tokens.teal} title="Health burden" state={results.burden}>
                      {results.burden.data && <BurdenResult data={results.burden.data} />}
                    </ResultCard>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <ResultCard icon={<ShieldRoundedIcon />} color="#F59E0B" title="Risk level" state={results.risk}>
                      {results.risk.data && <RiskResult data={results.risk.data} />}
                    </ResultCard>
                  </Grid>
                  <Grid item xs={12}>
                    <ResultCard icon={<BubbleChartRoundedIcon />} color="#6366F1" title="Exposure profile" state={results.cluster}>
                      {results.cluster.data && <ClusterResult data={results.cluster.data} />}
                    </ResultCard>
                  </Grid>
                </Grid>
                {disclaimer && (
                  <Typography variant="caption" color="text.secondary">
                    {disclaimer}
                  </Typography>
                )}
              </Stack>
            )}
          </Grid>
        </Grid>
      </Section>

      <HowItWorks />
    </>
  );
};

// ---------------------------------------------------------------------------------------------- explainer
const MODELS = [
  {
    icon: <MonitorHeartRoundedIcon />,
    color: tokens.teal,
    name: "Health burden",
    algo: "Random Forest regressor",
    body: "Estimates the DALY rate attributable to air pollution from the year, the country, its region and the three exposures.",
  },
  {
    icon: <ShieldRoundedIcon />,
    color: "#F59E0B",
    name: "Risk level",
    algo: "Random Forest classifier",
    body: "Places the scenario in the low, moderate or high third of all observed health burdens, with a probability for each.",
  },
  {
    icon: <BubbleChartRoundedIcon />,
    color: "#6366F1",
    name: "Exposure profile",
    algo: "K-Means, k = 3",
    body: "Groups pollutant mixes into three profiles and reports the one your exposures are closest to.",
  },
];

const METRICS = [
  { label: "Random split", value: "0.92", note: "Countries seen in training" },
  { label: "Unseen countries", value: "0.31", note: "Held-out country folds" },
  { label: "Future years", value: "0.74", note: "Train 1990-2013, test 2014-2020" },
];

const HowItWorks = () => (
  <Section sx={{ backgroundColor: "#fff", borderTop: `1px solid ${tokens.border}` }}>
    <SectionHeader eyebrow="How it works" title="Three models, evaluated honestly" />
    <Grid container spacing={3}>
      {MODELS.map((m, i) => (
        <Grid item xs={12} md={4} key={m.name}>
          <Reveal delay={i * 0.06}>
            <Card sx={{ p: 3.5, height: "100%", boxShadow: "none" }}>
              <IconTile color={m.color}>{m.icon}</IconTile>
              <Typography variant="h5" sx={{ mt: 2.5 }}>
                {m.name}
              </Typography>
              <Typography variant="body2" sx={{ color: m.color, fontWeight: 650, mt: 0.5 }}>
                {m.algo}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
                {m.body}
              </Typography>
            </Card>
          </Reveal>
        </Grid>
      ))}
    </Grid>

    <Card sx={{ mt: 3, p: { xs: 3, md: 4 }, boxShadow: "none", background: `linear-gradient(135deg, ${alpha(tokens.teal, 0.05)}, ${alpha("#6366F1", 0.05)})` }}>
      <Grid container spacing={4} alignItems="center">
        <Grid item xs={12} md={5}>
          <Typography variant="h5">How good is the health-burden model?</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            R² by evaluation split. The model is strong for countries it has seen and much weaker for new ones, so treat
            predictions as exploratory. Every release must pass these checks automatically.
          </Typography>
          <Link href={`${REPO_URL}/blob/main/docs/evaluation.md`} target="_blank" rel="noopener" sx={{ display: "inline-block", mt: 2, fontWeight: 650 }}>
            Read the full evaluation →
          </Link>
        </Grid>
        <Grid item xs={12} md={7}>
          <Grid container spacing={2}>
            {METRICS.map((m) => (
              <Grid item xs={12} sm={4} key={m.label}>
                <Box sx={{ p: 2.5, borderRadius: 3, bgcolor: "#fff", border: `1px solid ${tokens.border}`, height: "100%" }}>
                  <Typography variant="body2" color="text.secondary">
                    {m.label}
                  </Typography>
                  <Typography className="tabular" sx={{ fontSize: "2rem", fontWeight: 800, letterSpacing: "-0.03em" }}>
                    {m.value}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {m.note}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </Card>
  </Section>
);

export default AiMlPage;
