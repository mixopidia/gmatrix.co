const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Create or reuse User model safely
const User =
  mongoose.models.User ||
  mongoose.model(
    "User",
    new mongoose.Schema(
      {
        email: { type: String, required: true, unique: true, index: true },
        passwordHash: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
      { versionKey: false }
    )
  );

// Helper to sign JWT
function signToken(user) {
  const payload = { id: user._id.toString(), email: user.email };
  const secret = process.env.JWT_SECRET || "devsecret";
  const opts = { expiresIn: "7d" };
  return jwt.sign(payload, secret, opts);
}

/**
 * POST /api/auth/register
 * body: { email, password }
 */
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: "email and password are required" });
    }
    const exists = await User.findOne({ email: email.toLowerCase().trim() });
    if (exists) return res.status(409).json({ error: "email already registered" });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ email: email.toLowerCase().trim(), passwordHash });

    const token = signToken(user);
    return res.json({ token, user: { id: user._id, email: user.email } });
  } catch (e) {
    console.error("register error", e);
    return res.status(500).json({ error: "register failed" });
  }
});

/**
 * POST /api/auth/login
 * body: { email, password }
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: "email and password are required" });
    }
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(401).json({ error: "invalid credentials" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "invalid credentials" });

    const token = signToken(user);
    return res.json({ token, user: { id: user._id, email: user.email } });
  } catch (e) {
    console.error("login error", e);
    return res.status(500).json({ error: "login failed" });
  }
});

module.exports = router;
