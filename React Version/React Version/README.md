# BSC BNB Deposit Monitor

A robust Node.js application for monitoring BNB deposits on the Binance Smart Chain (BSC) mainnet. Built specifically for exchange platforms like GMatrix, this system provides real-time monitoring of incoming BNB transactions to your hot wallet.

## 🚀 Features

- **Real-time BNB Deposit Monitoring**: Monitors your hot wallet for incoming BNB transactions
- **Multiple RPC Endpoints**: Automatic fallback between multiple BSC RPC endpoints for reliability
- **Smart Scheduling**: Different monitoring intervals for active (5s) and quiet hours (30s)
- **Transaction Deduplication**: Prevents duplicate processing using transaction hash tracking
- **Comprehensive Logging**: Detailed logs for deposits, errors, and monitoring statistics
- **Confirmation Tracking**: Waits for 12 block confirmations before processing deposits
- **Graceful Error Handling**: Automatic RPC switching and retry mechanisms
- **Statistics Tracking**: Maintains detailed statistics of monitoring activity

## 📋 Prerequisites

- Node.js 14.0.0 or higher
- npm or yarn package manager
- A BSC hot wallet address to monitor

## 🛠️ Installation

1. **Clone or download the project files**
2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure your wallet address**:
   Edit the `CONFIG.HOT_WALLET_ADDRESS` in either:
   - `bsc-deposit-monitor.js` (basic version)
   - `bsc-deposit-monitor-enhanced.js` (enhanced version)

   Replace `'0xYourWalletAddressHere'` with your actual BSC wallet address.

## ⚙️ Configuration

### Basic Configuration (bsc-deposit-monitor.js)

```javascript
const CONFIG = {
  HOT_WALLET_ADDRESS: '0xYourWalletAddressHere',
  POLL_INTERVAL: 5000,  // 5 seconds
  MAX_BLOCKS_PER_SCAN: 10
};
```

### Enhanced Configuration (bsc-deposit-monitor-enhanced.js)

```javascript
const CONFIG = {
  HOT_WALLET_ADDRESS: '0xYourWalletAddressHere',
  SCHEDULE: {
    ACTIVE_MONITORING: 5000,    // 5 seconds (8 AM - 10 PM)
    QUIET_MONITORING: 30000,    // 30 seconds (10 PM - 8 AM)
    RETRY_DELAY: 10000
  },
  SCANNING: {
    CONFIRMATION_BLOCKS: 12,    // Wait for 12 confirmations
    MAX_BLOCKS_PER_SCAN: 10
  },
  NOTIFICATIONS: {
    MIN_AMOUNT_ALERT: '0.01'    // Minimum BNB amount to log
  }
};
```

## 🚀 Usage

### Basic Version
```bash
npm start
# or
node bsc-deposit-monitor.js
```

### Enhanced Version
```bash
node bsc-deposit-monitor-enhanced.js
```

### Development Mode (with auto-restart)
```bash
npm run dev
```

## 📊 Monitoring Schedule

The enhanced version automatically adjusts monitoring frequency based on time:

- **Active Hours (8 AM - 10 PM)**: Scans every 5 seconds
- **Quiet Hours (10 PM - 8 AM)**: Scans every 30 seconds

This helps reduce RPC usage during low-activity periods while maintaining responsiveness during peak hours.

## 📁 Output Files

The system generates several files:

- `deposits.log`: JSON-formatted deposit records
- `processed_transactions.json`: List of processed transaction hashes
- `errors.log`: Error logs for debugging
- `monitoring_stats.json`: Monitoring statistics and metrics

### Sample Deposit Log Entry
```json
{
  "timestamp": "2024-01-15T10:30:45.123Z",
  "txHash": "0x1234...",
  "from": "0xabcd...",
  "amount": "0.5",
  "amountWei": "500000000000000000",
  "blockNumber": 12345678,
  "currency": "BNB",
  "confirmations": 12
}
```

## 🔧 Customization

### Adjusting Monitoring Frequency

For the basic version:
```javascript
POLL_INTERVAL: 5000  // Change to desired milliseconds
```

For the enhanced version:
```javascript
SCHEDULE: {
  ACTIVE_MONITORING: 5000,    // Active hours frequency
  QUIET_MONITORING: 30000     // Quiet hours frequency
}
```

### Changing Confirmation Requirements

```javascript
SCANNING: {
  CONFIRMATION_BLOCKS: 12  // Increase for more security, decrease for speed
}
```

### Setting Minimum Amount Alerts

```javascript
NOTIFICATIONS: {
  MIN_AMOUNT_ALERT: '0.01'  // Only log deposits >= 0.01 BNB
}
```

## 🛡️ Security Considerations

1. **Private Key Security**: This monitor only reads blockchain data. Never include private keys in the configuration.

2. **RPC Rate Limits**: The system includes built-in rate limiting and RPC fallback to avoid hitting limits.

3. **Confirmation Blocks**: Default 12 confirmations provide good security against chain reorganizations.

4. **Log File Security**: Ensure log files are stored securely and not exposed publicly.

## 🔍 Troubleshooting

### Common Issues

1. **Connection Errors**:
   - The system automatically switches between RPC endpoints
   - Check your internet connection
   - Verify RPC endpoints are accessible

2. **High Memory Usage**:
   - The system keeps processed transaction hashes in memory
   - Consider clearing `processed_transactions.json` periodically for long-running instances

3. **Missing Deposits**:
   - Check the minimum amount threshold
   - Verify the wallet address is correct
   - Check error logs for RPC issues

### Debug Mode

Add more verbose logging by modifying the console.log statements or check the `errors.log` file for detailed error information.

## 📈 Performance Optimization

### For High-Volume Exchanges

1. **Increase Batch Size**:
   ```javascript
   SCANNING: {
     BATCH_SIZE: 10  // Process more transactions in parallel
   }
   ```

2. **Reduce Confirmation Blocks**:
   ```javascript
   SCANNING: {
     CONFIRMATION_BLOCKS: 6  // Faster processing, slightly less secure
   }
   ```

3. **Use Dedicated RPC**:
   Replace public RPC endpoints with your own BSC node or paid RPC service.

## 🔄 Production Deployment

### Using PM2 (Recommended)

1. **Install PM2**:
   ```bash
   npm install -g pm2
   ```

2. **Create PM2 config** (`ecosystem.config.js`):
   ```javascript
   module.exports = {
     apps: [{
       name: 'bsc-deposit-monitor',
       script: 'bsc-deposit-monitor-enhanced.js',
       instances: 1,
       autorestart: true,
       watch: false,
       max_memory_restart: '1G',
       env: {
         NODE_ENV: 'production'
       }
     }]
   };
   ```

3. **Start with PM2**:
   ```bash
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

### Using Docker

Create a `Dockerfile`:
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["node", "bsc-deposit-monitor-enhanced.js"]
```

## 📞 Support

For issues or questions:
1. Check the `errors.log` file for detailed error information
2. Verify your wallet address format
3. Ensure you have a stable internet connection
4. Check that all dependencies are properly installed

## ⚠️ Disclaimer

This software is provided as-is for educational and development purposes. Always test thoroughly in a development environment before using in production. The authors are not responsible for any financial losses or security issues.

## 📄 License

MIT License - see LICENSE file for details.
