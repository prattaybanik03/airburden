import { Accordion, AccordionDetails, AccordionSummary, Grid, Link, Typography } from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { Section, SectionHeader } from "./ui";
import { REPO_URL } from "../utils/site";

const faqs = [
  {
    q: "Why does air quality matter for health?",
    a: "Polluted air is one of the largest environmental risks to health. Long-term exposure to fine particles, ozone and NO₂ raises the risk of respiratory and cardiovascular disease, and it hits children, older people and people with existing conditions hardest.",
  },
  {
    q: "Where does the data come from?",
    a: (
      <>
        Country-level exposure and health-burden estimates for 1990-2020 come from the{" "}
        <Link href="https://www.stateofglobalair.org" target="_blank" rel="noopener">
          State of Global Air
        </Link>{" "}
        (Health Effects Institute with IHME). Live readings on the home page come from IQAir.
      </>
    ),
  },
  {
    q: "How accurate are the predictions?",
    a: (
      <>
        It depends on the question. For countries the model has seen, it fits well (R² 0.92). For a country it has never seen,
        R² drops to 0.31, and a simple &ldquo;last value carried forward&rdquo; forecast is hard to beat. Treat the outputs as exploratory, not
        as a medical or policy tool. The{" "}
        <Link href={`${REPO_URL}/blob/main/docs/evaluation.md`} target="_blank" rel="noopener">
          full evaluation
        </Link>{" "}
        explains why.
      </>
    ),
  },
  {
    q: "Why do some pollutant values look odd?",
    a: (
      <>
        About 7-8% of each pollutant column in the source extract appears corrupted (lost decimal points), so the explorer labels
        pollutant units as &quot;source units&quot;. The health-burden column is clean. See the{" "}
        <Link href={`${REPO_URL}/blob/main/docs/data-quality.md`} target="_blank" rel="noopener">
          data-quality notes
        </Link>
        .
      </>
    ),
  },
  {
    q: "Can I use the models or the code?",
    a: (
      <>
        Yes. The project is MIT-licensed. The API is documented with OpenAPI, and the{" "}
        <Link href={REPO_URL} target="_blank" rel="noopener">
          repository
        </Link>{" "}
        has the full pipeline: data validation, training, evaluation, release gates and the serving API.
      </>
    ),
  },
];

const FAQSection = () => (
  <Section>
    <Grid container spacing={{ xs: 2, md: 8 }}>
      <Grid item xs={12} md={4}>
        <SectionHeader align="left" eyebrow="FAQ" title="Questions, answered honestly" sx={{ mb: 2 }} />
      </Grid>
      <Grid item xs={12} md={8}>
        {faqs.map((f) => (
          <Accordion key={f.q}>
            <AccordionSummary
              expandIcon={<AddRoundedIcon sx={{ color: "primary.main" }} />}
              sx={{ "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded": { transform: "rotate(45deg)" } }}
            >
              <Typography variant="h6">{f.q}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography color="text.secondary">{f.a}</Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Grid>
    </Grid>
  </Section>
);

export default FAQSection;
