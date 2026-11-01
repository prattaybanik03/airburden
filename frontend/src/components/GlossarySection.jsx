import { Box, Card, Grid, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Reveal, Section, SectionHeader } from "./ui";
import { tokens } from "../theme";

const terms = [
  {
    symbol: "PM2.5",
    title: "Fine particulate matter",
    color: "#6366F1",
    body: "Particles 2.5 micrometres or smaller. They reach deep into the lungs and the bloodstream and drive respiratory and cardiovascular disease.",
  },
  {
    symbol: "O₃",
    title: "Ground-level ozone",
    color: "#0EA5E9",
    body: "Formed when sunlight reacts with nitrogen oxides and volatile organic compounds. It inflames airways and aggravates asthma and bronchitis.",
  },
  {
    symbol: "NO₂",
    title: "Nitrogen dioxide",
    color: "#F59E0B",
    body: "A toxic gas mostly from vehicles and industry. It contributes to smog, and long exposure is linked to respiratory infections and reduced lung function.",
  },
  {
    symbol: "DALY",
    title: "Health burden",
    color: "#EF4444",
    body: "Disability-Adjusted Life Years: years of life lost to early death plus years lived with disability. Shown here as a rate attributable to air pollution.",
  },
];

const GlossarySection = () => (
  <Section sx={{ backgroundColor: "#fff", borderBlock: `1px solid ${tokens.border}` }}>
    <SectionHeader
      eyebrow="The basics"
      title="Four numbers worth understanding"
      subtitle="Every chart and prediction on this site is built from these measures."
    />
    <Grid container spacing={3}>
      {terms.map((t, i) => (
        <Grid item xs={12} sm={6} md={3} key={t.symbol}>
          <Reveal delay={i * 0.06}>
            <Card sx={{ height: "100%", p: 3, boxShadow: "none", position: "relative", overflow: "hidden" }}>
              <Box
                aria-hidden
                sx={{
                  position: "absolute",
                  top: -40,
                  right: -40,
                  width: 120,
                  height: 120,
                  borderRadius: "50%",
                  background: `radial-gradient(circle, ${alpha(t.color, 0.18)}, transparent 70%)`,
                }}
              />
              <Typography sx={{ fontSize: "1.9rem", fontWeight: 800, letterSpacing: "-0.03em", color: t.color }}>
                {t.symbol}
              </Typography>
              <Typography variant="h6" sx={{ mt: 1 }}>
                {t.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {t.body}
              </Typography>
            </Card>
          </Reveal>
        </Grid>
      ))}
    </Grid>
  </Section>
);

export default GlossarySection;
