const mongoose = require('mongoose');

const walletTxSchema = new mongoose.Schema({
  user:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type:     { type: String, enum: ['withdraw'], default: 'withdraw' },
  asset:    { type: String, required: true, uppercase: true, trim: true },
  amount:   { type: String, required: true },             // store as string to avoid float issues
  address:  { type: String, required: true },
  status:   { type: String, enum: ['pending','approved','rejected','sent','failed'], default: 'pending' },
  txHash:   { type: String, default: '' },
  adminNote:{ type: String, default: '' },
  adminBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  adminAt:  { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('WalletTx', walletTxSchema);
