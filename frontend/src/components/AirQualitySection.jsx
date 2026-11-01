import { useState } from "react";
import { Alert, Autocomplete, Box, Button, Card, CircularProgress, Grid, Stack, TextField, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import ThermostatRoundedIcon from "@mui/icons-material/ThermostatRounded";
import WaterDropRoundedIcon from "@mui/icons-material/WaterDropRounded";
import AirRoundedIcon from "@mui/icons-material/AirRounded";
import { apiErrorMessage, getAirQuality } from "../services/apiService";
import { Section, SectionHeader } from "./ui";

const CITIES = ["Sydney", "Melbourne", "Delhi", "Mumbai", "Beijing", "Tokyo", "New York", "Los Angeles", "San Francisco", "London", "Paris", "Dhaka"];

// US EPA AQI bands
const BANDS = [
  { max: 50, color: "#22C55E" },
  { max: 100, color: "#EAB308" },
  { max: 150, color: "#F97316" },
  { max: 200, color: "#EF4444" },
  { max: 300, color: "#A855F7" },
  { max: Infinity, color: "#9F1239" },
];
const aqiColor = (aqi) => BANDS.find((b) => aqi <= b.max).color;

const Metric = ({ icon, label, value }) => (
  <Stack direction="row" spacing={1.25} alignItems="center">
    <Box sx={{ color: "text.secondary", display: "flex" }}>{icon}</Box>
    <Box>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography className="tabular" sx={{ fontWeight: 650 }}>
        {value}
      </Typography>
    </Box>
  </Stack>
);

const AqiScale = ({ aqi }) => {
  const pos = Math.min(aqi, 300) / 300;
  return (
    <Box sx={{ mt: 3 }}>
      <Box
        sx={{
          position: "relative",
          height: 10,
          borderRadius: 99,
          background: "linear-gradient(90deg,#22C55E 0%,#EAB308 25%,#F97316 42%,#EF4444 58%,#A855F7 80%,#9F1239 100%)",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: `${pos * 100}%`,
            width: 18,
            height: 18,
            borderRadius: "50%",
            transform: "translate(-50%,-50%)",
            background: "#fff",
            border: `4px solid ${aqiColor(aqi)}`,
            boxShadow: "0 2px 8px rgba(0,0,0,.2)",
          }}
        />
      </Box>
      <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
        {["0", "50", "100", "150", "200", "300+"].map((t) => (
          <Typography key={t} variant="caption" color="text.secondary" className="tabular">
            {t}
          </Typography>
        ))}
      </Stack>
    </Box>
  );
};

const AirQualitySection = () => {
  const [city, setCity] = useState("");
  const [result, setResult] = useState(null);
  const [checkedCity, setCheckedCity] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const check = async () => {
    const query = city.trim();
    if (!query) return;
    setLoading(true);
    setError("");
    try {
      const data = await getAirQuality(query);
      setResult(data);
      setCheckedCity(query);
    } catch (err) {
      setResult(null);
      setError(apiErrorMessage(err, "Could not fetch air quality for that city."));
    } finally {
      setLoading(false);
    }
  };

  const aq = result?.air_quality;
  const weather = result?.weather;

  return (
    <Section maxWidth="md">
      <SectionHeader
        eyebrow="Live"
        title="What is the air like right now?"
        subtitle="Real-time US AQI for any city, from IQAir, with the matching health advice."
      />
      <Card sx={{ p: { xs: 2.5, md: 4 } }}>
        <Stack
          component="form"
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          onSubmit={(e) => {
            e.preventDefault();
            check();
          }}
        >
          <Autocomplete
            freeSolo
            options={CITIES}
            inputValue={city}
            onInputChange={(_, value) => setCity(value)}
            sx={{ flex: 1 }}
            renderInput={(params) => <TextField {...params} label="City" placeholder="Search any city, e.g. Sydney" />}
          />
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading || !city.trim()}
            startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <SearchRoundedIcon />}
            sx={{ minWidth: 140, height: 56 }}
          >
            Check
          </Button>
        </Stack>

        {error && (
          <Alert severity="info" sx={{ mt: 3 }}>
            {error}
          </Alert>
        )}

        {aq && (
          <Box sx={{ mt: 4 }}>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} sm="auto">
                <Box
                  sx={{
                    width: 124,
                    height: 124,
                    borderRadius: "50%",
                    display: "grid",
                    placeItems: "center",
                    mx: { xs: "auto", sm: 0 },
                    background: alpha(aqiColor(aq.aqi), 0.12),
                    border: `6px solid ${aqiColor(aq.aqi)}`,
                  }}
                >
                  <Box textAlign="center">
                    <Typography className="tabular" sx={{ fontSize: "2.3rem", fontWeight: 800, lineHeight: 1 }}>
                      {aq.aqi}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      US AQI
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm>
                <Typography variant="body2" color="text.secondary">
                  {checkedCity}
                </Typography>
                <Typography variant="h4" sx={{ color: aqiColor(aq.aqi) }}>
                  {aq.category}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
                  {aq.health_recommendations}
                </Typography>
              </Grid>
            </Grid>
            <AqiScale aqi={aq.aqi} />
            {weather && (
              <Stack direction="row" spacing={{ xs: 2, sm: 5 }} sx={{ mt: 3, pt: 3, borderTop: 1, borderColor: "divider", flexWrap: "wrap", rowGap: 2 }}>
                <Metric icon={<ThermostatRoundedIcon />} label="Temperature" value={`${weather.temperature} °C`} />
                <Metric icon={<WaterDropRoundedIcon />} label="Humidity" value={`${weather.humidity}%`} />
                <Metric icon={<AirRoundedIcon />} label="Wind" value={`${weather.wind_speed} m/s`} />
              </Stack>
            )}
          </Box>
        )}
      </Card>
    </Section>
  );
};

export default AirQualitySection;
