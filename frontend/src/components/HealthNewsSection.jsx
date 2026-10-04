import React, { useEffect, useState } from "react";
import { Box, Typography, Paper, Grid, Button } from "@mui/material";
import { motion } from "framer-motion"; // For animations
import { getHealthNews } from "../services/apiService";

const HealthNewsSection = () => {
  const [newsArticles, setNewsArticles] = useState([]);

  useEffect(() => {
    const fetchNews = async () => {
      const result = await getHealthNews("health AND (air quality OR air)");
      setNewsArticles(result.articles || []);
    };
    fetchNews();
  }, []);

  // Only show 4 news articles on the homepage
  const displayedArticles = newsArticles.slice(0, 4);

  return (
    <Box
      sx={{
        maxWidth: "1000px", // Increased width
        margin: "2rem auto",
        padding: "2rem",
        borderRadius: "12px",
        boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
        backgroundColor: "white",
      }}
    >
      <Typography
        variant="h4"
        fontWeight="bold"
        align="center"
        mb={3}
        sx={{ color: "#333" }}
      >
        Health News
      </Typography>
      <Grid container spacing={4}> {/* Increased spacing */}
        {displayedArticles.map((article, index) => (
          <Grid item xs={12} md={6} key={index}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.2 }}
            >
              <Paper
                elevation={3}
                sx={{
                  padding: "20px", // Added more padding
                  borderRadius: "12px",
                  cursor: "pointer",
                  transition: "transform 0.3s",
                  "&:hover": {
                    transform: "scale(1.03)",
                    backgroundColor: "#f5f5f5",
                  },
                }}
                onClick={() => window.open(article.url, "_blank")}
              >
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  sx={{
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                  }}
                >
                  {article.title}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    overflow: "hidden",
                    display: "-webkit-box",
                    WebkitBoxOrient: "vertical",
                    WebkitLineClamp: 2,
                  }}
                >
                  {article.description}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: "#888",
                    marginTop: "8px",
                    display: "block",
                  }}
                >
                  {new Date(article.publishedAt).toLocaleDateString()} -{" "}
                  {article.source.name}
                </Typography>
              </Paper>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      <Box mt={4} display="flex" justifyContent="center">
        <Button
          variant="contained"
          color="primary"
          sx={{
            textTransform: "none",
            borderRadius: "20px",
            padding: "10px 20px",
            fontSize: "16px",
          }}
          onClick={() => window.open("https://news.google.com", "_blank")} // Replace with your "all news" link
        >
          View All News
        </Button>
      </Box>
    </Box>
  );
};

export default HealthNewsSection;
