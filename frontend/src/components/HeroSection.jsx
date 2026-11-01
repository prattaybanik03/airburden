import { Link as RouterLink } from "react-router-dom";
import { Box, Button, Chip, Container, Grid, LinearProgress, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import TableChartRoundedIcon from "@mui/icons-material/TableChartRounded";
import { motion } from "framer-motion";
import { GridPattern, Stat } from "./ui";
import { tokens } from "../theme";

const HERO_VIDEO_URL = import.meta.env.VITE_HERO_VIDEO_URL;

const STATS = [
  { value: "172", label: "countries" },
  { value: "31", label: "years, 1990-2020" },
  { value: "5,332", label: "country-years" },
  { value: "3", label: "served models" },
];

/** A static example of what the model returns, using the documented Afghanistan 1990 case. */
const PreviewCard = () => (
  <Box
    sx={{
      position: "relative",
      p: 3,
      borderRadius: 4,
      color: "#fff",
      background: alpha("#fff", 0.06),
      border: `1px solid ${alpha("#fff", 0.12)}`,
      backdropFilter: "blur(16px)",
      boxShadow: `0 30px 80px ${alpha("#000", 0.35)}`,
    }}
  >
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Typography variant="body2" sx={{ color: alpha("#fff", 0.6) }}>
        POST /v1/predictions/health-burden
      </Typography>
      <Chip label="200 OK" size="small" sx={{ bgcolor: alpha("#22C55E", 0.18), color: "#86EFAC", height: 22 }} />
    </Stack>
    <Typography variant="h6" sx={{ mt: 2.5 }}>
      Afghanistan · 1990
    </Typography>
    <Typography variant="body2" sx={{ color: alpha("#fff", 0.55) }}>
      NO₂ 123 · Ozone 566 · PM2.5 642
    </Typography>

    <Stack direction="row" spacing={4} sx={{ mt: 3 }}>
      <Box>
        <Typography variant="caption" sx={{ color: alpha("#fff", 0.55) }}>
          Predicted
        </Typography>
        <Typography className="tabular" sx={{ fontSize: "2.2rem", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1 }}>
          15,533
        </Typography>
      </Box>
      <Box>
        <Typography variant="caption" sx={{ color: alpha("#fff", 0.55) }}>
          Observed
        </Typography>
        <Typography className="tabular" sx={{ fontSize: "2.2rem", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1, color: alpha("#fff", 0.6) }}>
          15,700
        </Typography>
      </Box>
    </Stack>
    <Typography variant="caption" sx={{ color: alpha("#fff", 0.55) }}>
      DALY rate attributable to air pollution
    </Typography>

    <Box sx={{ mt: 3 }}>
      <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.75 }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          Risk level
        </Typography>
        <Typography variant="body2" className="tabular" sx={{ color: "#FCA5A5", fontWeight: 700 }}>
          High · 93%
        </Typography>
      </Stack>
      <LinearProgress
        variant="determinate"
        value={93}
        sx={{ bgcolor: alpha("#fff", 0.1), "& .MuiLinearProgress-bar": { background: "linear-gradient(90deg,#F59E0B,#EF4444)" } }}
      />
    </Box>
  </Box>
);

const HeroSection = ({ onScrollToAirQuality }) => (
  <Box
    sx={{
      position: "relative",
      overflow: "hidden",
      color: "#fff",
      minHeight: { md: "100vh" },
      display: "flex",
      alignItems: "center",
      pt: { xs: 16, md: 14 },
      pb: { xs: 10, md: 10 },
      background: `radial-gradient(1000px 520px at 85% 10%, ${alpha(tokens.violet, 0.35)}, transparent 60%),
                   radial-gradient(900px 520px at 0% 100%, ${alpha(tokens.teal, 0.5)}, transparent 60%),
                   radial-gradient(600px 300px at 50% 50%, ${alpha(tokens.cyan, 0.08)}, transparent 70%),
                   ${tokens.ink}`,
    }}
  >
    {HERO_VIDEO_URL && (
      <Box
        component="video"
        autoPlay
        muted
        loop
        playsInline
        sx={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.25 }}
      >
        <source src={HERO_VIDEO_URL} type="video/mp4" />
      </Box>
    )}
    <GridPattern />

    <Container maxWidth="lg" sx={{ position: "relative" }}>
      <Grid container spacing={{ xs: 6, md: 8 }} alignItems="center">
        <Grid item xs={12} md={7}>
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
            <Chip
              label="Open-source ML · State of Global Air data"
              sx={{
                mb: 3,
                color: alpha("#fff", 0.85),
                bgcolor: alpha("#fff", 0.07),
                border: `1px solid ${alpha("#fff", 0.14)}`,
                fontWeight: 550,
              }}
            />
            <Typography variant="h1">
              How the air we breathe{" "}
              <Box
                component="span"
                sx={{
                  background: `linear-gradient(90deg, ${tokens.cyan}, #A78BFA)`,
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                shapes global health
              </Box>
            </Typography>
            <Typography variant="subtitle1" sx={{ mt: 3, maxWidth: 560, color: alpha("#fff", 0.72), fontSize: { md: "1.15rem" } }}>
              Explore three decades of NO₂, ozone and PM2.5 exposure next to the health burden they cause, check live air quality
              in your city, and query the machine-learning models behind it.
            </Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mt: 4 }}>
              <Button component={RouterLink} to="/ai-ml" variant="contained" size="large" endIcon={<ArrowForwardRoundedIcon />}>
                Try the models
              </Button>
              <Button
                component={RouterLink}
                to="/air-quality-data"
                size="large"
                startIcon={<TableChartRoundedIcon />}
                sx={{ color: "#fff", border: `1px solid ${alpha("#fff", 0.2)}`, "&:hover": { background: alpha("#fff", 0.08) } }}
              >
                Explore the data
              </Button>
            </Stack>
            <Button
              onClick={onScrollToAirQuality}
              sx={{ mt: 2.5, px: 0, color: alpha("#fff", 0.7), "&:hover": { color: "#fff", background: "transparent" } }}
            >
              Or check the air quality in your city ↓
            </Button>
          </motion.div>
        </Grid>

        <Grid item xs={12} md={5}>
          <motion.div
            initial={{ opacity: 0, y: 30, rotate: 1.5 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            <PreviewCard />
          </motion.div>
        </Grid>
      </Grid>

      <Box
        sx={{
          mt: { xs: 8, md: 10 },
          pt: 4,
          borderTop: `1px solid ${alpha("#fff", 0.1)}`,
          display: "grid",
          gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" },
          gap: 3,
        }}
      >
        {STATS.map((s) => (
          <Stat key={s.label} value={s.value} label={s.label} light />
        ))}
      </Box>
    </Container>
  </Box>
);

export default HeroSection;
