const express = require('express');
const Joi = require('joi');
const auth = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');
const Transaction = require('../models/Transaction');
const Withdrawal = require('../models/Withdrawal');

const router = express.Router();

router.use(auth);

// GET /api/user/transactions
router.get(
  '/transactions',
  asyncHandler(async (req, res) => {
    const rows = await Transaction.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json({ ok: true, rows });
  })
);

const withdrawSchema = Joi.object({
  asset: Joi.string().required(),
  address: Joi.string().required(),
  amount: Joi.number().positive().required(),
});

// POST /api/user/withdraw
router.post(
  '/withdraw',
  asyncHandler(async (req, res) => {
    const { error, value } = withdrawSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const requestId = `wd_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const wd = await Withdrawal.create({ ...value, user: req.user.id, requestId });

    // Record a transaction for visibility
    await Transaction.create({
      user: req.user.id,
      type: 'WITHDRAWAL',
      asset: value.asset,
      amount: value.amount,
      meta: { address: value.address, requestId },
    });

    res.json({ ok: true, requestId: wd.requestId });
  })
);

module.exports = router;

