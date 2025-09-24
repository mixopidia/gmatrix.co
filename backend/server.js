require("dotenv").config();

const express  = require("express");
const corsMW   = require("./middleware/cors");
const connectDB = require("./config/db");

const app = express();

// Core middleware
app.use(express.json());
app.use(corsMW);
    
// Normalize market-data symbol like 'BTC/USDT' -> 'BTCUSDT'
app.use((req,res,next) => {
  try {
    if (req.path && req.path.startsWith('/api/market-data/') && req.query && req.query.symbol) {
      const raw = Array.isArray(req.query.symbol) ? req.query.symbol[0] : req.query.symbol;
      req.query.symbol = String(raw).toUpperCase().replace(/[^A-Z0-9]/g,'');
    }
  } catch(e) {}
  next();
});

// Connect DB
connectDB();

// Helper to mount routes safely (won't crash if a file is missing)
function mount(prefix, modPath) {
  try {
    app.use(prefix, require(modPath));
    console.log(`Mounted ${prefix} -> ${modPath}`);
  } catch (e) {
    console.warn(`⚠️  Skipped ${prefix} (${modPath}): ${e.message}`);
  }
}

// Routes
mount("/api/admin",       "./routes/adminRoutes");
mount("/api/auth",        "./routes/authRoutes");
mount("/api/wallet",      "./routes/walletRoutes");
mount("/api/orders",      "./routes/orderRoutes");
mount("/api/market-data", "./routes/marketPublicRoutes");
mount("/api/markets",     "./routes/marketRoutes"); // list seeded markets

// Health
app.get("/health", (_req, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


