const express = require("express");
const Market = require("../models/Market");

const router = express.Router();

// Return all enabled markets
router.get("/", async (req, res) => {
  try {
    const markets = await Market.find({ status: "enabled" });
    res.json(markets);
  } catch (err) {
    console.error("Error fetching markets:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
