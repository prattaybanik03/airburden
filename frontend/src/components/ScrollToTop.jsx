import React from "react";
import { Fab, Zoom, useScrollTrigger } from "@mui/material";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

const ScrollToTop = ({ window }) => {
  // Use Material-UI's useScrollTrigger to detect scroll position
  const trigger = useScrollTrigger({
    target: window ? window() : undefined,
    disableHysteresis: true,
    threshold: 100, // Show button after scrolling 100px
  });

  const handleClick = (event) => {
    const anchor = (event.target.ownerDocument || document).querySelector(
      "#back-to-top-anchor"
    );

    if (anchor) {
      anchor.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  };

  return (
    <Zoom in={trigger}>
      <Fab
        onClick={handleClick}
        size="medium"
        aria-label="scroll back to top"
        sx={{
          position: "fixed",
          bottom: 16,
          right: 16,
          backgroundColor: "#333", // Dark gray background
          color: "#fff", // White icon color
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)", // Subtle shadow
          borderRadius: "50%", // Rounded edges
          transition: "all 0.3s ease",
          "&:hover": {
            backgroundColor: "#444", // Darker gray on hover
            boxShadow: "0px 6px 15px rgba(0, 0, 0, 0.3)", // Enhanced shadow
          },
        }}
      >
        <KeyboardArrowUpIcon />
      </Fab>
    </Zoom>
  );
};

export default ScrollToTop;
