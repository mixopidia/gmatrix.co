const Transaction = require("../models/Transaction");

exports.listTransactions = async (req, res) => {
  try {
    const items = await Transaction.find({ user: req.user.id }).sort({ createdAt: -1 }).lean();
    return res.json({ items });
  } catch (e) {
    return res.status(500).json({ message: e.message || "failed to list transactions" });
  }
};

exports.createWithdraw = async (req, res) => {
  try {
    const { asset, amount, address, memo } = req.body || {};
    if (!asset || !amount || !address) return res.status(400).json({ message: "asset, amount, address required" });
    const tx = await Transaction.create({
      user: req.user.id,
      type: "withdraw",
      asset,
      amount,
      address,
      memo: memo || null,
      status: "pending",
    });
    return res.status(201).json({ message: "withdrawal queued", id: tx._id, tx });
  } catch (e) {
    return res.status(500).json({ message: e.message || "failed to create withdrawal" });
  }
};
