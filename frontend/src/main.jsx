import React from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider, CssBaseline } from '@mui/material';
import App from './App';
import theme from './theme'; // Import custom theme
import './index.css';

createRoot(document.getElementById('root')).render(
  <ThemeProvider theme={theme}>
    <CssBaseline /> {/* Reset CSS baseline for consistent styling */}
    <App />
  </ThemeProvider>
);
