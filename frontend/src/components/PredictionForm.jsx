import React, { useState, useEffect } from "react";
import {
  Box,
  FormControl,
  FormLabel,
  TextField,
  Button,
  CircularProgress,
  Typography,
  Paper,
  Card,
  CardContent,
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import { useFormik } from "formik";
import { predictionFormSchema } from "../utils/validationSchema";
import countriesRegions from "../assets/countriesRegions.json";

const PredictionForm = ({ onSubmit, isSubmitting }) => {
  const [countries, setCountries] = useState([]);
  const [regions, setRegions] = useState(Object.keys(countriesRegions));
  const [predictionResult, setPredictionResult] = useState(null);

  const formik = useFormik({
    initialValues: {
        year: "",
        exposureNo2: "",
        exposureOzone: "",
        exposurePm25: "",
        country: "",
        regionName: "",
      },
      
    validationSchema: predictionFormSchema,
    onSubmit: async (values) => {
      const result = await onSubmit(values);
      setPredictionResult(result?.prediction ?? null);
    },
  });

  useEffect(() => {
    if (formik.values.regionName) {
      setCountries(countriesRegions[formik.values.regionName] || []);
      formik.setFieldValue("country", ""); // Clear country when region changes
      setPredictionResult(null); // Clear prediction result on region change
    }
  }, [formik.values.regionName]);

  const handleFieldChange = (event) => {
    setPredictionResult(null); // Clear previous prediction
    formik.handleChange(event); // Update the formik state
  };

  return (
    <Paper elevation={4} sx={{ padding: 4, borderRadius: 2, marginTop: 3 }}>
      <Typography
        variant="h5"
        gutterBottom
        sx={{ fontWeight: "bold", marginBottom: 2, textAlign: "center" }}
      >
        Health Burden Prediction
      </Typography>
      <form onSubmit={formik.handleSubmit}>
        <Box
          display="grid"
          gridTemplateColumns={{ xs: "1fr", sm: "1fr 1fr" }}
          gap={3}
        >
          <FormControl fullWidth>
            <FormLabel sx={{ fontWeight: "bold" }}>Year</FormLabel>
            <TextField
              type="number"
              name="year"
              value={formik.values.year}
              onChange={handleFieldChange}
              onBlur={formik.handleBlur}
              error={formik.touched.year && Boolean(formik.errors.year)}
              helperText={formik.touched.year && formik.errors.year}
              placeholder="Enter year (e.g., 2023)"
              variant="outlined"
            />
          </FormControl>

          <FormControl fullWidth>
            <FormLabel sx={{ fontWeight: "bold" }}>Exposure NO2</FormLabel>
            <TextField
              type="number"
              name="exposureNo2"
              value={formik.values.exposureNo2}
              onChange={handleFieldChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched.exposureNo2 && Boolean(formik.errors.exposureNo2)
              }
              helperText={
                formik.touched.exposureNo2 && formik.errors.exposureNo2
              }
              placeholder="Enter NO2 value (e.g., 123)"
              variant="outlined"
            />
          </FormControl>

          <FormControl fullWidth>
            <FormLabel sx={{ fontWeight: "bold" }}>Exposure Ozone</FormLabel>
            <TextField
              type="number"
              name="exposureOzone"
              value={formik.values.exposureOzone}
              onChange={handleFieldChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched.exposureOzone &&
                Boolean(formik.errors.exposureOzone)
              }
              helperText={
                formik.touched.exposureOzone && formik.errors.exposureOzone
              }
              placeholder="Enter Ozone value (e.g., 566)"
              variant="outlined"
            />
          </FormControl>

          <FormControl fullWidth>
            <FormLabel sx={{ fontWeight: "bold" }}>Exposure PM2.5</FormLabel>
            <TextField
              type="number"
              name="exposurePm25"
              value={formik.values.exposurePm25}
              onChange={handleFieldChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched.exposurePm25 &&
                Boolean(formik.errors.exposurePm25)
              }
              helperText={
                formik.touched.exposurePm25 && formik.errors.exposurePm25
              }
              placeholder="Enter PM2.5 value (e.g., 642)"
              variant="outlined"
            />
          </FormControl>

          <FormControl fullWidth>
            <FormLabel sx={{ fontWeight: "bold" }}>Region Name</FormLabel>
            <Autocomplete
              options={regions}
              value={formik.values.regionName}
              onChange={(event, newValue) => {
                setPredictionResult(null); // Clear prediction on region change
                formik.setFieldValue("regionName", newValue);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Region"
                  required
                  error={
                    formik.touched.regionName &&
                    Boolean(formik.errors.regionName)
                  }
                  helperText={
                    formik.touched.regionName && formik.errors.regionName
                  }
                  variant="outlined"
                />
              )}
            />
          </FormControl>

          <FormControl fullWidth>
            <FormLabel sx={{ fontWeight: "bold" }}>Country</FormLabel>
            <Autocomplete
              options={countries}
              value={formik.values.country}
              onChange={(event, newValue) => {
                setPredictionResult(null); // Clear prediction on country change
                formik.setFieldValue("country", newValue);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Country"
                  required
                  error={
                    formik.touched.country && Boolean(formik.errors.country)
                  }
                  helperText={formik.touched.country && formik.errors.country}
                  variant="outlined"
                />
              )}
            />
          </FormControl>
        </Box>

        <Box
          display="flex"
          justifyContent="center"
          marginTop={3}
          marginBottom={2}
        >
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isSubmitting}
            sx={{
              width: "200px",
              fontWeight: "bold",
              "&:hover": { transform: "scale(1.02)" },
              transition: "transform 0.2s ease",
            }}
          >
            {isSubmitting ? <CircularProgress size={24} /> : "Submit"}
          </Button>
        </Box>

        {/* Display the prediction result dynamically */}
        {predictionResult !== null && (
          <Card
            sx={{
              backgroundColor: "#f9fbe7",
              borderRadius: 2,
              marginTop: 4,
              textAlign: "center",
              padding: 3,
              boxShadow: 4,
            }}
          >
            <CardContent>
              <Typography
                variant="h6"
                sx={{ fontWeight: "bold", color: "#4caf50" }}
              >
                Prediction Result:
              </Typography>
              <Typography
                variant="h4"
                sx={{ fontWeight: "bold", color: "#388e3c" }}
              >
                {predictionResult}
              </Typography>
            </CardContent>
          </Card>
        )}
      </form>
    </Paper>
  );
};

export default PredictionForm;
