/* eslint-disable no-console */
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('MONGO_URI not set in environment');
  process.exit(1);
}

const { Asset, Market } = require('../models');

async function upsertAsset(data) {
  const symbol = String(data.symbol).toUpperCase();
  // Only set core fields; avoid overriding deposit/withdraw flags.
  const setFields = {
    name: data.name || symbol,
    type: data.type,
    decimals: data.decimals,
    contractAddress: data.contractAddress || '',
  };
  await Asset.findOneAndUpdate(
    { symbol },
    { $set: setFields, $setOnInsert: { symbol, chain: data.chain || 'BSC' } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}

async function upsertMarket(base, quote, overrides = {}) {
  const b = String(base).toUpperCase();
  const q = String(quote).toUpperCase();
  const symbol = `${b}/${q}`;
  await Market.findOneAndUpdate(
    { symbol },
    { $set: { pricePrecision: overrides.pricePrecision, quantityPrecision: overrides.quantityPrecision, status: overrides.status || 'enabled' }, $setOnInsert: { base: b, quote: q, symbol } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}

async function main() {
  await mongoose.connect(MONGO_URI);

  // 1) Seed assets if they don't exist
  const assets = [
    { symbol: 'BTC', name: 'Bitcoin', type: 'native', decimals: 8 },
    { symbol: 'ETH', name: 'Ethereum', type: 'native', decimals: 18 },
    { symbol: 'USDT', name: 'Tether USD', type: 'token', decimals: 18, contractAddress: '0x55d398326f99059fF775485246999027B3197955' },
    { symbol: 'BNB', name: 'BNB', type: 'native', decimals: 18 },
  ];
  for (const a of assets) {
    await upsertAsset(a);
  }

  // 2) Seed markets if they don't exist
  const markets = [
    { base: 'BTC', quote: 'USDT', pricePrecision: 2, quantityPrecision: 4, status: 'enabled' },
    { base: 'ETH', quote: 'USDT', pricePrecision: 2, quantityPrecision: 4, status: 'enabled' },
    { base: 'BNB', quote: 'USDT', pricePrecision: 2, quantityPrecision: 4, status: 'enabled' },
    { base: 'ETH', quote: 'BTC',  pricePrecision: 5, quantityPrecision: 4, status: 'enabled' },
  ];
  for (const m of markets) {
    await upsertMarket(m.base, m.quote, m);
  }

  console.log('✅ Seeding complete');
}

main()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    try { await mongoose.disconnect(); } catch (_) {}
    process.exit();
  });
