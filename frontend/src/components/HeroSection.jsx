import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { motion } from "framer-motion";
import Typewriter from "typewriter-effect";

const HERO_VIDEO_URL = import.meta.env.VITE_HERO_VIDEO_URL;

const HeroSection = ({ onScrollToAirQuality }) => {
  return (
    <Box
      sx={{
        height: "100vh",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        overflow: "hidden",
        background: "linear-gradient(135deg, #0b3d5c 0%, #1b7a8c 55%, #3fb59b 100%)",
      }}
    >
      {/* Optional video background: set VITE_HERO_VIDEO_URL to enable it */}
      {HERO_VIDEO_URL && (
        <video
          autoPlay
          muted
          loop
          playsInline
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: -1,
          }}
        >
          <source src={HERO_VIDEO_URL} type="video/mp4" />
        </video>
      )}

      {/* Hero Content */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        style={{ zIndex: 1 }}
      >
        <Typography
          variant="h2"
          gutterBottom
          sx={{
            fontWeight: "bold",
            color: "#fff",
            textShadow: "0px 4px 12px rgba(0, 0, 0, 0.5)",
          }}
        >
          Real-Time Air Quality Insights
        </Typography>
      </motion.div>

      {/* Typewriter Tagline */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, delay: 0.3 }}
        style={{ zIndex: 1 }}
      >
        <Typography
          variant="h6"
          sx={{
            color: "#fff",
            fontWeight: "300",
            marginBottom: 3,
            textShadow: "0px 2px 8px rgba(0, 0, 0, 0.5)",
          }}
        >
          <Typewriter
            options={{
              strings: [
                "Monitor air quality in your city.",
                "Visualize the Air Quality Insights.",
                "Get Prediction from AI/ML Model .",
              ],
              autoStart: true,
              loop: true,
              delay: 50,
              deleteSpeed: 30,
            }}
          />
        </Typography>
      </motion.div>

      {/* Call to Action Button */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        style={{ zIndex: 1 }}
      >
        <Button
          variant="contained"
          color="primary"
          onClick={onScrollToAirQuality}
          sx={{
            textTransform: "none",
            fontSize: "18px",
            padding: "12px 28px",
            borderRadius: "30px",
            fontWeight: "bold",
            boxShadow: "0px 6px 15px rgba(0, 0, 0, 0.3)",
            background: "linear-gradient(90deg, #007BFF, #0056D2)",
            ":hover": {
              background: "linear-gradient(90deg, #0056D2, #007BFF)",
            },
          }}
        >
          Check Air Quality
        </Button>
      </motion.div>
    </Box>
  );
};

export default HeroSection;
