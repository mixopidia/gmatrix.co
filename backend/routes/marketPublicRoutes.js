const express = require('express');
const router = express.Router();
const c = require('../controllers/marketPublicController');

// Public endpoints (no auth)
router.get('/markets', c.listMarkets);

// Market data (Binance passthrough)
router.get('/market-data/ticker', c.ticker);
router.get('/market-data/depth',  c.depth);
router.get('/market-data/trades', c.trades);

module.exports = router;
