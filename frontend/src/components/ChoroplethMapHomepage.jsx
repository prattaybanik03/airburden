import React from "react";
import { Box, Card, CardContent, Typography } from "@mui/material";
import Plot from "react-plotly.js";

const ChoroplethMapHomepage = ({ data }) => {
  const chartData = [
    {
      type: "choropleth",
      locationmode: "country names",
      locations: data.map((d) => d.country),
      z: data.map((d) => d.health_burden_mean),
      text: data.map(
        (d) => `${d.country}<br>Health Burden (DALY): ${d.health_burden_mean}`
      ),
      colorscale: "Reds",
      showscale: true,
      hoverinfo: "location+z",
    },
  ];

  return (
    <Card
      elevation={4}
      sx={{
        margin: "1rem auto",
        maxWidth: "600px",
        border: "1px solid #e0e0e0",
        borderRadius: 2,
        boxShadow: 2,
      }}
    >
      <CardContent>
      <Typography
        variant="h5"
        sx={{
          textAlign: "center",
          fontWeight: "bold",
          color: "black",
          marginBottom: "1rem",
        }}
      >
        Global Health Burden Overview
      </Typography>
        <Box
          sx={{
            height: "300px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Plot
            data={chartData}
            layout={{
              geo: {
                showframe: false,
                showcountries: true,
                projection: { type: "equirectangular" },
              },
              margin: { t: 0, l: 0, r: 0, b: 0 },
            }}
            config={{
              displayModeBar: false,
              responsive: true,
            }}
            style={{ width: "100%", height: "100%" }}
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default ChoroplethMapHomepage;
