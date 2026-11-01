import { Box, Button, Card, Chip, Grid, Stack, Typography } from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";
import ArticleRoundedIcon from "@mui/icons-material/ArticleRounded";
import BugReportRoundedIcon from "@mui/icons-material/BugReportRounded";
import FactCheckRoundedIcon from "@mui/icons-material/FactCheckRounded";
import RocketLaunchRoundedIcon from "@mui/icons-material/RocketLaunchRounded";
import SchoolRoundedIcon from "@mui/icons-material/SchoolRounded";
import { IconTile, PageHeader, Reveal, Section, SectionHeader } from "../components/ui";
import { REPO_URL } from "../utils/site";
import { tokens } from "../theme";

const STACK = {
  "Machine learning": ["scikit-learn", "pandas", "pandera", "DVC", "MLflow"],
  "Serving": ["FastAPI", "Pydantic", "Prometheus", "Docker"],
  "Frontend": ["React 18", "Vite", "Material UI", "Plotly.js"],
  "Delivery": ["GitHub Actions", "CodeQL", "pytest", "Render"],
};

const TIMELINE = [
  {
    icon: <SchoolRoundedIcon />,
    year: "2024",
    title: "University project",
    body: "Built for COS30049 at Swinburne University of Technology as a group assignment: a dashboard and three models trained in a notebook.",
  },
  {
    icon: <BugReportRoundedIcon />,
    year: "2026",
    title: "Tested it properly",
    body: "Replaying the original service showed inputs fed to the model in the wrong column order. For Afghanistan 1990 it returned 1,053 instead of about 15,700.",
  },
  {
    icon: <FactCheckRoundedIcon />,
    year: "2026",
    title: "Evaluated it honestly",
    body: "The 0.92 R² came from a random split that lets the model memorise countries. On unseen countries it is 0.31. The site now says so.",
  },
  {
    icon: <RocketLaunchRoundedIcon />,
    year: "2026",
    title: "Rebuilt it like production",
    body: "Data contracts, a reproducible DVC pipeline, MLflow tracking, release gates, a monitored API, CI and container builds.",
  },
];

const AboutPage = () => (
  <>
    <PageHeader
      eyebrow="About"
      title="A small dataset, treated like a production system"
      subtitle="AirBurden relates air-pollution exposure to health burden across 172 countries. It is also a case study in taking an ML prototype to something you can trust, test and deploy."
    >
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mt: 4 }}>
        <Button variant="contained" size="large" href={REPO_URL} target="_blank" rel="noopener" startIcon={<GitHubIcon />}>
          View the source
        </Button>
        <Button
          size="large"
          href={`${REPO_URL}/blob/main/docs/v1-vs-v2.md`}
          target="_blank"
          rel="noopener"
          startIcon={<ArticleRoundedIcon />}
          sx={{ color: "#fff", border: "1px solid rgba(255,255,255,.2)", "&:hover": { background: "rgba(255,255,255,.08)" } }}
        >
          What changed since 2024
        </Button>
      </Stack>
    </PageHeader>

    <Section maxWidth="md">
      <SectionHeader eyebrow="The story" title="From coursework to a system I would ship" />
      <Box sx={{ position: "relative", pl: { xs: 0, sm: 4 } }}>
        <Box sx={{ display: { xs: "none", sm: "block" }, position: "absolute", left: 21, top: 8, bottom: 8, width: 2, bgcolor: tokens.border }} />
        <Stack spacing={3}>
          {TIMELINE.map((t, i) => (
            <Reveal key={t.title} delay={i * 0.06}>
              <Stack direction="row" spacing={3} alignItems="flex-start">
                <Box sx={{ display: { xs: "none", sm: "block" }, ml: -4, position: "relative", bgcolor: "background.default", py: 0.5 }}>
                  <IconTile>{t.icon}</IconTile>
                </Box>
                <Card sx={{ p: 3, flex: 1, boxShadow: "none" }}>
                  <Typography variant="overline" color="primary">
                    {t.year}
                  </Typography>
                  <Typography variant="h5">{t.title}</Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                    {t.body}
                  </Typography>
                </Card>
              </Stack>
            </Reveal>
          ))}
        </Stack>
      </Box>
    </Section>

    <Section sx={{ backgroundColor: "#fff", borderTop: `1px solid ${tokens.border}` }}>
      <SectionHeader eyebrow="Built with" title="Technology" />
      <Grid container spacing={3}>
        {Object.entries(STACK).map(([group, items]) => (
          <Grid item xs={12} sm={6} md={3} key={group}>
            <Card sx={{ p: 3, height: "100%", boxShadow: "none" }}>
              <Typography variant="h6">{group}</Typography>
              <Stack direction="row" flexWrap="wrap" useFlexGap spacing={1} sx={{ mt: 2 }}>
                {items.map((i) => (
                  <Chip key={i} label={i} variant="outlined" />
                ))}
              </Stack>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card sx={{ mt: 6, p: { xs: 3, md: 4 }, boxShadow: "none" }}>
        <Typography variant="h5">Credits and data</Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1.5 }}>
          Designed and built by Prattay Banik. Christine Bong and William Bakos were teammates on the original 2024 unit, and their
          help is gratefully acknowledged. Exposure and health-burden estimates: Health Effects Institute, State of Global Air
          (with IHME). Live air quality: IQAir. Released under the MIT License.
        </Typography>
      </Card>
    </Section>
  </>
);

export default AboutPage;
