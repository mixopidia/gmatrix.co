const express = require('express');
const router = express.Router();
const { requireAuth, requireAdmin } = require('../middleware/auth');
const c = require('../controllers/walletAdminController');

router.get('/withdrawals',                requireAuth, requireAdmin, c.listWithdrawals);
router.post('/withdrawals/:id/approve',   requireAuth, requireAdmin, c.approve);
router.post('/withdrawals/:id/reject',    requireAuth, requireAdmin, c.reject);

module.exports = router;
