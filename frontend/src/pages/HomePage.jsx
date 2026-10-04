import React, { useRef } from "react";
import HeroSection from "../components/HeroSection";
import CardsSection from "../components/CardsSection";
import DetailsSection from "../components/DetailsSection";
import AirQualitySection from "../components/AirQualitySection";
import HealthNewsSection from "../components/HealthNewsSection";
import ChoroplethMapHomepage from "../components/ChoroplethMapHomepage";
import FAQSection from "../components/FAQSection";
import data from "@data/dataset.json";

const HomePage = () => {
  const airQualityRef = useRef(null);

  const handleScrollToAirQuality = () => {
    airQualityRef.current.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div>
      {/* Hero Section */}
      <HeroSection onScrollToAirQuality={handleScrollToAirQuality} />

      {/* Cards Section */}
      <CardsSection />
      <DetailsSection />
      {/* Air Quality Section */}
      <div ref={airQualityRef}>
        <AirQualitySection />
      </div>
      <ChoroplethMapHomepage data={data} />

    <HealthNewsSection />
    <FAQSection />
     
    </div>
  );
};

export default HomePage;
