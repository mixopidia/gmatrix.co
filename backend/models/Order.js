const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    symbol: { type: String, required: true },              // e.g. "BNB/USDT"
    side:   { type: String, enum: ["buy", "sell"], required: true },
    type:   { type: String, enum: ["limit", "market", "stop", "stopmarket"], default: "limit" },
    price:  { type: Number },                               // required for limit/stop
    amount: { type: Number, required: true },
    executed: { type: Number, default: 0 },
    status: { type: String, enum: ["open", "partially_filled", "filled", "canceled", "rejected"], default: "open" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
