import { Link as RouterLink } from "react-router-dom";
import { Box, Typography } from "@mui/material";

const Brand = ({ light = true }) => (
  <Box component={RouterLink} to="/" aria-label="AirBurden home" sx={{ display: "flex", alignItems: "center", gap: 1.25, textDecoration: "none" }}>
    <Box component="img" src="/logo.svg" alt="" sx={{ width: 34, height: 34 }} />
    <Typography sx={{ fontWeight: 800, fontSize: "1.15rem", letterSpacing: "-0.02em", color: light ? "#fff" : "text.primary" }}>
      AirBurden
    </Typography>
  </Box>
);

export default Brand;
