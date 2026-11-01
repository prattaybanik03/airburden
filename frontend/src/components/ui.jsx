// Shared building blocks so every page uses the same rhythm, headers and cards.
import { Box, Card, Container, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { motion } from "framer-motion";
import { tokens } from "../theme";

export const Eyebrow = ({ children, light = false }) => (
  <Typography
    variant="overline"
    component="div"
    sx={{
      display: "inline-flex",
      alignItems: "center",
      gap: 1,
      color: light ? tokens.cyan : "primary.main",
      "&::before": {
        content: '""',
        width: 18,
        height: 2,
        borderRadius: 2,
        background: "currentColor",
      },
    }}
  >
    {children}
  </Typography>
);

export const SectionHeader = ({ eyebrow, title, subtitle, align = "center", light = false, sx }) => (
  <Stack spacing={1.5} alignItems={align === "center" ? "center" : "flex-start"} textAlign={align} sx={{ mb: { xs: 4, md: 6 }, ...sx }}>
    {eyebrow && <Eyebrow light={light}>{eyebrow}</Eyebrow>}
    <Typography variant="h2" sx={{ color: light ? "#fff" : "text.primary", maxWidth: 760 }}>
      {title}
    </Typography>
    {subtitle && (
      <Typography variant="subtitle1" sx={{ maxWidth: 680, color: light ? alpha("#fff", 0.72) : "text.secondary" }}>
        {subtitle}
      </Typography>
    )}
  </Stack>
);

export const Section = ({ children, sx, maxWidth = "lg", id }) => (
  <Box component="section" id={id} sx={{ py: { xs: 8, md: 12 }, scrollMarginTop: 80, ...sx }}>
    <Container maxWidth={maxWidth}>{children}</Container>
  </Box>
);

/** Dark gradient banner used at the top of inner pages. */
export const PageHeader = ({ eyebrow, title, subtitle, children }) => (
  <Box
    sx={{
      position: "relative",
      overflow: "hidden",
      color: "#fff",
      background: `radial-gradient(900px 400px at 85% -10%, ${alpha(tokens.violet, 0.35)}, transparent 60%),
                   radial-gradient(800px 380px at 10% 120%, ${alpha(tokens.teal, 0.45)}, transparent 60%),
                   ${tokens.ink}`,
      pt: { xs: 14, md: 18 },
      pb: { xs: 8, md: 10 },
    }}
  >
    <GridPattern />
    <Container maxWidth="lg" sx={{ position: "relative" }}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <Eyebrow light>{eyebrow}</Eyebrow>
        <Typography variant="h1" sx={{ mt: 1.5, maxWidth: 820, fontSize: "clamp(2.2rem, 4.5vw, 3.4rem)" }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="subtitle1" sx={{ mt: 2, maxWidth: 680, color: alpha("#fff", 0.72) }}>
            {subtitle}
          </Typography>
        )}
        {children}
      </motion.div>
    </Container>
  </Box>
);

export const GridPattern = () => (
  <Box
    aria-hidden
    sx={{
      position: "absolute",
      inset: 0,
      backgroundImage: `linear-gradient(${alpha("#fff", 0.05)} 1px, transparent 1px), linear-gradient(90deg, ${alpha("#fff", 0.05)} 1px, transparent 1px)`,
      backgroundSize: "48px 48px",
      maskImage: "radial-gradient(ellipse at 50% 0%, #000 30%, transparent 75%)",
      WebkitMaskImage: "radial-gradient(ellipse at 50% 0%, #000 30%, transparent 75%)",
      pointerEvents: "none",
    }}
  />
);

/** Card with a titled header row; `action` sits on the right (filters, toggles). */
export const Panel = ({ title, subtitle, icon, action, children, sx, contentSx, id }) => (
  <Card id={id} sx={{ overflow: "hidden", scrollMarginTop: 96, ...sx }}>
    {(title || action) && (
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        alignItems={{ xs: "stretch", md: "center" }}
        justifyContent="space-between"
        sx={{ px: { xs: 2.5, md: 3.5 }, pt: { xs: 2.5, md: 3 }, pb: 2 }}
      >
        <Stack direction="row" spacing={1.75} alignItems="center">
          {icon && <IconTile>{icon}</IconTile>}
          <Box>
            <Typography variant="h5">{title}</Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
        </Stack>
        {action}
      </Stack>
    )}
    <Box sx={{ px: { xs: 2.5, md: 3.5 }, pb: { xs: 2.5, md: 3.5 }, ...contentSx }}>{children}</Box>
  </Card>
);

export const IconTile = ({ children, color = tokens.teal, size = 44 }) => (
  <Box
    sx={{
      width: size,
      height: size,
      flexShrink: 0,
      display: "grid",
      placeItems: "center",
      borderRadius: 3,
      color,
      background: alpha(color, 0.1),
      border: `1px solid ${alpha(color, 0.18)}`,
      "& svg": { fontSize: size * 0.5 },
    }}
  >
    {children}
  </Box>
);

export const Stat = ({ value, label, light = false }) => (
  <Box>
    <Typography className="tabular" sx={{ fontSize: { xs: "1.6rem", md: "2rem" }, fontWeight: 800, letterSpacing: "-0.03em", color: light ? "#fff" : "text.primary", lineHeight: 1.1 }}>
      {value}
    </Typography>
    <Typography variant="body2" sx={{ color: light ? alpha("#fff", 0.6) : "text.secondary", mt: 0.5 }}>
      {label}
    </Typography>
  </Box>
);

/** Fade-and-rise when scrolled into view. */
export const Reveal = ({ children, delay = 0, y = 18 }) => (
  <motion.div
    initial={{ opacity: 0, y }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-60px" }}
    transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    style={{ height: "100%" }}
  >
    {children}
  </motion.div>
);
