import axios from "axios";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:4000";

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

// ====== Market Helpers ======
export const getMarkets = () => api.get("/api/markets");
export const getCurrentPair = (symbol) =>
  api.get(`/api/market-data/ticker?symbol=${symbol}`);
export const setCurrentPair = (symbol) => {
  localStorage.setItem("currentPair", symbol);
  window.dispatchEvent(new CustomEvent("pairChange", { detail: symbol }));
  return symbol;
};
export const loadCurrentPair = () =>
  localStorage.getItem("currentPair") || "BTCUSDT";
export const onPairChange = (callback) => {
  const handler = (e) => callback(e.detail);
  window.addEventListener("pairChange", handler);
  return () => window.removeEventListener("pairChange", handler);
};

// ====== Auth Helpers ======
export const setToken = (token) => {
  localStorage.setItem("token", token);
  api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
};
export const getToken = () => localStorage.getItem("token");
export const clearToken = () => {
  localStorage.removeItem("token");
  delete api.defaults.headers.common["Authorization"];
};
export const login = (data) => api.post("/api/auth/login", data);
export const register = (data) => api.post("/api/auth/register", data);

// ====== Orders ======
export const createOrder = (data) => api.post("/api/orders", data);
export const getOrders = (status = "open") =>
  api.get(`/api/orders?status=${status}`);
export const cancelOrder = (id) => api.post(`/api/orders/${id}/cancel`);

// ====== Wallet ======
export const getTransactions = () => api.get("/api/user/transactions");
export const withdraw = (data) => api.post("/api/user/withdraw", data);
export const getOpenOrders = () => api.get("/api/orders?status=open");
