import { Suspense, lazy, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import { Box, LinearProgress } from "@mui/material";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import HomePage from "./pages/HomePage";

// Heavier pages (Plotly, the data grid, the full dataset) load on demand, so the home page paints fast.
const AirQualityDataPage = lazy(() => import("./pages/AirQualityDataPage"));
const AiMlPage = lazy(() => import("./pages/AiMlPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

/** Start every new page at the top, but let in-page anchors (#choropleth-map) scroll to their target. */
const ScrollReset = () => {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname, hash]);
  return null;
};

const PageFallback = () => (
  <Box sx={{ minHeight: "100vh", pt: "72px" }}>
    <LinearProgress sx={{ borderRadius: 0, height: 3 }} />
  </Box>
);

const App = () => (
  <Router>
    <ScrollReset />
    <Box id="back-to-top-anchor" />
    <NavBar />
    <Box component="main" sx={{ flex: 1 }}>
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/air-quality-data" element={<AirQualityDataPage />} />
          <Route path="/ai-ml" element={<AiMlPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </Box>
    <Footer />
    <ScrollToTop />
  </Router>
);

export default App;
