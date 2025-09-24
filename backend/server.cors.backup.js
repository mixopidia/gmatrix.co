const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// --- Middleware ---
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:3000' }));
app.use(express.json());

// --- Mongo (optional) ---
if (process.env.MONGO_URI) {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB failed', err));
} else {
  console.warn('MONGO_URI not set — skipping Mongo connection');
}

// Helper: mount a router only if the file exists
function safeMount(path, mod) {
  try {
    const r = require(mod);
    app.use(path, r);
    console.log('Mounted', path, '->', mod);
  } catch (e) {
    if (e.code === 'MODULE_NOT_FOUND') {
      console.warn('Route not found, skipping:', mod);
    } else {
      console.error('Error mounting', mod, e);
    }
  }
}

// --- Routes (mounted if present) ---
safeMount('/api/auth', './routes/authRoutes');
safeMount('/api/orders', './routes/orderRoutes');
safeMount('/api/wallet', './routes/walletRoutes');
// Public market endpoints live together under a single router
// Exposes: GET /api/markets, /api/market-data/ticker|depth|trades
safeMount('/api', './routes/marketPublicRoutes');

// Health
app.get('/api/ping', (req, res) => {
  res.json({ message: 'pong' });
});

// --- Start ---
app.listen(PORT, () => {
  console.log('Server running on http://localhost:' + PORT);
});
