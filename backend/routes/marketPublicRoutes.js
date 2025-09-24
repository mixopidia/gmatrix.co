const express = require('express');
const router = express.Router();
const c = require('../controllers/marketPublicController');

// Public endpoints (no auth)
// When mounted at `/api/market-data`, these resolve to:
// - GET /api/market-data/markets
// - GET /api/market-data/ticker
// - GET /api/market-data/depth
// - GET /api/market-data/trades
router.get('/markets', c.listMarkets);

// Market data (Binance passthrough)
router.get('/ticker', c.ticker);
router.get('/depth',  c.depth);
router.get('/trades', c.trades);

module.exports = router;
