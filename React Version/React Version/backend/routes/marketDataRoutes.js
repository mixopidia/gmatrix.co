const express = require('express');
const Joi = require('joi');
const asyncHandler = require('../middleware/asyncHandler');
const binance = require('../services/binance');

const router = express.Router();

const symbolQuery = Joi.object({
  symbol: Joi.string().required(),
});

const depthQuery = Joi.object({
  symbol: Joi.string().required(),
  limit: Joi.number().integer().min(5).max(5000).default(50),
});

const tradesQuery = Joi.object({
  symbol: Joi.string().required(),
  limit: Joi.number().integer().min(1).max(1000).default(50),
});

// GET /api/market-data/ticker?symbol=BNB/USDT
router.get(
  '/ticker',
  asyncHandler(async (req, res) => {
    const { error, value } = symbolQuery.validate(req.query);
    if (error) return res.status(400).json({ error: error.details[0].message });
    const data = await binance.getTicker(value.symbol);
    res.json(data);
  })
);

// GET /api/market-data/depth?symbol=BNB/USDT&limit=50
router.get(
  '/depth',
  asyncHandler(async (req, res) => {
    const { error, value } = depthQuery.validate(req.query);
    if (error) return res.status(400).json({ error: error.details[0].message });
    const data = await binance.getDepth(value.symbol, value.limit);
    res.json(data);
  })
);

// GET /api/market-data/trades?symbol=BNB/USDT&limit=50
router.get(
  '/trades',
  asyncHandler(async (req, res) => {
    const { error, value } = tradesQuery.validate(req.query);
    if (error) return res.status(400).json({ error: error.details[0].message });
    const data = await binance.getTrades(value.symbol, value.limit);
    res.json(data);
  })
);

module.exports = router;

