import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import { CssBaseline, Box, CircularProgress, Backdrop } from "@mui/material";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import AirQualityDataPage from "./pages/AirQualityDataPage";
import AiMlPage from "./pages/AiMlPage";
import AboutPage from "./pages/AboutPage";
import ScrollToTop from "./components/ScrollToTop";
import ScrollDownIndicator from "./components/ScrollDownIndicator";

const LoadingAnimation = () => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    // Show loading animation for route changes
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500); // Set the loading duration (in ms)
    return () => clearTimeout(timer);
  }, [location]);

  return (
    <Backdrop
      open={isLoading}
      sx={{
        color: "#fff",
        zIndex: (theme) => theme.zIndex.drawer + 1,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <CircularProgress color="inherit" />
      <Box mt={2}>Loading...</Box>
    </Backdrop>
  );
};

const App = () => {
  return (
    <Router>
      <CssBaseline />
      <ScrollToTop />
      <LoadingAnimation /> {/* Add loading animation */}
      <ScrollDownIndicator /> {/* Add the scroll down indicator */}
      <Box id="back-to-top-anchor">
        <NavBar />
      </Box>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/air-quality-data" element={<AirQualityDataPage />} />
        <Route path="/ai-ml" element={<AiMlPage />} />
        <Route path="/about" element={<AboutPage />} />
      </Routes>
      <Footer />
    </Router>
  );
};

export default App;
