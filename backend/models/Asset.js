const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
  symbol:           { type: String, required: true, unique: true, uppercase: true, trim: true },
  name:             { type: String, required: true },
  chain:            { type: String, default: 'BSC' },
  type:             { type: String, enum: ['native','token'], required: true },
  decimals:         { type: Number, default: 18 },
  contractAddress:  { type: String, default: '' },
  depositEnabled:   { type: Boolean, default: false },
  withdrawEnabled:  { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Asset', assetSchema);
