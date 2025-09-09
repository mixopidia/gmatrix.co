// src/lib/api.js
import axios from 'axios';

/**
 * Base URL
 * - Vite:     import.meta.env.VITE_API_BASE
 * - CRA:      process.env.REACT_APP_API_BASE
 * - Fallback: http://localhost:4000
 */
const API_BASE =
  (typeof import.meta !== 'undefined' &&
    import.meta.env &&
    import.meta.env.VITE_API_BASE) ||
  process.env.REACT_APP_API_BASE ||
  'http://localhost:4000';

/* ------------------------------------------------------------------ */
/* Token helpers                                                       */
/* ------------------------------------------------------------------ */
const TOKEN_KEY = 'token';
let _token = localStorage.getItem(TOKEN_KEY) || null;

export const setToken = t => {
  _token = t || null;
  if (t) localStorage.setItem(TOKEN_KEY, t);
  else localStorage.removeItem(TOKEN_KEY);
};

export const getToken = () => _token;

/* ------------------------------------------------------------------ */
/* Axios instance                                                      */
/* ------------------------------------------------------------------ */
export const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(cfg => {
  if (_token) cfg.headers.Authorization = `Bearer ${_token}`;
  return cfg;
});

/* ------------------------------------------------------------------ */
/* Auth (optional convenience)                                         */
/* ------------------------------------------------------------------ */
export async function login({ email, password }) {
  const { data } = await api.post('/api/auth/login', { email, password });
  if (data?.token) setToken(data.token);
  return data;
}

export async function register({ email, password }) {
  const { data } = await api.post('/api/auth/register', { email, password });
  if (data?.token) setToken(data.token);
  return data;
}

/* ------------------------------------------------------------------ */
/* Markets / market-data (optional convenience)                        */
/* ------------------------------------------------------------------ */
export async function getMarkets() {
  const { data } = await api.get('/api/markets');
  return data;
}

export async function getTicker(pair) {
  const { data } = await api.get('/api/market-data/ticker', {
    params: { symbol: pair },
  });
  return data;
}

export async function getDepth(pair, limit = 50) {
  const { data } = await api.get('/api/market-data/depth', {
    params: { symbol: pair, limit },
  });
  return data;
}

export async function getTrades(pair, limit = 50) {
  const { data } = await api.get('/api/market-data/trades', {
    params: { symbol: pair, limit },
  });
  return data;
}

/* ------------------------------------------------------------------ */
/* Orders                                                              */
/* ------------------------------------------------------------------ */
export async function createOrder({
  symbol,
  side,
  type,
  quantity,
  price,
  stopPrice,
}) {
  const body = { symbol, side, type, quantity: Number(quantity) };
  if (price !== undefined && price !== '') body.price = Number(price);
  if (stopPrice !== undefined && stopPrice !== '')
    body.stopPrice = Number(stopPrice);

  const { data } = await api.post('/api/orders', body);
  return data;
}

export async function getOpenOrders() {
  const { data } = await api.get('/api/orders/open');
  return data?.rows || [];
}

/* ------------------------------------------------------------------ */
/* Pair helpers (used by orderBridge / forms)                          */
/* ------------------------------------------------------------------ */
const PAIR_KEY = 'current_pair';

/** Persist the currently selected trading pair (e.g., "BTC/USDT") */
export function setCurrentPair(pair) {
  if (!pair || typeof pair !== 'string') return;
  localStorage.setItem(PAIR_KEY, pair);
  // Broadcast to any listeners
  try {
    window.dispatchEvent(new CustomEvent('pair:change', { detail: pair }));
  } catch (_) {}
}

/** Read the currently selected trading pair; defaults to BTC/USDT */
export function getCurrentPair() {
  return localStorage.getItem(PAIR_KEY) || 'BTC/USDT';
}

/** Subscribe to pair change events; returns an unsubscribe function */
export function onPairChange(cb) {
  const handler = e => cb?.(e.detail);
  window.addEventListener('pair:change', handler);
  return () => window.removeEventListener('pair:change', handler);
}
