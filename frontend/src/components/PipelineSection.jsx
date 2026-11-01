import { Box, Button, Grid, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import FingerprintRoundedIcon from "@mui/icons-material/FingerprintRounded";
import RuleRoundedIcon from "@mui/icons-material/RuleRounded";
import MonitorHeartRoundedIcon from "@mui/icons-material/MonitorHeartRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import { GridPattern, Reveal, Section, SectionHeader } from "./ui";
import { REPO_URL } from "../utils/site";
import { tokens } from "../theme";

const steps = [
  {
    icon: <VerifiedRoundedIcon />,
    title: "Validate",
    body: "The dataset is pinned by hash and checked against data contracts before anything trains on it.",
  },
  {
    icon: <FingerprintRoundedIcon />,
    title: "Train reproducibly",
    body: "Seeded training from one params file. Every model carries a fingerprint, data hash and git commit.",
  },
  {
    icon: <RuleRoundedIcon />,
    title: "Gate the release",
    body: "A model ships only if it clears thresholds on unseen countries and future years, not just a random split.",
  },
  {
    icon: <MonitorHeartRoundedIcon />,
    title: "Serve and monitor",
    body: "A versioned API with readiness checks, Prometheus metrics, drift checks and warnings for out-of-range inputs.",
  },
];

const PipelineSection = () => (
  <Section sx={{ position: "relative", overflow: "hidden", backgroundColor: tokens.ink, color: "#fff" }}>
    <GridPattern />
    <Box sx={{ position: "relative" }}>
      <SectionHeader
        light
        eyebrow="Under the hood"
        title="Every prediction comes from a gated pipeline"
        subtitle="The models are built like production software: validated data, reproducible training, automated release gates and an observable API."
      />
      <Grid container spacing={2.5}>
        {steps.map((s, i) => (
          <Grid item xs={12} sm={6} md={3} key={s.title}>
            <Reveal delay={i * 0.08}>
              <Box
                sx={{
                  height: "100%",
                  p: 3,
                  borderRadius: 4,
                  background: alpha("#fff", 0.04),
                  border: `1px solid ${alpha("#fff", 0.1)}`,
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box sx={{ color: tokens.cyan, display: "flex", "& svg": { fontSize: 28 } }}>{s.icon}</Box>
                  <Typography className="tabular" sx={{ color: alpha("#fff", 0.3), fontWeight: 800 }}>
                    0{i + 1}
                  </Typography>
                </Stack>
                <Typography variant="h6" sx={{ mt: 2.5 }}>
                  {s.title}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1, color: alpha("#fff", 0.65) }}>
                  {s.body}
                </Typography>
              </Box>
            </Reveal>
          </Grid>
        ))}
      </Grid>
      <Box textAlign="center" sx={{ mt: 5 }}>
        <Button
          href={`${REPO_URL}/blob/main/docs/mlops.md`}
          target="_blank"
          rel="noopener"
          endIcon={<ArrowForwardRoundedIcon />}
          sx={{ color: "#fff", border: `1px solid ${alpha("#fff", 0.2)}`, "&:hover": { background: alpha("#fff", 0.08) } }}
        >
          Read the MLOps design
        </Button>
      </Box>
    </Box>
  </Section>
);

export default PipelineSection;
