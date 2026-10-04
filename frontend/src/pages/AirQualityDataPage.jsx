import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Alert,
  Link,
} from "@mui/material";
import DataTable from "../components/DataTable";
import HistoricalPollutantChart from "../components/HistoricalPollutantChart";
import HistoricalHealthBurdenChart from "../components/HistoricalHealthBurdenChart";
import ChoroplethMap from "../components/ChoroplethMap";
import data from "@data/dataset.json";

const AirQualityDataPage = () => {
  const pollutants = ["no2", "ozone", "pm25"];
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const element = document.querySelector(location.hash);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [location]);

  return (
    <Container maxWidth="lg">
      <Box py={3}>
        <Typography variant="h4" align="center" gutterBottom>
          Explore The Dataset
        </Typography>
        <Typography variant="subtitle1" align="center" gutterBottom>
          Visualize air pollutant exposure and health burden data interactively.
        </Typography>

        <Alert severity="warning" sx={{ mb: 3 }}>
          About 7-8% of each pollutant column in this extract is corrupted (lost decimal points), so pollutant units are shown as
          &quot;source units&quot; and some country names lost punctuation. The health-burden column is unaffected.{" "}
          <Link href="https://github.com/prattaybanik03/airburden/blob/main/docs/data-quality.md" target="_blank" rel="noopener">
            Read the data-quality notes
          </Link>
          .
        </Alert>

        <Grid container spacing={4}>
          {/* Data Table */}
          <Grid item xs={12}>
            <Card elevation={4}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Explore Data Table
                </Typography>
                <DataTable data={data} />
              </CardContent>
            </Card>
          </Grid>

          {/* Global Pollutant Exposure Choropleth Map */}
          <Grid item xs={12}>
            <Card elevation={4} id="choropleth-map">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Global Pollutant Exposure Choropleth Map
                </Typography>
                <ChoroplethMap data={data} pollutants={pollutants} />
              </CardContent>
            </Card>
          </Grid>

          {/* Historical Pollutant Levels */}
          <Grid item xs={12}>
            <Card elevation={4}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Historical Pollutant Levels
                </Typography>
                <HistoricalPollutantChart data={data} pollutants={pollutants} />
              </CardContent>
            </Card>
          </Grid>

          {/* Historical Health Burden Chart */}
          <Grid item xs={12}>
            <Card elevation={4}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                Comparison Between Countries Chart
                </Typography>
                <HistoricalHealthBurdenChart data={data} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default AirQualityDataPage;
