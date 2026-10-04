import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Grid,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

const DataTable = ({ data }) => {
  const [filteredData, setFilteredData] = useState(data);
  const [searchText, setSearchText] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("All");
  const [selectedYear, setSelectedYear] = useState("All");

  const columns = [
    { field: "country", headerName: "Country", flex: 1 },
    { field: "year", headerName: "Year", flex: 0.5 },
    { field: "region_name", headerName: "Region", flex: 1 },
    { field: "exposure_mean_no2", headerName: "NO2 (source units)", flex: 0.8 },
    { field: "exposure_mean_ozone", headerName: "Ozone (source units)", flex: 0.8 },
    { field: "exposure_mean_pm25", headerName: "PM2.5 (source units)", flex: 0.8 },
    { field: "health_burden_mean", headerName: "Health Burden (DALY)", flex: 1 },
  ];

  useEffect(() => {
    let filtered = data;

    if (selectedCountry !== "All") {
      filtered = filtered.filter((d) => d.country === selectedCountry);
    }

    if (selectedYear !== "All") {
      filtered = filtered.filter((d) => d.year === parseInt(selectedYear));
    }

    if (searchText) {
      filtered = filtered.filter((d) =>
        Object.values(d)
          .join(" ")
          .toLowerCase()
          .includes(searchText.toLowerCase())
      );
    }

    setFilteredData(filtered);
  }, [selectedCountry, selectedYear, searchText, data]);

  const handleExport = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [
        columns.map((col) => col.headerName).join(","),
        ...filteredData.map((row) =>
          columns.map((col) => row[col.field] || "").join(",")
        ),
      ].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "air_quality_data.csv");
    document.body.appendChild(link); // Required for Firefox
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box
      sx={{
        border: "1px solid #e0e0e0",
        borderRadius: 2,
        overflow: "hidden",
        boxShadow: 2,
        margin: "1rem 0",
        padding: "1rem",
      }}
    >
      <Typography
        variant="h6"
        sx={{
          textAlign: "left",
          marginBottom: 2,
          paddingLeft: "8px",
          fontWeight: "bold",
        }}
      >
        Data Table
      </Typography>

      {/* Filters */}
      <Grid
        container
        spacing={2}
        sx={{
          marginBottom: 2,
          alignItems: "center",
        }}
      >
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel>Select Country</InputLabel>
            <Select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
            >
              <MenuItem value="All">All</MenuItem>
              {[...new Set(data.map((d) => d.country))].map((country) => (
                <MenuItem key={country} value={country}>
                  {country}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel>Select Year</InputLabel>
            <Select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              <MenuItem value="All">All</MenuItem>
              {[...new Set(data.map((d) => d.year))].map((year) => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <TextField
            label="Search"
            variant="outlined"
            fullWidth
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleExport}
            fullWidth
          >
            Export CSV
          </Button>
        </Grid>
      </Grid>

      {/* Data Grid */}
      <Box sx={{ height: { xs: 300, sm: 400, md: 500 } }}>
        <DataGrid
          rows={filteredData.map((d, id) => ({ id, ...d }))}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5, 10, 20]}
          disableSelectionOnClick
          sx={{
            "& .MuiDataGrid-columnHeaderTitle": {
              fontWeight: "bold",
            },
            "& .MuiDataGrid-cell": {
              textAlign: "center",
            },
          }}
        />
      </Box>
    </Box>
  );
};

export default DataTable;
