import axios from 'axios';

// Vite dev server proxies /api to the Express backend (see vite.config.js).
// In production, set VITE_API_BASE to your backend URL.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || '/api',
  timeout: 15000,
});

export const getArbitrages = (bankroll, minProfit) =>
  api.get('/arbitrage', { params: { bankroll, minProfit } }).then((r) => r.data);

export const getMatches = (bankroll) =>
  api.get('/matches', { params: { bankroll } }).then((r) => r.data);

export const getBookmakers = () => api.get('/bookmakers').then((r) => r.data);
export const getLeagues = () => api.get('/leagues').then((r) => r.data);

export const getHistory = (limit = 100) =>
  api.get('/history', { params: { limit } }).then((r) => r.data);

export const getFavorites = () => api.get('/favorites').then((r) => r.data);
export const addFavorite = (league) => api.post('/favorites', { league }).then((r) => r.data);
export const removeFavorite = (league) => api.delete(`/favorites/${encodeURIComponent(league)}`).then((r) => r.data);

export const calculate = (homeOdds, drawOdds, awayOdds, bankroll) =>
  api.post('/calculate', { homeOdds, drawOdds, awayOdds, bankroll }).then((r) => r.data);

export default api;
