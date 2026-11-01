// Shared Plotly styling so every chart matches the app's typography and palette.
import { tokens } from "../theme";

const font = { family: '"Inter Variable", Inter, system-ui, sans-serif', color: "#334155", size: 12 };
const axis = {
  gridcolor: "#EEF2F6",
  zerolinecolor: "#E2E8F0",
  linecolor: "#E2E8F0",
  tickfont: { color: "#64748B" },
  title: { font: { color: "#475569", size: 12 } },
};

export const chartLayout = (overrides = {}) => ({
  font,
  colorway: tokens.series,
  paper_bgcolor: "rgba(0,0,0,0)",
  plot_bgcolor: "rgba(0,0,0,0)",
  hoverlabel: { bgcolor: tokens.ink, bordercolor: tokens.ink, font: { color: "#fff", family: font.family } },
  legend: { orientation: "h", x: 0, y: 1.12, font: { size: 12 } },
  autosize: true,
  ...overrides,
  xaxis: { ...axis, ...(overrides.xaxis || {}) },
  yaxis: { ...axis, ...(overrides.yaxis || {}) },
});

export const geoLayout = (overrides = {}) => ({
  font,
  paper_bgcolor: "rgba(0,0,0,0)",
  autosize: true,
  margin: { t: 0, l: 0, r: 0, b: 0 },
  geo: {
    showframe: false,
    showcoastlines: false,
    showcountries: true,
    countrycolor: "#FFFFFF",
    countrywidth: 0.5,
    showland: true,
    landcolor: "#E8EDF3",
    bgcolor: "rgba(0,0,0,0)",
    projection: { type: "natural earth" },
    lataxis: { range: [-58, 85] },
  },
  ...overrides,
});

// Map outlines are served with the app (public/topojson) instead of from cdn.plot.ly, so maps work without that CDN.
export const chartConfig = { responsive: true, displayModeBar: false, topojsonURL: "/topojson/" };

// Sequential scales (light to dark) that read well on white.
export const burdenScale = [
  [0, "#FFF7ED"],
  [0.25, "#FDBA74"],
  [0.5, "#F97316"],
  [0.75, "#C2410C"],
  [1, "#7C2D12"],
];
export const exposureScale = [
  [0, "#ECFEFF"],
  [0.25, "#67E8F9"],
  [0.5, "#0EA5E9"],
  [0.75, "#4F46E5"],
  [1, "#312E81"],
];

export const colorbar = (title) => ({
  title: { text: title, side: "right", font: { size: 11, color: "#64748B" } },
  thickness: 10,
  len: 0.7,
  outlinewidth: 0,
  tickfont: { size: 10, color: "#64748B" },
});
