import React, { useState } from "react";
import { Box, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import Plot from "react-plotly.js";

const ChoroplethMap = ({ data, pollutants }) => {
  const [selectedPollutant, setSelectedPollutant] = useState("pm25");

  // Prepare data for the choropleth map
  const mapData = data.map((d) => ({
    location: d.iso3,
    z: d[`exposure_mean_${selectedPollutant}`],
    text: `${d.country} (${d[`exposure_mean_${selectedPollutant}`]} ${d[`units_${selectedPollutant}`]})`,
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
            Select Pollutant
          </InputLabel>
          <Select
            value={selectedPollutant}
            onChange={(e) => setSelectedPollutant(e.target.value)}
          >
            {pollutants.map((pollutant) => (
              <MenuItem key={pollutant} value={pollutant}>
                {pollutant.toUpperCase()}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Plotly Choropleth Map */}
      <Box sx={{ padding: 2 }}>
        <Plot
          data={[
            {
              type: "choropleth",
              locations: mapData.map((d) => d.location),
              z: mapData.map((d) => d.z),
              text: mapData.map((d) => d.text),
              colorscale: "Viridis",
              autocolorscale: true,
              reversescale: false,
              marker: {
                line: {
                  color: "rgba(255,255,255,0.3)",
                  width: 0.5,
                },
              },
            },
          ]}
          layout={{
            title: "",
            geo: {
              projection: { type: "natural earth" },
              showcoastlines: true,
              coastlinecolor: "rgba(0,0,0,0.3)",
              showland: true,
              landcolor: "rgba(240,240,240,1)",
            },
            responsive: true,
            autosize: true,
            margin: { t: 10, l: 20, r: 20, b: 10 },
          }}
          config={{
            responsive: true, // Ensures the map adjusts to the container
          }}
          style={{ width: "100%", height: "500px" }}
        />
      </Box>
    </Box>
  );
};

export default ChoroplethMap;
