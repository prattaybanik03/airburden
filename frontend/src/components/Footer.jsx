import React from "react";
import { Box, Typography, Link, Grid } from "@mui/material";

const Footer = () => {
  return (
    <Box
      sx={{
        backgroundColor: "#1C1C1E",
        color: "white",
        padding: "2rem 1rem",
        textAlign: "center",
        mt: "auto",
        borderTop: "1px solid #444",
      }}
    >
      {/* Logo and Title */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          mb: 2,
        }}
      >
        <img
          src="/logo.jpg" 
          alt="Logo"
          style={{ width: "50px", marginBottom: "1rem" }}
        />
        <Typography variant="h6" fontWeight="bold">
          Air Quality Dashboard
        </Typography>
      </Box>

      {/* Sitemap */}
      <Grid container justifyContent="center" spacing={3}>
        <Grid item>
          <Link
            href="/"
            sx={{
              color: "#fff",
              textDecoration: "none",
              fontSize: "14px",
              "&:hover": { color: "#1976D2" },
            }}
          >
            Home
          </Link>
        </Grid>
        <Grid item>
          <Link
            href="/air-quality-data"
            sx={{
              color: "#fff",
              textDecoration: "none",
              fontSize: "14px",
              "&:hover": { color: "#1976D2" },
            }}
          >
            Data Page
          </Link>
        </Grid>
        <Grid item>
          <Link
            href="/ai-ml"
            sx={{
              color: "#fff",
              textDecoration: "none",
              fontSize: "14px",
              "&:hover": { color: "#1976D2" },
            }}
          >
            AI/ML
          </Link>
        </Grid>
        <Grid item>
          <Link
            href="/about"
            sx={{
              color: "#fff",
              textDecoration: "none",
              fontSize: "14px",
              "&:hover": { color: "#1976D2" },
            }}
          >
            About
          </Link>
        </Grid>
      </Grid>

      {/* Copyright */}
      <Typography
        variant="caption"
        sx={{ marginTop: "1rem", display: "block", color: "#fff" }}
      >
        © 2024 PWC Air Quality Dashboard | All rights reserved.
      </Typography>
    </Box>
  );
};

export default Footer;
