const express = require('express');
const markets = require('../seed/seedMarkets');

const router = express.Router();

// GET /api/markets
router.get('/', (req, res) => {
  res.json(markets);
});

module.exports = router;

