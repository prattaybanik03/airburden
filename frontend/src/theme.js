import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    background: {
      default: "#EAF6FF", // Light blue for the body
      paper: "#FFFFFF",   // White for card backgrounds
    },
    primary: {
      main: "#1976D2", // Blue for primary actions and highlights
    },
    secondary: {
      main: "#FF4081", // Pinkish secondary color
    },
    text: {
      primary: "#333333", // Dark grey for text
      secondary: "#666666", // Lighter grey for secondary text
    },
    
  },
  
  typography: {
    fontFamily: "Roboto, Arial, sans-serif",
    h1: { fontSize: "2.5rem", fontWeight: 700 },
    h2: { fontSize: "2rem", fontWeight: 600 },
    h3: { fontSize: "1.75rem", fontWeight: 600 },
    body1: { fontSize: "1rem", fontWeight: 400 },
    body2: { fontSize: "0.875rem", fontWeight: 400 },
    button: {
      textTransform: "none", // Avoid uppercase text for buttons
      fontWeight: 500,
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#1976D2", // Primary color for Navbar
          boxShadow: "none", // Clean navbar shadow
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: "1px", // Rounded corners for cards
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)", // Subtle shadow
          transition: "transform 0.3s ease", // Smooth hover animation
          "&:hover": {
            transform: "translateY(-3px)", // Lift on hover
          },
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          margin: 0,
          padding: 0,
          background: "linear-gradient(to bottom, #EAF6FF, #FFFF)", // Smoother gradient
          color: "#333333", // Primary text color
          scrollbarColor: "#1976D2 #EAF6FF", // Custom scrollbar
          "&::-webkit-scrollbar": {
            width: "8px",
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "#EAF6FF",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#1976D2",
            borderRadius: "4px",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            backgroundColor: "#005bb5",
          },
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        h1: {
          color: "#1976D2", // Primary blue for headers
        },
        h2: {
          color: "#1976D2", // Match header color
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "4px", // Slightly rounded buttons
          transition: "all 0.3s ease", // Smooth hover effect
          "&:hover": {
            backgroundColor: "#005bb5", // Darker blue on hover
            transform: "translateY(-3px)", // Lift on hover
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          padding: "1rem",
          borderRadius: "8px",
          boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.15)",
        },
      },
    },
  },
});

export default theme;
