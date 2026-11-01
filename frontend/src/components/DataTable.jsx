import { useMemo, useState } from "react";
import { Autocomplete, Box, Button, Grid, InputAdornment, MenuItem, TextField } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import FileDownloadRoundedIcon from "@mui/icons-material/FileDownloadRounded";
import { COUNTRIES, REGIONS, YEARS } from "../utils/dataset";
import { tokens } from "../theme";

const num = { type: "number", headerAlign: "right", align: "right" };
const columns = [
  { field: "country", headerName: "Country", flex: 1.2, minWidth: 150 },
  { field: "year", headerName: "Year", width: 90, ...num, valueFormatter: (v) => v },
  { field: "region_name", headerName: "Region", flex: 1.2, minWidth: 170 },
  { field: "exposure_mean_no2", headerName: "NO₂", flex: 0.6, minWidth: 90, ...num },
  { field: "exposure_mean_ozone", headerName: "Ozone", flex: 0.6, minWidth: 90, ...num },
  { field: "exposure_mean_pm25", headerName: "PM2.5", flex: 0.6, minWidth: 90, ...num },
  { field: "health_burden_mean", headerName: "DALY rate", description: "Health burden attributable to air pollution", flex: 0.8, minWidth: 120, ...num },
];

const csvCell = (v) => {
  const s = v === null || v === undefined ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

const DataTable = ({ data }) => {
  const [search, setSearch] = useState("");
  const [country, setCountry] = useState(null);
  const [region, setRegion] = useState("All");
  const [year, setYear] = useState("All");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return data.filter(
      (d) =>
        (!country || d.country === country) &&
        (region === "All" || d.region_name === region) &&
        (year === "All" || d.year === Number(year)) &&
        (!q || `${d.country} ${d.region_name} ${d.year} ${d.iso3}`.toLowerCase().includes(q))
    );
  }, [data, search, country, region, year]);

  const gridRows = useMemo(() => filtered.map((d) => ({ id: `${d.iso3}-${d.year}-${d.region_name}`, ...d })), [filtered]);

  const exportCsv = () => {
    const header = ["Country", "ISO3", "Year", "Region", "NO2 (source units)", "Ozone (source units)", "PM2.5 (source units)", "Health burden (DALY rate)"];
    const body = filtered.map((d) =>
      [d.country, d.iso3, d.year, d.region_name, d.exposure_mean_no2, d.exposure_mean_ozone, d.exposure_mean_pm25, d.health_burden_mean].map(csvCell).join(",")
    );
    const blob = new Blob([[header.join(","), ...body].join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "airburden_data.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <Box>
      <Grid container spacing={1.5} sx={{ mb: 2 }}>
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search country, region, year"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchRoundedIcon fontSize="small" /></InputAdornment> }}
          />
        </Grid>
        <Grid item xs={12} sm={4} md={3}>
          <Autocomplete size="small" options={COUNTRIES} value={country} onChange={(_, v) => setCountry(v)} renderInput={(p) => <TextField {...p} label="Country" />} />
        </Grid>
        <Grid item xs={12} sm={4} md={3}>
          <TextField select fullWidth size="small" label="Region" value={region} onChange={(e) => setRegion(e.target.value)}>
            <MenuItem value="All">All regions</MenuItem>
            {REGIONS.map((r) => (
              <MenuItem key={r} value={r}>
                {r}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={4} md={1}>
          <TextField select fullWidth size="small" label="Year" value={year} onChange={(e) => setYear(e.target.value)}>
            <MenuItem value="All">All</MenuItem>
            {YEARS.map((y) => (
              <MenuItem key={y} value={y}>
                {y}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} md={2}>
          <Button fullWidth variant="outlined" startIcon={<FileDownloadRoundedIcon />} onClick={exportCsv} sx={{ minHeight: 40 }}>
            Export CSV
          </Button>
        </Grid>
      </Grid>

      <Box sx={{ height: 560 }}>
        <DataGrid
          rows={gridRows}
          columns={columns}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          pageSizeOptions={[10, 25, 50, 100]}
          disableRowSelectionOnClick
          density="comfortable"
          sx={{
            border: `1px solid ${tokens.border}`,
            borderRadius: 3,
            fontVariantNumeric: "tabular-nums",
            "--DataGrid-containerBackground": "#F8FAFC",
            "& .MuiDataGrid-columnHeaderTitle": { fontWeight: 700, color: "#334155" },
            "& .MuiDataGrid-row:hover": { backgroundColor: "#F8FAFC" },
            "& .MuiDataGrid-cell:focus, & .MuiDataGrid-columnHeader:focus": { outline: "none" },
          }}
        />
      </Box>
    </Box>
  );
};

export default DataTable;
