const Order = require("../models/Order");

exports.createOrder = async (req, res) => {
  try {
    const { symbol, side, type = "limit", price, amount } = req.body || {};
    if (!symbol || !side || !amount) return res.status(400).json({ message: "symbol, side, amount are required" });
    if ((type === "limit" || type === "stop") && (price == null)) {
      return res.status(400).json({ message: "price is required for limit/stop orders" });
    }
    const order = await Order.create({
      user: req.user.id,
      symbol,
      side,
      type,
      price: price ?? null,
      amount,
    });
    return res.status(201).json(order);
  } catch (e) {
    return res.status(500).json({ message: e.message || "failed to create order" });
  }
};

exports.listOrders = async (req, res) => {
  try {
    const { status } = req.query;
    const q = { user: req.user.id };
    if (status === "open") q.status = { $in: ["open", "partially_filled"] };
    if (status === "closed") q.status = { $in: ["filled", "canceled", "rejected"] };
    const items = await Order.find(q).sort({ createdAt: -1 }).lean();
    return res.json({ items });
  } catch (e) {
    return res.status(500).json({ message: e.message || "failed to list orders" });
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const id = req.params.id;
    const order = await Order.findOne({ _id: id, user: req.user.id });
    if (!order) return res.status(404).json({ message: "order not found" });
    if (!["open", "partially_filled"].includes(order.status)) {
      return res.status(400).json({ message: "order is not open" });
    }
    order.status = "canceled";
    await order.save();
    return res.json({ message: "canceled", order });
  } catch (e) {
    return res.status(500).json({ message: e.message || "failed to cancel order" });
  }
};
