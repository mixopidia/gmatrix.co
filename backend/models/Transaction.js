const mongoose = require("mongoose");

const txSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["deposit", "withdraw"], required: true },
    asset: String,
    amount: Number,
    address: String,
    memo: String,
    status: { type: String, enum: ["pending", "approved", "rejected", "completed"], default: "pending" },
    txHash: String,
    adminNote: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", txSchema);
