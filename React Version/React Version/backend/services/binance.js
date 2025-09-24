const axios = require('axios');

const BASE_URL = process.env.BINANCE_REST || 'https://api.binance.com';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10_000,
});

const normalize = (symbol) => symbol.replace(/\//g, '').toUpperCase();

module.exports = {
  getTicker: async (symbol) => {
    const sym = normalize(symbol);
    // 24hr ticker gives comprehensive info
    const { data } = await api.get('/api/v3/ticker/24hr', { params: { symbol: sym } });
    return data;
  },
  getDepth: async (symbol, limit = 50) => {
    const sym = normalize(symbol);
    const { data } = await api.get('/api/v3/depth', { params: { symbol: sym, limit } });
    return data;
  },
  getTrades: async (symbol, limit = 50) => {
    const sym = normalize(symbol);
    const { data } = await api.get('/api/v3/trades', { params: { symbol: sym, limit } });
    return data;
  },
};

