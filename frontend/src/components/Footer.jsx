import { Link as RouterLink } from "react-router-dom";
import { Box, Container, Divider, Grid, Link, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import Brand from "./Brand";
import { NAV_LINKS, REPO_URL } from "../utils/site";
import { tokens } from "../theme";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

const columns = [
  {
    title: "Explore",
    links: NAV_LINKS.map((l) => ({ label: l.text, to: l.path })),
  },
  {
    title: "Project",
    links: [
      { label: "Source code", href: REPO_URL },
      { label: "API reference", href: `${API_URL}/docs` },
      { label: "MLOps design", href: `${REPO_URL}/blob/main/docs/mlops.md` },
      { label: "Model card", href: `${REPO_URL}/blob/main/docs/model-card.md` },
    ],
  },
  {
    title: "Data",
    links: [
      { label: "State of Global Air", href: "https://www.stateofglobalair.org" },
      { label: "Evaluation", href: `${REPO_URL}/blob/main/docs/evaluation.md` },
      { label: "Data-quality notes", href: `${REPO_URL}/blob/main/docs/data-quality.md` },
    ],
  },
];

const linkSx = {
  color: alpha("#fff", 0.62),
  textDecoration: "none",
  fontSize: "0.9rem",
  transition: "color .2s",
  "&:hover": { color: "#fff" },
};

const Footer = () => (
  <Box component="footer" sx={{ backgroundColor: tokens.ink, color: "#fff", pt: { xs: 8, md: 10 }, pb: 4 }}>
    <Container maxWidth="lg">
      <Grid container spacing={{ xs: 5, md: 4 }}>
        <Grid item xs={12} md={6}>
          <Brand />
          <Typography variant="body2" sx={{ mt: 2, maxWidth: 360, color: alpha("#fff", 0.6) }}>
            An open-source ML system relating air-pollution exposure to health burden across 172 countries, from
            validated data to a monitored model API.
          </Typography>
        </Grid>
        {columns.map((col) => (
          <Grid item xs={6} sm={4} md={2} key={col.title}>
            <Typography variant="overline" sx={{ color: alpha("#fff", 0.45) }}>
              {col.title}
            </Typography>
            <Stack spacing={1.25} sx={{ mt: 1 }}>
              {col.links.map((l) =>
                l.to ? (
                  <Link key={l.label} component={RouterLink} to={l.to} sx={linkSx}>
                    {l.label}
                  </Link>
                ) : (
                  <Link key={l.label} href={l.href} target="_blank" rel="noopener" sx={linkSx}>
                    {l.label}
                  </Link>
                )
              )}
            </Stack>
          </Grid>
        ))}
      </Grid>
      <Divider sx={{ my: 5, borderColor: alpha("#fff", 0.08) }} />
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={1.5}>
        <Typography variant="body2" sx={{ color: alpha("#fff", 0.45) }}>
          © 2024-2026 AirBurden · MIT License
        </Typography>
        <Typography variant="body2" sx={{ color: alpha("#fff", 0.45) }}>
          Exploratory estimates, not a medical or policy tool.
        </Typography>
      </Stack>
    </Container>
  </Box>
);

export default Footer;
