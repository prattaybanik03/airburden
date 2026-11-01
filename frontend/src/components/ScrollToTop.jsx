import { Fab, Zoom, useScrollTrigger } from "@mui/material";
import KeyboardArrowUpRoundedIcon from "@mui/icons-material/KeyboardArrowUpRounded";
import { tokens } from "../theme";

const ScrollToTop = () => {
  const trigger = useScrollTrigger({ disableHysteresis: true, threshold: 400 });

  return (
    <Zoom in={trigger}>
      <Fab
        size="medium"
        aria-label="Scroll back to top"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        sx={{
          position: "fixed",
          bottom: 24,
          right: 24,
          color: "#fff",
          backgroundColor: tokens.ink,
          boxShadow: "0 8px 24px rgba(11,18,32,0.25)",
          "&:hover": { backgroundColor: tokens.inkSoft },
        }}
      >
        <KeyboardArrowUpRoundedIcon />
      </Fab>
    </Zoom>
  );
};

export default ScrollToTop;
