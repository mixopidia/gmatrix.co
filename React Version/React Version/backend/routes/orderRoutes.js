const express = require('express');
const Joi = require('joi');
const auth = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');
const Order = require('../models/Order');

const router = express.Router();

const orderSchema = Joi.object({
  symbol: Joi.string().required(),
  side: Joi.string().valid('BUY', 'SELL').required(),
  type: Joi.string().valid('MARKET', 'LIMIT', 'STOP').required(),
  quantity: Joi.number().positive().required(),
  price: Joi.number().positive().when('type', { is: 'LIMIT', then: Joi.required(), otherwise: Joi.optional() }),
  stopPrice: Joi.number().positive().when('type', { is: 'STOP', then: Joi.required(), otherwise: Joi.optional() }),
});

// Auth required for all order routes
router.use(auth);

// POST /api/orders
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { error, value } = orderSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const order = await Order.create({ ...value, user: req.user.id });
    return res.json({ ok: true, order });
  })
);

// GET /api/orders/open
router.get(
  '/open',
  asyncHandler(async (req, res) => {
    const rows = await Order.find({ user: req.user.id, status: 'OPEN' }).sort({ createdAt: -1 });
    return res.json({ ok: true, rows });
  })
);

module.exports = router;

