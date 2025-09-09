const WalletTx = require('../models/WalletTx');

exports.listWithdrawals = async (req, res) => {
  try {
    const status = req.query.status || 'pending';
    const items = await WalletTx.find({ type: 'withdraw', status }).sort({ createdAt: 1 }).lean();
    res.json(items);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.approve = async (req, res) => {
  try {
    const id = req.params.id;
    const tx = await WalletTx.findById(id);
    if (!tx) return res.status(404).json({ message: 'not found' });
    if (tx.status !== 'pending') return res.status(400).json({ message: 'not pending' });

    tx.status  = 'approved';
    tx.adminBy = req.user.id;
    tx.adminAt = new Date();
    await tx.save();

    res.json({ message: 'approved' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.reject = async (req, res) => {
  try {
    const id = req.params.id;
    const note = (req.body && req.body.note) || '';

    const tx = await WalletTx.findById(id);
    if (!tx) return res.status(404).json({ message: 'not found' });
    if (tx.status !== 'pending') return res.status(400).json({ message: 'not pending' });

    tx.status    = 'rejected';
    tx.adminBy   = req.user.id;
    tx.adminAt   = new Date();
    tx.adminNote = note;
    await tx.save();

    res.json({ message: 'rejected' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
