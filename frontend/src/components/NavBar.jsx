import { useState } from "react";
import { Link as RouterLink, NavLink, useLocation } from "react-router-dom";
import {
  AppBar,
  Box,
  Button,
  Container,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  Toolbar,
  useScrollTrigger,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import GitHubIcon from "@mui/icons-material/GitHub";
import { tokens } from "../theme";
import { NAV_LINKS, REPO_URL } from "../utils/site";
import Brand from "./Brand";

const NavBar = () => {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const scrolled = useScrollTrigger({ disableHysteresis: true, threshold: 24 });

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        transition: "background-color .25s ease, border-color .25s ease, backdrop-filter .25s ease",
        backgroundColor: scrolled ? alpha(tokens.ink, 0.82) : "transparent",
        backdropFilter: scrolled ? "saturate(160%) blur(14px)" : "none",
        borderBottom: `1px solid ${scrolled ? alpha("#fff", 0.08) : "transparent"}`,
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ minHeight: { xs: 64, md: 72 }, justifyContent: "space-between" }}>
          <Brand />

          <Stack direction="row" spacing={0.5} alignItems="center" sx={{ display: { xs: "none", md: "flex" } }}>
            {NAV_LINKS.map((link) => (
              <Button
                key={link.path}
                component={NavLink}
                to={link.path}
                end
                sx={{
                  color: alpha("#fff", 0.72),
                  fontWeight: 550,
                  px: 1.75,
                  minHeight: 38,
                  borderRadius: 2,
                  "&:hover": { color: "#fff", backgroundColor: alpha("#fff", 0.06) },
                  "&.active": { color: "#fff", backgroundColor: alpha("#fff", 0.1) },
                }}
              >
                {link.text}
              </Button>
            ))}
            <Box sx={{ width: 12 }} />
            <Button
              href={REPO_URL}
              target="_blank"
              rel="noopener"
              startIcon={<GitHubIcon />}
              variant="outlined"
              sx={{
                color: "#fff",
                minHeight: 38,
                borderColor: alpha("#fff", 0.22),
                "&:hover": { borderColor: alpha("#fff", 0.5), backgroundColor: alpha("#fff", 0.06) },
              }}
            >
              GitHub
            </Button>
          </Stack>

          <IconButton aria-label="Open menu" onClick={() => setOpen(true)} sx={{ display: { md: "none" }, color: "#fff" }}>
            <MenuRoundedIcon />
          </IconButton>
        </Toolbar>
      </Container>

      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{ sx: { width: 280, backgroundColor: tokens.ink, color: "#fff", p: 2 } }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Brand />
          <IconButton aria-label="Close menu" onClick={() => setOpen(false)} sx={{ color: "#fff" }}>
            <CloseRoundedIcon />
          </IconButton>
        </Stack>
        <List onClick={() => setOpen(false)}>
          {NAV_LINKS.map((link) => (
            <ListItemButton
              key={link.path}
              component={RouterLink}
              to={link.path}
              selected={pathname === link.path}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                "&.Mui-selected": { backgroundColor: alpha(tokens.teal, 0.25) },
                "&.Mui-selected:hover": { backgroundColor: alpha(tokens.teal, 0.3) },
              }}
            >
              <ListItemText primary={link.text} primaryTypographyProps={{ fontWeight: 600 }} />
            </ListItemButton>
          ))}
          <ListItemButton component="a" href={REPO_URL} target="_blank" rel="noopener" sx={{ borderRadius: 2 }}>
            <GitHubIcon sx={{ mr: 1.5, fontSize: 20 }} />
            <ListItemText primary="GitHub" primaryTypographyProps={{ fontWeight: 600 }} />
          </ListItemButton>
        </List>
      </Drawer>
    </AppBar>
  );
};

export default NavBar;
