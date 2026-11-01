import { useEffect, useState } from "react";
import { Box, Button, Card, Grid, Skeleton, Stack, Typography } from "@mui/material";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import { getHealthNews } from "../services/apiService";
import { Reveal, Section, SectionHeader } from "./ui";
import { tokens } from "../theme";

const sourceName = (s) => (typeof s === "string" ? s : s?.name) || "News";

const HealthNewsSection = () => {
  const [articles, setArticles] = useState(null); // null = loading, [] = none/unavailable

  useEffect(() => {
    let alive = true;
    getHealthNews("health AND (air quality OR air)")
      .then((r) => alive && setArticles((r.articles || []).filter((a) => a.title && a.url).slice(0, 4)))
      .catch(() => alive && setArticles([]));
    return () => {
      alive = false;
    };
  }, []);

  // No API key on the server, or no results: leave the section out rather than show an empty box.
  if (Array.isArray(articles) && articles.length === 0) return null;

  return (
    <Section sx={{ backgroundColor: "#fff", borderBlock: `1px solid ${tokens.border}` }}>
      <SectionHeader eyebrow="In the news" title="Air quality and health, this week" />
      <Grid container spacing={3}>
        {(articles || Array.from({ length: 4 }, () => null)).map((a, i) => (
          <Grid item xs={12} md={6} key={a?.url || i}>
            {a ? (
              <Reveal delay={i * 0.05}>
                <Card
                  component="a"
                  href={a.url}
                  target="_blank"
                  rel="noopener"
                  sx={{
                    display: "block",
                    height: "100%",
                    p: 3,
                    textDecoration: "none",
                    boxShadow: "none",
                    transition: "all .2s ease",
                    "&:hover": { borderColor: "primary.main", boxShadow: tokens.shadow },
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" spacing={2}>
                    <Typography variant="caption" sx={{ color: "primary.main", fontWeight: 700 }}>
                      {sourceName(a.source)}
                      {a.publishedAt && ` · ${new Date(a.publishedAt).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}`}
                    </Typography>
                    <OpenInNewRoundedIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                  </Stack>
                  <Typography variant="h6" sx={{ mt: 1, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {a.title}
                  </Typography>
                  {a.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {a.description}
                    </Typography>
                  )}
                </Card>
              </Reveal>
            ) : (
              <Card sx={{ p: 3, boxShadow: "none" }}>
                <Skeleton width="30%" />
                <Skeleton height={32} />
                <Skeleton width="80%" />
              </Card>
            )}
          </Grid>
        ))}
      </Grid>
      <Box textAlign="center" sx={{ mt: 4 }}>
        <Button variant="outlined" href="https://news.google.com/search?q=air%20pollution%20health" target="_blank" rel="noopener" endIcon={<OpenInNewRoundedIcon />}>
          More news
        </Button>
      </Box>
    </Section>
  );
};

export default HealthNewsSection;
