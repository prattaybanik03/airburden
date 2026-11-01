import { alpha, createTheme } from "@mui/material/styles";

// Design tokens: one place for colour, radius and elevation so every page reads as one product.
export const tokens = {
  ink: "#0B1220", // hero / footer background
  inkSoft: "#111C2E",
  teal: "#0D9488",
  tealDark: "#0F766E",
  cyan: "#22D3EE",
  violet: "#8B5CF6",
  border: "#E4E8EF",
  canvas: "#F6F8FB",
  risk: { "Low Risk": "#16A34A", "Moderate Risk": "#D97706", "High Risk": "#DC2626" },
  series: ["#0D9488", "#6366F1", "#F59E0B", "#EC4899", "#0EA5E9"],
  radius: 16,
  shadow: "0 1px 2px rgba(16,24,40,0.04), 0 4px 16px rgba(16,24,40,0.06)",
  shadowHover: "0 2px 4px rgba(16,24,40,0.06), 0 12px 32px rgba(16,24,40,0.10)",
};

const fontFamily = '"Inter Variable", Inter, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: tokens.teal, dark: tokens.tealDark, light: "#2DD4BF", contrastText: "#fff" },
    secondary: { main: "#6366F1" },
    success: { main: "#16A34A" },
    warning: { main: "#D97706" },
    error: { main: "#DC2626" },
    background: { default: tokens.canvas, paper: "#FFFFFF" },
    text: { primary: "#0F172A", secondary: "#475569" },
    divider: tokens.border,
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily,
    h1: { fontSize: "clamp(2.4rem, 5vw, 4rem)", fontWeight: 800, letterSpacing: "-0.035em", lineHeight: 1.05 },
    h2: { fontSize: "clamp(1.9rem, 3.5vw, 2.6rem)", fontWeight: 750, letterSpacing: "-0.03em", lineHeight: 1.15 },
    h3: { fontSize: "clamp(1.5rem, 2.5vw, 1.9rem)", fontWeight: 700, letterSpacing: "-0.02em" },
    h4: { fontSize: "1.5rem", fontWeight: 700, letterSpacing: "-0.02em" },
    h5: { fontSize: "1.2rem", fontWeight: 650, letterSpacing: "-0.01em" },
    h6: { fontSize: "1.05rem", fontWeight: 650, letterSpacing: "-0.01em" },
    subtitle1: { fontSize: "1.075rem", lineHeight: 1.65, color: "#475569" },
    body1: { fontSize: "0.975rem", lineHeight: 1.7 },
    body2: { fontSize: "0.875rem", lineHeight: 1.6 },
    overline: { fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.12em", lineHeight: 2 },
    button: { textTransform: "none", fontWeight: 600, letterSpacing: 0 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: { scrollBehavior: "smooth" },
        body: {
          backgroundColor: tokens.canvas,
          fontFeatureSettings: '"cv11", "ss01"',
          WebkitFontSmoothing: "antialiased",
        },
        "::selection": { background: alpha(tokens.teal, 0.18) },
        a: { color: "inherit" },
        ".tabular": { fontVariantNumeric: "tabular-nums" },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 10, paddingInline: 18, minHeight: 42, transition: "all .2s ease" },
        sizeLarge: { minHeight: 50, paddingInline: 24, fontSize: "1rem" },
        containedPrimary: {
          background: `linear-gradient(135deg, ${tokens.teal} 0%, ${tokens.tealDark} 100%)`,
          boxShadow: `0 6px 18px ${alpha(tokens.teal, 0.28)}`,
          "&:hover": { boxShadow: `0 10px 24px ${alpha(tokens.teal, 0.36)}`, transform: "translateY(-1px)" },
          "&.Mui-disabled": { background: "#E2E8F0", color: "#94A3B8", boxShadow: "none" },
        },
        outlined: { borderColor: tokens.border, "&:hover": { borderColor: tokens.teal, background: alpha(tokens.teal, 0.04) } },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: "none" },
        rounded: { borderRadius: tokens.radius },
        elevation1: { boxShadow: tokens.shadow },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: { borderRadius: tokens.radius, border: `1px solid ${tokens.border}`, boxShadow: tokens.shadow },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          backgroundColor: "#fff",
          "& .MuiOutlinedInput-notchedOutline": { borderColor: tokens.border },
          "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#CBD5E1" },
        },
      },
    },
    MuiChip: { styleOverrides: { root: { fontWeight: 600, borderRadius: 8 } } },
    MuiAlert: { styleOverrides: { root: { borderRadius: 12, alignItems: "center" } } },
    MuiTab: { styleOverrides: { root: { textTransform: "none", fontWeight: 600, minHeight: 44 } } },
    MuiAccordion: {
      defaultProps: { disableGutters: true, elevation: 0 },
      styleOverrides: {
        root: {
          background: "transparent",
          borderBottom: `1px solid ${tokens.border}`,
          "&::before": { display: "none" },
        },
      },
    },
    MuiAccordionSummary: { styleOverrides: { root: { paddingInline: 0, minHeight: 64 }, content: { margin: "18px 0" } } },
    MuiAccordionDetails: { styleOverrides: { root: { paddingInline: 0, paddingTop: 0, paddingBottom: 20 } } },
    MuiLinearProgress: { styleOverrides: { root: { borderRadius: 99, height: 8 }, bar: { borderRadius: 99 } } },
    MuiTooltip: { styleOverrides: { tooltip: { borderRadius: 8, fontSize: "0.8rem", backgroundColor: tokens.ink } } },
  },
});

export default theme;
