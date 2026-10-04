import React, { useState } from "react";
import { Box, Typography, Tabs, Tab, IconButton } from "@mui/material";
import SwipeableViews from "react-swipeable-views"; // Import SwipeableViews
import { ChevronLeft, ChevronRight } from "@mui/icons-material";

const AIMLDetailsSection = () => {
  const [selectedTab, setSelectedTab] = useState(0);

  const handleChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleSwipeChange = (index) => {
    setSelectedTab(index);
  };

  const tabContent = [
    {
      title: "AI/ML Implementation Overview",
      content:
        "Our AI/ML implementation focuses on using machine learning models to predict health burden, classify risk levels, and analyze clusters. We selected Random Forest Regression, Random Forest Classification, and K-Means Clustering as the primary models due to their ability to handle complex, non-linear relationships in the dataset. These models enable insights into the relationship between air quality and health impacts, providing actionable predictions.",
    },
    {
        title: "Understanding Form Inputs",
        content: (
          <Box sx={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <Typography variant="body1">
              <strong>Year:</strong> The year for which predictions are to be made (e.g., 2023).
            </Typography>
            <Typography variant="body1">
              <strong>Exposure NO<sub>2</sub>:</strong> The nitrogen dioxide exposure value (e.g., 123, in the dataset's source units).
            </Typography>
            <Typography variant="body1">
              <strong>Exposure Ozone:</strong> The ozone exposure value (e.g., 566, in the dataset's source units).
            </Typography>
            <Typography variant="body1">
              <strong>Exposure PM<sub>2.5</sub>:</strong> The fine particulate matter (PM<sub>2.5</sub>) exposure value (e.g., 642, in the dataset's source units).
            </Typography>
            <Typography variant="body1">
              <strong>Region Name:</strong> The region for the analysis (e.g., "Eastern Europe").
            </Typography>
            <Typography variant="body1">
              <strong>Country:</strong> The country for analysis (e.g., "United States").
            </Typography>
          </Box>
        ),
      },
      
    {
      title: "Health Burden Prediction",
      content:
        "Health burden prediction uses Random Forest Regression to predict future health outcomes based on air quality data. It provides insights into the expected impact on health for different regions and time periods, assisting in planning public health measures.",
    },
    {
      title: "Risk Classification",
      content:
        "Risk classification uses Random Forest Classification to categorize exposure levels into low, medium, and high risk. This helps policymakers and individuals understand the severity of air quality in a specific region.",
    },
    {
      title: "Cluster Information",
      content:
        "Cluster information is generated using K-Means Clustering. It identifies regions with similar characteristics in terms of air quality and health impacts. These clusters provide actionable insights into prioritizing resources for specific areas.",
    },
  ];

  return (
    <Box
      sx={{
        maxWidth: 900,
        margin: "2rem auto",
        backgroundColor: "white",
        borderRadius: "12px",
        boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
        position: "relative",
      }}
    >
      {/* Header with arrows */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem 0",
          position: "relative",
        }}
      >
        {/* Left Arrow */}
        <IconButton
          onClick={() =>
            setSelectedTab((prev) => (prev > 0 ? prev - 1 : tabContent.length - 1))
          }
          sx={{
            position: "absolute",
            left: 0,
            top: "50%",
            transform: "translateY(-50%)",
            backgroundColor: "#1976D2",
            color: "white",
            "&:hover": {
              backgroundColor: "#1565C0",
            },
          }}
        >
          <ChevronLeft />
        </IconButton>

        {/* Header Text */}
        <Typography
          variant="h5"
          align="center"
          sx={{ fontWeight: "bold", color: "#1976D2" }}
        >
          AI/ML Dashboard Guidance
        </Typography>

        {/* Right Arrow */}
        <IconButton
          onClick={() =>
            setSelectedTab((prev) => (prev < tabContent.length - 1 ? prev + 1 : 0))
          }
          sx={{
            position: "absolute",
            right: 0,
            top: "50%",
            transform: "translateY(-50%)",
            backgroundColor: "#1976D2",
            color: "white",
            "&:hover": {
              backgroundColor: "#1565C0",
            },
          }}
        >
          <ChevronRight />
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
            sx={{ textTransform: "none", fontWeight: "bold" }}
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

export default AIMLDetailsSection;
