const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Asset = require('../models/Asset');
const Market = require('../models/Market');

exports.bootstrapAdmin = async (req, res) => {
  try {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    if (!email || !password) return res.status(400).json({ message: 'ADMIN_EMAIL/ADMIN_PASSWORD not set' });

    let admin = await User.findOne({ email });
    if (!admin) {
      const hashed = await bcrypt.hash(password, 10);
      admin = await User.create({ email, password: hashed, role: 'admin' });
    } else if (admin.role !== 'admin') {
      admin.role = 'admin';
      await admin.save();
    }

    const token = jwt.sign({ id: admin._id, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXP || '7d' });
    res.json({ message: 'Admin created', token });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.createAsset = async (req, res) => {
  try {
    const payload = req.body || {};
    const symbol = String(payload.symbol || '').toUpperCase();
    if (!symbol) return res.status(400).json({ message: 'symbol required' });

    const data = {
      symbol,
      name: payload.name || symbol,
      chain: payload.chain || 'BSC',
      type: payload.type || 'token', // 'native' or 'token'
      decimals: payload.decimals == null ? 18 : Number(payload.decimals),
      contractAddress: payload.contractAddress || '',
      depositEnabled: !!payload.depositEnabled,
      withdrawEnabled: !!payload.withdrawEnabled
    };

    const asset = await Asset.findOneAndUpdate(
      { symbol },
      data,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.json(asset);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.listAssets = async (_req, res) => {
  try {
    const items = await Asset.find().sort({ symbol: 1 }).lean();
    res.json(items);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.createMarket = async (req, res) => {
  try {
    const body = req.body || {};
    const base = body.base;
    const quote = body.quote;
    const pricePrecision = body.pricePrecision == null ? 4 : Number(body.pricePrecision);
    const quantityPrecision = body.quantityPrecision == null ? 6 : Number(body.quantityPrecision);

    if (!base || !quote) return res.status(400).json({ message: 'base and quote required' });

    const b = String(base).toUpperCase();
    const q = String(quote).toUpperCase();
    const symbol = b + '/' + q;

    const market = await Market.findOneAndUpdate(
      { symbol },
      { base: b, quote: q, symbol, pricePrecision, quantityPrecision },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.json(market);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.listMarkets = async (_req, res) => {
  try {
    const items = await Market.find().sort({ symbol: 1 }).lean();
    res.json(items);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
