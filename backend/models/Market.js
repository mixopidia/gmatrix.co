const mongoose = require('mongoose');

const marketSchema = new mongoose.Schema({
  base:              { type: String, required: true, uppercase: true },
  quote:             { type: String, required: true, uppercase: true },
  symbol:            { type: String, required: true, unique: true }, // e.g., BNB/USDT
  pricePrecision:    { type: Number, default: 4 },
  quantityPrecision: { type: Number, default: 6 },
  status:            { type: String, enum: ['enabled','disabled'], default: 'enabled' }
}, { timestamps: true });

module.exports = mongoose.model('Market', marketSchema);
