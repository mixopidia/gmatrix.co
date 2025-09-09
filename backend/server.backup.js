const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const orderRoutes = require('./routes/orderRoutes');
const walletRoutes = require('./routes/walletRoutes');
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());

// --- MongoDB connect ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB failed', err);
    process.exit(1);
  });

// --- Routes ---
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const marketPublicRoutes = require('./routes/marketPublicRoutes');
const walletRoutes = require('./routes/walletRoutes');
const walletAdminRoutes = require('./routes/walletAdminRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api',      marketPublicRoutes);
app.use('/api/wallets', walletRoutes);
app.use('/api/wallets/admin', walletAdminRoutes);
// Health check
app.get('/api/ping', (req, res) => { res.json({ message: 'pong' }); });});
});

// --- Start server ---
app.use('/api/orders', orderRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/user', walletRoutes);

  console.log('Server running on http://localhost:' + PORT);
});





