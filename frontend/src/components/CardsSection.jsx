import React from "react";
import { Box, Grid, Card, CardContent, Typography, Button } from "@mui/material";
import InsightsIcon from "@mui/icons-material/Insights";
import BarChartIcon from "@mui/icons-material/BarChart";
import ModelTrainingIcon from "@mui/icons-material/ModelTraining";
import Typewriter from "typewriter-effect";

const CardsSection = () => {
  const cards = [
    {
      title: "Data Insights",
      description: "Explore comprehensive data patterns in air quality.",
      icon: <InsightsIcon style={{ fontSize: 50, color: "#1976D2" }} />,
      buttonLabel: "Explore Insights",
      link: "/air-quality-data",
    },
    {
      title: "Advanced Visualizations",
      description: "Dive into detailed and advanced visualizations.",
      icon: <BarChartIcon style={{ fontSize: 50, color: "#28A745" }} />,
      buttonLabel: "Explore Visuals",
      link: "/air-quality-data#choropleth-map",
    },
    {
      title: "AI/ML Model Predictions",
      description: "See real-time predictions and analysis.",
      icon: <ModelTrainingIcon style={{ fontSize: 50, color: "#FFC107" }} />,
      buttonLabel: "Explore Models",
      link: "/ai-ml",
    },
  ];

  return (
    <Box py={6} sx={{ backgroundColor: "#f8f9fa" }}>
      <Typography
        variant="h4"
        align="center"
        gutterBottom
        sx={{ fontWeight: "bold", color: "#333", marginBottom: "2rem" }}
      >
        Discover Our Features
      </Typography>
      <Grid container spacing={4} justifyContent="center">
        {cards.map((card, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card
              sx={{
                borderRadius: "16px",
                boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                "&:hover": {
                  transform: "scale(1.05)",
                  boxShadow: "0px 8px 30px rgba(0, 0, 0, 0.15)",
                },
              }}
            >
              <CardContent
                sx={{
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  padding: "2rem",
                }}
              >
                {card.icon}
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ fontWeight: "bold", marginTop: "1rem" }}
                >
                  {card.title}
                </Typography>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{
                    marginBottom: "1rem",
                    fontSize: "0.9rem",
                  }}
                >
                  <Typewriter
                    options={{
                      strings: [card.description],
                      autoStart: true,
                      loop: true,
                      delay: 50,
                      deleteSpeed: 30,
                      pauseFor: 2000,
                    }}
                  />
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => (window.location.href = card.link)}
                  sx={{
                    textTransform: "none",
                    padding: "8px 16px",
                    fontSize: "0.9rem",
                    borderRadius: "20px",
                    fontWeight: "bold",
                  }}
                >
                  {card.buttonLabel}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default CardsSection;
