const express = require('express');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const asyncHandler = require('../middleware/asyncHandler');
const User = require('../models/User');

const router = express.Router();

const authSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const signToken = (user) => {
  return jwt.sign({ id: user._id.toString(), email: user.email }, process.env.JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: '7d',
  });
};

// POST /api/auth/register
router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const { error, value } = authSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { email, password } = value;
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const user = await User.create({ email, password });
    const token = signToken(user);
    return res.json({ token, user: { id: user._id.toString(), email: user.email } });
  })
);

// POST /api/auth/login
router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { error, value } = authSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { email, password } = value;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const match = await user.matchPassword(password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    const token = signToken(user);
    return res.json({ token, user: { id: user._id.toString(), email: user.email } });
  })
);

module.exports = router;

