const mongoose = require('mongoose');

const withdrawalSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  asset:   { type: String, required: true, uppercase: true }, // e.g., BNB, USDT
  amount:  { type: String, required: true },                  // store as string to avoid float issues
  address: { type: String, required: true },                  // destination address
  status:  { type: String, enum: ['pending','approved','rejected','sent'], default: 'pending' },
  note:    { type: String, default: '' },
  txHash:  { type: String, default: '' },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Withdrawal', withdrawalSchema);
