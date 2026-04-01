// Mahjong green-table theme
const mahjongGreen = '#1a472a';
const mahjongDarkGreen = '#0f2d1a';
const gold = '#c9a94e';
const parchment = '#f0e6d3';
const cream = '#faf6ef';

export default {
  light: {
    text: mahjongDarkGreen,
    background: cream,
    tint: mahjongGreen,
    tabIconDefault: '#8a8a6a',
    tabIconSelected: mahjongGreen,
    card: '#ffffff',
    cardBorder: '#d4c9a8',
    accent: gold,
    subtitle: '#5a6b5a',
    surface: parchment,
  },
  dark: {
    text: parchment,
    background: mahjongDarkGreen,
    tint: gold,
    tabIconDefault: '#6b7b6b',
    tabIconSelected: gold,
    card: '#1e3a24',
    cardBorder: '#2a5a3a',
    accent: gold,
    subtitle: '#9aaa8a',
    surface: '#162e1c',
  },
};

export { mahjongGreen, mahjongDarkGreen, gold, parchment, cream };
