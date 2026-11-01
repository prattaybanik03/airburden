import { Link as RouterLink } from "react-router-dom";
import { Box, Card, Grid, Stack, Typography } from "@mui/material";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import PublicRoundedIcon from "@mui/icons-material/PublicRounded";
import PsychologyRoundedIcon from "@mui/icons-material/PsychologyRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import { IconTile, Reveal, Section, SectionHeader } from "./ui";
import { tokens } from "../theme";

const cards = [
  {
    title: "Data explorer",
    description: "Filter, search and export all 5,332 country-years, with pollutant trends for any country.",
    icon: <InsightsRoundedIcon />,
    color: tokens.teal,
    cta: "Open the explorer",
    link: "/air-quality-data",
  },
  {
    title: "World maps and comparisons",
    description: "See exposure on a world map and compare the health burden of two countries over 31 years.",
    icon: <PublicRoundedIcon />,
    color: "#6366F1",
    cta: "View the maps",
    link: "/air-quality-data#choropleth-map",
  },
  {
    title: "Model predictions",
    description: "Estimate the health burden, risk level and exposure profile for any country and year.",
    icon: <PsychologyRoundedIcon />,
    color: "#F59E0B",
    cta: "Run the models",
    link: "/ai-ml",
  },
];

const CardsSection = () => (
  <Section>
    <SectionHeader
      eyebrow="What you can do"
      title="From raw exposure data to model predictions"
      subtitle="Three ways into the same dataset: browse it, visualise it, or ask the models what it implies."
    />
    <Grid container spacing={3}>
      {cards.map((card, i) => (
        <Grid item xs={12} md={4} key={card.title}>
          <Reveal delay={i * 0.08}>
            <Card
              component={RouterLink}
              to={card.link}
              sx={{
                display: "block",
                height: "100%",
                p: 3.5,
                textDecoration: "none",
                transition: "transform .25s ease, box-shadow .25s ease, border-color .25s ease",
                "&:hover": { transform: "translateY(-4px)", boxShadow: tokens.shadowHover, borderColor: "#CBD5E1" },
                "&:hover .cta-arrow": { transform: "translateX(4px)" },
              }}
            >
              <IconTile color={card.color} size={52}>
                {card.icon}
              </IconTile>
              <Typography variant="h5" sx={{ mt: 3 }}>
                {card.title}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                {card.description}
              </Typography>
              <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mt: 3, color: card.color, fontWeight: 650 }}>
                <Box component="span">{card.cta}</Box>
                <ArrowForwardRoundedIcon className="cta-arrow" sx={{ fontSize: 18, transition: "transform .2s" }} />
              </Stack>
            </Card>
          </Reveal>
        </Grid>
      ))}
    </Grid>
  </Section>
);

export default CardsSection;
