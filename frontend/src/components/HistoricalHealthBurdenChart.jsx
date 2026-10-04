import React, { useState, useEffect } from "react";
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ButtonGroup,
  Button,
  Grid,
} from "@mui/material";
import Plot from "react-plotly.js";

const HistoricalHealthBurdenChart = ({ data }) => {
  const [selectedCountry1, setSelectedCountry1] = useState("Afghanistan");
  const [selectedCountry2, setSelectedCountry2] = useState("Lesotho");
  const [selectedCategory, setSelectedCategory] = useState("health_burden_mean"); // Default category
  const [filteredData1, setFilteredData1] = useState([]);
  const [filteredData2, setFilteredData2] = useState([]);

  const categories = [
    { label: "Health Burden (DALY)", value: "health_burden_mean" },
    { label: "PM2.5 Exposure", value: "exposure_mean_pm25" },
    { label: "Ozone Exposure", value: "exposure_mean_ozone" },
    { label: "NO2 Exposure", value: "exposure_mean_no2" },
  ];

  useEffect(() => {
    // Filter data for the first selected country within the year range
    const filtered1 = data.filter(
      (item) => item.country === selectedCountry1 && item.year >= 1990 && item.year <= 2020
    );
    setFilteredData1(filtered1);

    // Filter data for the second selected country within the year range
    if (selectedCountry2) {
      const filtered2 = data.filter(
        (item) => item.country === selectedCountry2 && item.year >= 1990 && item.year <= 2020
      );
      setFilteredData2(filtered2);
    } else {
      setFilteredData2([]);
    }
  }, [selectedCountry1, selectedCountry2, data]);

  // Prepare chart data
  const chartData = [
    {
      x: filteredData1.map((item) => item.year),
      y: filteredData1.map((item) => item[selectedCategory]),
      type: "scatter",
      mode: "lines+markers",
      name: `${selectedCountry1} (${categories.find((cat) => cat.value === selectedCategory)?.label})`,
    },
  ];

  if (filteredData2.length > 0) {
    chartData.push({
      x: filteredData2.map((item) => item.year),
      y: filteredData2.map((item) => item[selectedCategory]),
      type: "scatter",
      mode: "lines+markers",
      name: `${selectedCountry2} (${categories.find((cat) => cat.value === selectedCategory)?.label})`,
    });
  }

  return (
    <Box
      sx={{
        border: "1px solid #e0e0e0",
        borderRadius: 2,
        overflow: "hidden",
        boxShadow: 2,
        margin: "1rem 0",
      }}
    >
      {/* Dropdowns and Buttons */}
      <Box
        sx={{
          padding: "1rem",
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          borderBottom: "1px solid #e0e0e0",
        }}
      >
        <Grid container spacing={2}>
          {/* Country 1 Dropdown */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Select Country 1</InputLabel>
              <Select
                value={selectedCountry1}
                onChange={(e) => setSelectedCountry1(e.target.value)}
              >
                {[...new Set(data.map((item) => item.country))].map((country) => (
                  <MenuItem key={country} value={country}>
                    {country}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Country 2 Dropdown */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Select Country 2</InputLabel>
              <Select
                value={selectedCountry2}
                onChange={(e) => setSelectedCountry2(e.target.value)}
              >
                <MenuItem value="">None</MenuItem>
                {[...new Set(data.map((item) => item.country))].map((country) => (
                  <MenuItem key={country} value={country}>
                    {country}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Toggle Buttons for Categories */}
        <Box
          sx={{
            marginTop: 2,
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <ButtonGroup
            variant="outlined"
            aria-label="category toggle buttons"
            sx={{ flexWrap: "wrap" }}
          >
            {categories.map((category) => (
              <Button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                variant={selectedCategory === category.value ? "contained" : "outlined"}
                sx={{
                  textTransform: "capitalize",
                  fontWeight: "bold",
                  margin: "4px",
                }}
              >
                {category.label}
              </Button>
            ))}
          </ButtonGroup>
        </Box>
      </Box>

      {/* Plotly Chart */}
      <Box sx={{ padding: 2 }}>
        <Plot
          data={chartData}
          layout={{
            title: {
              text: `Comparison of ${categories.find((cat) => cat.value === selectedCategory)?.label}`,
              font: { size: 16 },
            },
            xaxis: { title: "Year", range: [1990, 2020] },
            yaxis: { title: categories.find((cat) => cat.value === selectedCategory)?.label },
            responsive: true,
            autosize: true,
            margin: { t: 50, l: 50, r: 20, b: 50 },
          }}
          config={{
            responsive: true,
            displayModeBar: false, // Disable the floating toolbar for simplicity
          }}
          style={{ width: "100%", height: "400px" }}
        />
      </Box>
    </Box>
  );
};

export default HistoricalHealthBurdenChart;
