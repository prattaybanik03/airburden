import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Box,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const location = useLocation();

  const toggleDrawer = (open) => (event) => {
    if (event.type === "keydown" && (event.key === "Tab" || event.key === "Shift")) {
      return;
    }
    setIsDrawerOpen(open);
  };

  const drawerLinkStyle = {
    textDecoration: "none",
    color: "#FFFFFF",
    fontSize: "18px",
    padding: "10px 20px",
    transition: "all 0.3s ease",
    "&:hover": {
      backgroundColor: "#333",
      borderRadius: "5px",
    },
  };

  const links = [
    { text: "Home", path: "/" },
    { text: "DataPage", path: "/air-quality-data" },
    { text: "AI/ML", path: "/ai-ml" },
    { text: "About", path: "/about" },
  ];

  return (
    <AppBar
      position="sticky"
      sx={{
        backgroundColor: "#1C1C1E",
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between", alignItems: "center" }}>
        {/* Logo */}
        <Box component={Link} to="/" sx={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
          <img src="/logo.jpg" alt="Logo" style={{ height: "40px", marginRight: "10px" }} />
          <Typography variant="h6" sx={{ color: "#FFFFFF", fontWeight: "bold" }}>
            PWC
          </Typography>
        </Box>

        {/* Hamburger Menu for Mobile */}
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={toggleDrawer(true)}
          sx={{ display: { xs: "block", md: "none" } }}
        >
          <MenuIcon />
        </IconButton>

        {/* Links for Desktop */}
        <Box sx={{ display: { xs: "none", md: "flex" }, gap: 2 }}>
          {links.map((link, index) => (
            <Link
              key={index}
              to={link.path}
              style={{
                textDecoration: "none",
                color: location.pathname === link.path ? "#1976D2" : "#FFFFFF",
                padding: "0.5rem 1rem",
                borderRadius: "5px",
                fontWeight: location.pathname === link.path ? "bold" : "normal",
                transition: "all 0.3s ease",
              }}
            >
              {link.text}
            </Link>
          ))}
        </Box>
      </Toolbar>

      {/* Drawer for Mobile */}
      <Drawer
        anchor="left"
        open={isDrawerOpen}
        onClose={toggleDrawer(false)}
        sx={{
          "& .MuiDrawer-paper": {
            backgroundColor: "#1C1C1E",
            color: "#FFFFFF",
          },
        }}
      >
        <Box
          sx={{
            width: 250,
            padding: "20px",
            backgroundColor: "#1C1C1E",
            height: "100%",
          }}
          role="presentation"
          onClick={toggleDrawer(false)}
          onKeyDown={toggleDrawer(false)}
        >
          <List>
            {links.map((link, index) => (
              <ListItem key={index} sx={{ padding: "10px 0" }}>
                <Link to={link.path} style={drawerLinkStyle}>
                  {link.text}
                </Link>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </AppBar>
  );
};

export default Navbar;
