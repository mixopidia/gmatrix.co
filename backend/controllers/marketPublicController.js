const Market = require('../models/Market');

const BN_REST = process.env.BINANCE_REST || 'https://api.binance.com';

function buildURL(path, params = {}) {
  const url = new URL(path, BN_REST);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v));
  return url;
}

function toBinanceSymbol(s) {
  if (!s) return '';
  return String(s).replace('/', '').toUpperCase(); // 'BNB/USDT' -> 'BNBUSDT'
}

async function getJSON(url) {
  const r = await fetch(url, { headers: { accept: 'application/json' } });
  if (!r.ok) {
    const body = await r.text().catch(() => '');
    throw new Error('HTTP ' + r.status + ' ' + r.statusText + ': ' + body.slice(0, 300));
  }
  return r.json();
}

exports.listMarkets = async (_req, res) => {
  try {
    const items = await Market.find({ status: 'enabled' }).sort({ symbol: 1 }).lean();
    res.json(items);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.ticker = async (req, res) => {
  try {
    const symbol = toBinanceSymbol(req.query.symbol);
    if (!symbol) return res.status(400).json({ message: 'symbol required' });
    const data = await getJSON(buildURL('/api/v3/ticker/price', { symbol }));
    res.json(data);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.depth = async (req, res) => {
  try {
    const symbol = toBinanceSymbol(req.query.symbol);
    const limit  = Number(req.query.limit || 50);
    if (!symbol) return res.status(400).json({ message: 'symbol required' });
    const data = await getJSON(buildURL('/api/v3/depth', { symbol, limit }));
    res.json(data);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.trades = async (req, res) => {
  try {
    const symbol = toBinanceSymbol(req.query.symbol);
    const limit  = Number(req.query.limit || 50);
    if (!symbol) return res.status(400).json({ message: 'symbol required' });
    const data = await getJSON(buildURL('/api/v3/trades', { symbol, limit }));
    res.json(data);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
