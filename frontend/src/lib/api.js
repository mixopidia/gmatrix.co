export const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

export async function apiGet(path) {
  const url = `${API_BASE}${path}`;
  const r = await fetch(url, { headers: { accept: "application/json" } });
  if (!r.ok) {
    const text = await r.text();
    throw new Error(`HTTP ${r.status}: ${text}`);
  }
  return r.json();
}
