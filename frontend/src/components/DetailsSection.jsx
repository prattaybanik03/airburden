import React, { useState } from "react";
import { Tabs, Tab, Box, Typography, IconButton } from "@mui/material";
import SwipeableViews from "react-swipeable-views";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

const DetailsSectionTabs = () => {
  const [selectedTab, setSelectedTab] = useState(0);

  const handleChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleSwipeChange = (index) => {
    setSelectedTab(index);
  };

  const goToPrevious = () => {
    if (selectedTab > 0) {
      setSelectedTab(selectedTab - 1);
    }
  };

  const goToNext = () => {
    if (selectedTab < tabContent.length - 1) {
      setSelectedTab(selectedTab + 1);
    }
  };

  const tabContent = [
    {
      title: "What is Air Quality?",
      content:
        "Air quality refers to the degree to which the air in our environment is clean or polluted. Poor air quality can affect human health, plants, and ecosystems. Common pollutants like PM2.5, ozone, and NO2 are critical indicators of air quality.",
    },
    {
      title: "What is PM2.5?",
      content:
        "PM2.5 are fine inhalable particles, with diameters that are 2.5 micrometers or smaller. These particles can penetrate deep into the lungs and bloodstream, causing respiratory and cardiovascular problems.",
    },
    {
      title: "What is Ground-Level Ozone?",
      content:
        "Ozone at ground level is formed when sunlight reacts with pollutants like nitrogen oxides (NOx) and volatile organic compounds (VOCs). It is harmful to respiratory health and can aggravate conditions like asthma and bronchitis.",
    },
    {
      title: "What is NO2?",
      content:
        "Nitrogen Dioxide (NO2) is a toxic gas produced mainly from vehicle emissions and industrial activities. It contributes to the formation of smog and acid rain, and prolonged exposure can lead to respiratory infections and reduced lung function.",
    },
    {
      title: "Understanding Health Burden (DALY Rate)",
      content:
        "Health Burden measures the overall impact of air pollution on human health. It is expressed in DALY (Disability-Adjusted Life Years), which combines years of life lost due to premature death and years lived with disability.",
    },
    {
      title: "Our Approach to Data Analysis",
      content:
        "Our platform uses reliable data sources, advanced machine learning models, and visualization tools to provide insights into air pollution and its health impacts.",
    },
  ];

  return (
    <Box
      sx={{
        maxWidth: 800,
        margin: "2rem auto",
        backgroundColor: "white",
        borderRadius: "12px",
        boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "1rem",
          borderBottom: "1px solid #FFFF",
          backgroundColor: "#f5f5f5",
        }}
      >
        <IconButton
          onClick={goToPrevious}
          disabled={selectedTab === 0}
          sx={{
            backgroundColor: "#f5f5f5",
            boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.2)",
            "&:hover": { backgroundColor: "#1976d2", transform: "scale(1.1)" },
            transition: "all 0.3s ease",
          }}
        >
          <ArrowBackIosIcon />
        </IconButton>
        <Typography
          variant="h5"
          align="center"
          sx={{
            fontWeight: "bold",
            textTransform: "uppercase",
           
          }}
        >
          Learn About Air Quality Terms
        </Typography>
        <IconButton
          onClick={goToNext}
          disabled={selectedTab === tabContent.length - 1}
          sx={{
            backgroundColor: "#f5f5f5",
            boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.2)",
            "&:hover": { backgroundColor: "#1976d2", transform: "scale(1.1)" },
            transition: "all 0.3s ease",
          }}
        >
          <ArrowForwardIosIcon />
        </IconButton>
      </Box>

      {/* Tabs */}
      <Tabs
        value={selectedTab}
        onChange={handleChange}
        centered
        textColor="primary"
        indicatorColor="primary"
        sx={{ borderBottom: "1px solid #e0e0e0" }}
      >
        {tabContent.map((tab, index) => (
          <Tab
            key={index}
            label={tab.title}
            sx={{
              textTransform: "none",
              fontWeight: "bold",
              "&:hover": { color: "primary.main", transition: "color 0.3s ease" },
            }}
          />
        ))}
      </Tabs>

      {/* Swipeable Views */}
      <SwipeableViews
        index={selectedTab}
        onChangeIndex={handleSwipeChange}
        style={{ padding: "1rem" }}
      >
        {tabContent.map((tab, index) => (
          <Box key={index} sx={{ padding: "2rem" }}>
            <Typography
              variant="h6"
              sx={{ fontWeight: "bold", marginBottom: "1rem" }}
            >
              {tab.title}
            </Typography>
            <Typography>{tab.content}</Typography>
          </Box>
        ))}
      </SwipeableViews>
    </Box>
  );
};

export default DetailsSectionTabs;
