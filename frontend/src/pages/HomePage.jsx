import { Suspense, lazy, useRef } from "react";
import { Box, Container, Skeleton } from "@mui/material";
import HeroSection from "../components/HeroSection";
import CardsSection from "../components/CardsSection";
import GlossarySection from "../components/GlossarySection";
import AirQualitySection from "../components/AirQualitySection";
import PipelineSection from "../components/PipelineSection";
import HealthNewsSection from "../components/HealthNewsSection";
import FAQSection from "../components/FAQSection";

// Plotly and the dataset are large: load the map after the hero has painted.
const ChoroplethMapHomepage = lazy(() => import("../components/ChoroplethMapHomepage"));

const MapPlaceholder = () => (
  <Container maxWidth="lg" sx={{ py: 12 }}>
    <Skeleton variant="rounded" height={520} sx={{ borderRadius: 4 }} />
  </Container>
);

const HomePage = () => {
  const airQualityRef = useRef(null);

  return (
    <>
      <HeroSection onScrollToAirQuality={() => airQualityRef.current?.scrollIntoView({ behavior: "smooth" })} />
      <CardsSection />
      <Suspense fallback={<MapPlaceholder />}>
        <ChoroplethMapHomepage />
      </Suspense>
      <GlossarySection />
      <Box ref={airQualityRef} sx={{ scrollMarginTop: 64 }}>
        <AirQualitySection />
      </Box>
      <PipelineSection />
      <HealthNewsSection />
      <FAQSection />
    </>
  );
};

export default HomePage;
