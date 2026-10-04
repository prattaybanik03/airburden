import React, { useState, useEffect } from "react";
import { Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";

const ScrollDownIndicator = () => {
  const [isVisible, setIsVisible] = useState(true);
  const theme = useTheme(); // Use the theme to get the primary color

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleScrollDown = () => {
    const nextSection = document.getElementById("next-section");
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (!isVisible) return null;

  return (
    <Box
      onClick={handleScrollDown}
      sx={{
        position: "fixed",
        bottom: "2rem",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 1000,
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        animation: "fadeIn 1s ease-in-out",
      }}
    >
      {/* Mouse Icon */}
      <Box
        sx={{
          width: "20px",
          height: "30px",
          border: `2px solid ${theme.palette.primary.main}`, // Primary color border
          borderRadius: "16px",
          position: "relative",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginBottom: "8px",
        }}
      >
        {/* Scroll Ball */}
        <Box
          sx={{
            width: "6px",
            height: "6px",
            backgroundColor: theme.palette.primary.main, // Primary color scroll ball
            borderRadius: "50%",
            position: "absolute",
            animation: "scroll-ball 1.5s infinite",
          }}
        />
      </Box>

      {/* Downward Arrow */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          animation: "bounce 2s infinite",
        }}
      >
        <Box
          sx={{
            width: "0",
            height: "0",
            borderLeft: "4px solid transparent",
            borderRight: "4px solid transparent",
            borderTop: `8px solid ${theme.palette.primary.main}`, // Primary color arrow
            marginBottom: "4px",
          }}
        />
       
      </Box>

      {/* Text */}
      <Box
        sx={{
          marginTop: "8px",
          fontSize: "12px",
          fontWeight: "bold",
          color: theme.palette.primary.main, // Primary color text
        }}
      >
        SCROLL DOWN
      </Box>

      {/* CSS Animations */}
      <style>
        {`
          @keyframes scroll-ball {
            0% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(8px);
            }
            100% {
              transform: translateY(0);
            }
          }

          @keyframes bounce {
            0%, 20%, 50%, 80%, 100% {
              transform: translateY(0);
            }
            40% {
              transform: translateY(5px);
            }
            60% {
              transform: translateY(3px);
            }
          }
        `}
      </style>
    </Box>
  );
};

export default ScrollDownIndicator;
