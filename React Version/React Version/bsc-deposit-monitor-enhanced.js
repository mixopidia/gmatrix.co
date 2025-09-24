const Web3 = require('web3');
const fs = require('fs');
const path = require('path');

// Enhanced Configuration
const CONFIG = {
  // BSC Mainnet RPC endpoints (public)
  RPC_ENDPOINTS: [
    'https://bsc-dataseed1.binance.org/',
    'https://bsc-dataseed2.binance.org/',
    'https://bsc-dataseed3.binance.org/',
    'https://bsc-dataseed4.binance.org/',
    'https://bsc.nodereal.io',
    'https://rpc-bsc.bnb48.club',
    'https://bsc-mainnet.nodereal.io/v1/64a9df0874fb4a93b9d0a3849de012d3'
  ],
  // Your hot wallet address to monitor
  HOT_WALLET_ADDRESS: '0xYourWalletAddressHere',
  // Monitoring schedule (in milliseconds)
  SCHEDULE: {
    ACTIVE_MONITORING: 5000,    // 5 seconds during active hours (8 AM - 10 PM)
    QUIET_MONITORING: 30000,    // 30 seconds during quiet hours (10 PM - 8 AM)
    RETRY_DELAY: 10000,         // 10 seconds retry delay on errors
    MAX_RETRIES: 3              // Maximum retries before switching RPC
  },
  // Block scanning configuration
  SCANNING: {
    MAX_BLOCKS_PER_SCAN: 10,    // Maximum blocks to scan per iteration
    BATCH_SIZE: 5,              // Number of blocks to process in parallel
    CONFIRMATION_BLOCKS: 12     // Number of confirmations required
  },
  // File paths
  FILES: {
    PROCESSED_TXS: 'processed_transactions.json',
    DEPOSITS_LOG: 'deposits.log',
    ERROR_LOG: 'errors.log',
    STATS_FILE: 'monitoring_stats.json'
  },
  // Notification settings
  NOTIFICATIONS: {
    ENABLE_CONSOLE: true,
    ENABLE_FILE_LOGGING: true,
    MIN_AMOUNT_ALERT: '0.01',   // Minimum BNB amount to log (in BNB)
    MAX_LOG_SIZE: 10 * 1024 * 1024  // 10MB max log file size
  }
};

class EnhancedBSCDepositMonitor {
  constructor() {
    this.web3 = null;
    this.currentBlock = 0;
    this.processedTxs = new Set();
    this.isRunning = false;
    this.fallbackRpcIndex = 0;
    this.stats = {
      startTime: null,
      totalBlocksScanned: 0,
      totalTransactionsProcessed: 0,
      totalDepositsFound: 0,
      totalBNBReceived: '0',
      lastDepositTime: null,
      errors: 0,
      rpcSwitches: 0
    };

    this.loadProcessedTransactions();
    this.loadStats();
  }

  // Initialize Web3 with enhanced error handling
  async initializeWeb3() {
    for (let i = 0; i < CONFIG.RPC_ENDPOINTS.length; i++) {
      try {
        const rpcUrl = CONFIG.RPC_ENDPOINTS[i];
        console.log(`🔄 Connecting to BSC RPC: ${rpcUrl}`);

        this.web3 = new Web3(new Web3.providers.HttpProvider(rpcUrl, {
          timeout: 15000,
          keepAlive: true,
          withCredentials: false
        }));

        // Test connection with timeout
        const blockNumber = await Promise.race([
          this.web3.eth.getBlockNumber(),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Connection timeout')), 10000)
          )
        ]);

        console.log(`✅ Connected to BSC Mainnet. Current block: ${blockNumber}`);

        this.currentBlock = blockNumber;
        this.fallbackRpcIndex = i;
        return true;
      } catch (error) {
        console.log(`❌ Failed to connect to ${CONFIG.RPC_ENDPOINTS[i]}: ${error.message}`);
        continue;
      }
    }

    throw new Error('Failed to connect to any BSC RPC endpoint');
  }

  // Load processed transactions with error handling
  loadProcessedTransactions() {
    try {
      if (fs.existsSync(CONFIG.FILES.PROCESSED_TXS)) {
        const data = fs.readFileSync(CONFIG.FILES.PROCESSED_TXS, 'utf8');
        const txs = JSON.parse(data);
        this.processedTxs = new Set(txs);
        console.log(`📁 Loaded ${this.processedTxs.size} previously processed transactions`);
      }
    } catch (error) {
      this.logError('loadProcessedTransactions', error);
    }
  }

  // Load monitoring statistics
  loadStats() {
    try {
      if (fs.existsSync(CONFIG.FILES.STATS_FILE)) {
        const data = fs.readFileSync(CONFIG.FILES.STATS_FILE, 'utf8');
        this.stats = { ...this.stats, ...JSON.parse(data) };
        console.log(`📊 Loaded monitoring statistics`);
      }
    } catch (error) {
      this.logError('loadStats', error);
    }
  }

  // Save monitoring statistics
  saveStats() {
    try {
      this.stats.lastUpdate = new Date().toISOString();
      fs.writeFileSync(CONFIG.FILES.STATS_FILE, JSON.stringify(this.stats, null, 2));
    } catch (error) {
      this.logError('saveStats', error);
    }
  }

  // Save processed transactions
  saveProcessedTransactions() {
    try {
      const txs = Array.from(this.processedTxs);
      fs.writeFileSync(CONFIG.FILES.PROCESSED_TXS, JSON.stringify(txs, null, 2));
    } catch (error) {
      this.logError('saveProcessedTransactions', error);
    }
  }

  // Log errors to file
  logError(context, error) {
    const errorEntry = {
      timestamp: new Date().toISOString(),
      context,
      error: error.message,
      stack: error.stack
    };

    try {
      const logLine = JSON.stringify(errorEntry) + '\n';
      fs.appendFileSync(CONFIG.FILES.ERROR_LOG, logLine);
    } catch (writeError) {
      console.log(`⚠️ Could not write error to log: ${writeError.message}`);
    }
  }

  // Get current monitoring interval based on time
  getCurrentPollingInterval() {
    const hour = new Date().getHours();
    const isActiveHours = hour >= 8 && hour < 22; // 8 AM to 10 PM
    return isActiveHours ? CONFIG.SCHEDULE.ACTIVE_MONITORING : CONFIG.SCHEDULE.QUIET_MONITORING;
  }

  // Enhanced deposit logging
  logDeposit(txHash, from, amount, blockNumber) {
    const timestamp = new Date().toISOString();
    const amountBNB = this.web3.utils.fromWei(amount, 'ether');

    // Check minimum amount threshold
    if (parseFloat(amountBNB) < parseFloat(CONFIG.NOTIFICATIONS.MIN_AMOUNT_ALERT)) {
      return;
    }

    const logEntry = {
      timestamp,
      txHash,
      from,
      amount: amountBNB,
      amountWei: amount,
      blockNumber,
      currency: 'BNB',
      confirmations: 0 // Will be updated later
    };

    // Update statistics
    this.stats.totalDepositsFound++;
    this.stats.totalBNBReceived = this.web3.utils.toBN(this.stats.totalBNBReceived).add(this.web3.utils.toBN(amount)).toString();
    this.stats.lastDepositTime = timestamp;
    this.saveStats();

    // Console output
    if (CONFIG.NOTIFICATIONS.ENABLE_CONSOLE) {
      console.log('\n💰 NEW BNB DEPOSIT DETECTED 💰');
      console.log(`📅 Time: ${timestamp}`);
      console.log(`🔗 TX Hash: ${txHash}`);
      console.log(`👤 From: ${from}`);
      console.log(`💎 Amount: ${logEntry.amount} BNB`);
      console.log(`📦 Block: ${blockNumber}`);
      console.log(`📊 Total Deposits: ${this.stats.totalDepositsFound}`);
      console.log(`💎 Total BNB Received: ${this.web3.utils.fromWei(this.stats.totalBNBReceived, 'ether')} BNB`);
      console.log('─'.repeat(60));
    }

    // File logging
    if (CONFIG.NOTIFICATIONS.ENABLE_FILE_LOGGING) {
      try {
        const logLine = JSON.stringify(logEntry) + '\n';
        fs.appendFileSync(CONFIG.FILES.DEPOSITS_LOG, logLine);

        // Rotate log file if too large
        this.rotateLogFileIfNeeded();
      } catch (error) {
        this.logError('logDeposit', error);
      }
    }
  }

  // Rotate log file if it exceeds size limit
  rotateLogFileIfNeeded() {
    try {
      const stats = fs.statSync(CONFIG.FILES.DEPOSITS_LOG);
      if (stats.size > CONFIG.NOTIFICATIONS.MAX_LOG_SIZE) {
        const backupName = `${CONFIG.FILES.DEPOSITS_LOG}.${Date.now()}`;
        fs.renameSync(CONFIG.FILES.DEPOSITS_LOG, backupName);
        console.log(`📁 Rotated log file to: ${backupName}`);
      }
    } catch (error) {
      // File doesn't exist or other error, ignore
    }
  }

  // Process transaction with enhanced validation
  async processTransaction(txHash, blockNumber) {
    try {
      // Skip if already processed
      if (this.processedTxs.has(txHash)) {
        return;
      }

      const tx = await this.web3.eth.getTransaction(txHash);

      if (!tx) {
        return;
      }

      // Check if transaction is to our hot wallet
      if (tx.to && tx.to.toLowerCase() === CONFIG.HOT_WALLET_ADDRESS.toLowerCase()) {
        // Verify it's a BNB transfer (not a contract interaction)
        if (tx.value && tx.value !== '0') {
          // Check confirmations
          const currentBlock = await this.web3.eth.getBlockNumber();
          const confirmations = currentBlock - blockNumber;

          if (confirmations >= CONFIG.SCANNING.CONFIRMATION_BLOCKS) {
            this.logDeposit(txHash, tx.from, tx.value, blockNumber);
          }

          // Mark as processed regardless of confirmations
          this.processedTxs.add(txHash);
          this.saveProcessedTransactions();
        }
      }
    } catch (error) {
      this.logError('processTransaction', error);
    }
  }

  // Process block with parallel transaction processing
  async processBlock(blockNumber) {
    try {
      const block = await this.web3.eth.getBlock(blockNumber, true);

      if (!block || !block.transactions) {
        return;
      }

      console.log(`🔍 Scanning block ${blockNumber} (${block.transactions.length} transactions)`);

      // Process transactions in batches for better performance
      const batchSize = CONFIG.SCANNING.BATCH_SIZE;
      for (let i = 0; i < block.transactions.length; i += batchSize) {
        const batch = block.transactions.slice(i, i + batchSize);
        await Promise.allSettled(
          batch.map(tx => this.processTransaction(tx.hash, blockNumber))
        );
      }

      this.stats.totalBlocksScanned++;
      this.stats.totalTransactionsProcessed += block.transactions.length;
    } catch (error) {
      this.logError('processBlock', error);
    }
  }

  // Enhanced RPC switching with retry logic
  async switchRpcEndpoint() {
    this.stats.rpcSwitches++;
    this.saveStats();

    this.fallbackRpcIndex = (this.fallbackRpcIndex + 1) % CONFIG.RPC_ENDPOINTS.length;
    const newRpcUrl = CONFIG.RPC_ENDPOINTS[this.fallbackRpcIndex];

    console.log(`🔄 Switching to fallback RPC: ${newRpcUrl}`);

    try {
      this.web3 = new Web3(new Web3.providers.HttpProvider(newRpcUrl, {
        timeout: 15000,
        keepAlive: true,
        withCredentials: false
      }));

      // Test new connection
      await this.web3.eth.getBlockNumber();
      console.log(`✅ Successfully switched to fallback RPC`);
      return true;
    } catch (error) {
      console.log(`❌ Failed to switch to fallback RPC: ${error.message}`);
      return false;
    }
  }

  // Enhanced monitoring loop with scheduling
  async monitorLoop() {
    while (this.isRunning) {
      try {
        const pollingInterval = this.getCurrentPollingInterval();

        // Get current block number
        const latestBlock = await this.web3.eth.getBlockNumber();

        // Calculate range of blocks to scan
        const startBlock = this.currentBlock + 1;
        const endBlock = Math.min(latestBlock, startBlock + CONFIG.SCANNING.MAX_BLOCKS_PER_SCAN - 1);

        if (startBlock <= endBlock) {
          console.log(`\n📦 Scanning blocks ${startBlock} to ${endBlock} (latest: ${latestBlock})`);

          // Process each block in range
          for (let blockNum = startBlock; blockNum <= endBlock; blockNum++) {
            await this.processBlock(blockNum);
          }

          this.currentBlock = endBlock;
        } else {
          console.log(`⏳ Waiting for new blocks... (current: ${this.currentBlock}, latest: ${latestBlock})`);
        }

        // Wait before next scan
        await new Promise(resolve => setTimeout(resolve, pollingInterval));

      } catch (error) {
        this.stats.errors++;
        this.saveStats();

        console.log(`❌ Error in monitoring loop: ${error.message}`);

        // Try to switch RPC endpoint
        const switched = await this.switchRpcEndpoint();
        if (!switched) {
          console.log(`🔄 Waiting ${CONFIG.SCHEDULE.RETRY_DELAY}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, CONFIG.SCHEDULE.RETRY_DELAY));
        }
      }
    }
  }

  // Start monitoring with enhanced initialization
  async start() {
    try {
      console.log('🚀 Starting Enhanced BSC BNB Deposit Monitor...');
      console.log(`📊 Monitoring wallet: ${CONFIG.HOT_WALLET_ADDRESS}`);
      console.log(`⏱️ Active monitoring: ${CONFIG.SCHEDULE.ACTIVE_MONITORING}ms`);
      console.log(`⏱️ Quiet monitoring: ${CONFIG.SCHEDULE.QUIET_MONITORING}ms`);
      console.log(`🔒 Confirmations required: ${CONFIG.SCANNING.CONFIRMATION_BLOCKS}`);
      console.log(`💰 Min amount alert: ${CONFIG.NOTIFICATIONS.MIN_AMOUNT_ALERT} BNB`);
      console.log('─'.repeat(60));

      this.stats.startTime = new Date().toISOString();
      this.saveStats();

      await this.initializeWeb3();

      this.isRunning = true;

      // Handle graceful shutdown
      process.on('SIGINT', () => {
        console.log('\n🛑 Shutting down gracefully...');
        this.stop();
      });

      process.on('SIGTERM', () => {
        console.log('\n🛑 Shutting down gracefully...');
        this.stop();
      });

      await this.monitorLoop();

    } catch (error) {
      console.error(`💥 Fatal error: ${error.message}`);
      this.logError('start', error);
      process.exit(1);
    }
  }

  // Stop monitoring with cleanup
  stop() {
    this.isRunning = false;
    this.saveStats();
    console.log('✅ Monitor stopped');
    console.log(`📊 Final Statistics:`);
    console.log(`   - Total blocks scanned: ${this.stats.totalBlocksScanned}`);
    console.log(`   - Total transactions processed: ${this.stats.totalTransactionsProcessed}`);
    console.log(`   - Total deposits found: ${this.stats.totalDepositsFound}`);
    console.log(`   - Total BNB received: ${this.web3 ? this.web3.utils.fromWei(this.stats.totalBNBReceived, 'ether') : '0'} BNB`);
    console.log(`   - RPC switches: ${this.stats.rpcSwitches}`);
    console.log(`   - Errors: ${this.stats.errors}`);
    process.exit(0);
  }
}

// Utility function to validate wallet address
function isValidWalletAddress(address) {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

// Main execution
async function main() {
  // Validate wallet address
  if (!isValidWalletAddress(CONFIG.HOT_WALLET_ADDRESS)) {
    console.error('❌ Invalid wallet address. Please update CONFIG.HOT_WALLET_ADDRESS');
    process.exit(1);
  }

  const monitor = new EnhancedBSCDepositMonitor();
  await monitor.start();
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { EnhancedBSCDepositMonitor, CONFIG };
