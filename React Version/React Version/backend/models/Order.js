const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    symbol: { type: String, required: true }, // e.g., BNB/USDT
    side: { type: String, enum: ['BUY', 'SELL'], required: true },
    type: { type: String, enum: ['MARKET', 'LIMIT', 'STOP'], required: true },
    quantity: { type: Number, required: true, min: 0 },
    price: { type: Number },
    stopPrice: { type: Number },
    status: { type: String, enum: ['OPEN', 'FILLED', 'CANCELED'], default: 'OPEN' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', OrderSchema);

