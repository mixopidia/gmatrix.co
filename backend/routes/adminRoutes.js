const express = require('express');
const router = express.Router();
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { bootstrapAdmin, createAsset, listAssets, createMarket, listMarkets } = require('../controllers/adminController');

router.post('/bootstrap-admin', bootstrapAdmin);

router.post('/assets', requireAuth, requireAdmin, createAsset);
router.get('/assets',  requireAuth, requireAdmin, listAssets);

router.post('/markets', requireAuth, requireAdmin, createMarket);
router.get('/markets',  requireAuth, requireAdmin, listMarkets);

module.exports = router;
