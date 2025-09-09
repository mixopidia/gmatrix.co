const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['DEPOSIT', 'WITHDRAWAL', 'TRADE'],
      required: true,
    },
    asset: { type: String },
    amount: { type: Number },
    meta: { type: Object },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Transaction', TransactionSchema);

