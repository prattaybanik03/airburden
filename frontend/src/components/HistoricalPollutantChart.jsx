import React, { useState, useEffect } from "react";
import { Box, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import Plot from "react-plotly.js";

const HistoricalPollutantChart = ({ data, pollutants }) => {
  const [selectedCountry, setSelectedCountry] = useState("Afghanistan");
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    // Filter data based on selected country
    const filtered = data.filter((item) => item.country === selectedCountry);
    setFilteredData(filtered);
  }, [selectedCountry, data]);

  // Prepare chart data
  const chartData = pollutants.map((pollutant) => ({
    x: filteredData.map((item) => item.year),
    y: filteredData.map((item) => item[`exposure_mean_${pollutant}`]),
    type: "scatter",
    mode: "lines+markers",
    name: pollutant.toUpperCase(),
  }));

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
      {/* Dropdown inside the visualization area */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "1rem",
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          borderBottom: "1px solid #e0e0e0",
        }}
      >
        <FormControl fullWidth sx={{ maxWidth: 300 }}>
          {/* Adjusted the label to ensure it's not overlapping */}
          <InputLabel
            sx={{
              backgroundColor: "white",
              padding: "0 4px",
              marginLeft: "-4px",
            }}
          >
            Select Country
          </InputLabel>
          <Select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
          >
            {[...new Set(data.map((item) => item.country))].map((country) => (
              <MenuItem key={country} value={country}>
                {country}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Plotly Chart */}
      <Box sx={{ padding: 2 }}>
        <Plot
          data={chartData}
          layout={{
            title: "",
            xaxis: { title: "Year" },
            yaxis: { title: "Exposure Level" },
            responsive: true,
            autosize: true,
            margin: { t: 10, l: 50, r: 20, b: 50 },
          }}
          config={{
            responsive: true,
          }}
          style={{ width: "100%", height: "400px" }}
        />
      </Box>
    </Box>
  );
};

export default HistoricalPollutantChart;
