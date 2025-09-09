const Web3 = require('web3');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  // BSC Mainnet RPC endpoints (public)
  RPC_ENDPOINTS: [
    'https://bsc-dataseed1.binance.org/',
    'https://bsc-dataseed2.binance.org/',
    'https://bsc-dataseed3.binance.org/',
    'https://bsc-dataseed4.binance.org/',
    'https://bsc.nodereal.io',
    'https://rpc-bsc.bnb48.club'
  ],
  // Your hot wallet address to monitor
  HOT_WALLET_ADDRESS: '0xYourWalletAddressHere',
  // Block polling interval in milliseconds (5 seconds)
  POLL_INTERVAL: 5000,
  // Maximum blocks to scan per iteration (to avoid rate limits)
  MAX_BLOCKS_PER_SCAN: 10,
  // File to store processed transaction hashes
  PROCESSED_TXS_FILE: 'processed_transactions.json',
  // Log file for deposits
  LOG_FILE: 'deposits.log'
};

class BSCDepositMonitor {
  constructor() {
    this.web3 = null;
    this.currentBlock = 0;
    this.processedTxs = new Set();
    this.isRunning = false;
    this.fallbackRpcIndex = 0;

    // Load previously processed transactions
    this.loadProcessedTransactions();
  }

  // Initialize Web3 connection with fallback RPC endpoints
  async initializeWeb3() {
    for (let i = 0; i < CONFIG.RPC_ENDPOINTS.length; i++) {
      try {
        const rpcUrl = CONFIG.RPC_ENDPOINTS[i];
        console.log(`🔄 Connecting to BSC RPC: ${rpcUrl}`);

        this.web3 = new Web3(new Web3.providers.HttpProvider(rpcUrl, {
          timeout: 10000, // 10 second timeout
          keepAlive: true
        }));

        // Test connection
        const blockNumber = await this.web3.eth.getBlockNumber();
        console.log(`✅ Connected to BSC Mainnet. Current block: ${blockNumber}`);

        this.currentBlock = blockNumber;
        this.fallbackRpcIndex = i;
        return true;
      } catch (error) {
        console.log(`❌ Failed to connect to ${rpcUrl}: ${error.message}`);
        continue;
      }
    }

    throw new Error('Failed to connect to any BSC RPC endpoint');
  }

  // Load previously processed transaction hashes from file
  loadProcessedTransactions() {
    try {
      if (fs.existsSync(CONFIG.PROCESSED_TXS_FILE)) {
        const data = fs.readFileSync(CONFIG.PROCESSED_TXS_FILE, 'utf8');
        const txs = JSON.parse(data);
        this.processedTxs = new Set(txs);
        console.log(`📁 Loaded ${this.processedTxs.size} previously processed transactions`);
      }
    } catch (error) {
      console.log(`⚠️ Could not load processed transactions: ${error.message}`);
    }
  }

  // Save processed transaction hashes to file
  saveProcessedTransactions() {
    try {
      const txs = Array.from(this.processedTxs);
      fs.writeFileSync(CONFIG.PROCESSED_TXS_FILE, JSON.stringify(txs, null, 2));
    } catch (error) {
      console.log(`⚠️ Could not save processed transactions: ${error.message}`);
    }
  }

  // Log deposit information
  logDeposit(txHash, from, amount, blockNumber) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      txHash,
      from,
      amount: this.web3.utils.fromWei(amount, 'ether'),
      amountWei: amount,
      blockNumber,
      currency: 'BNB'
    };

    // Console output
    console.log('\n💰 NEW BNB DEPOSIT DETECTED 💰');
    console.log(`📅 Time: ${timestamp}`);
    console.log(`🔗 TX Hash: ${txHash}`);
    console.log(`👤 From: ${from}`);
    console.log(`💎 Amount: ${logEntry.amount} BNB`);
    console.log(`📦 Block: ${blockNumber}`);
    console.log('─'.repeat(60));

    // File logging
    try {
      const logLine = JSON.stringify(logEntry) + '\n';
      fs.appendFileSync(CONFIG.LOG_FILE, logLine);
    } catch (error) {
      console.log(`⚠️ Could not write to log file: ${error.message}`);
    }
  }

  // Process a single transaction
  async processTransaction(txHash, blockNumber) {
    try {
      // Skip if already processed
      if (this.processedTxs.has(txHash)) {
        return;
      }

      const tx = await this.web3.eth.getTransaction(txHash);

      if (!tx) {
        console.log(`⚠️ Transaction not found: ${txHash}`);
        return;
      }

      // Check if transaction is to our hot wallet
      if (tx.to && tx.to.toLowerCase() === CONFIG.HOT_WALLET_ADDRESS.toLowerCase()) {
        // Verify it's a BNB transfer (not a contract interaction)
        if (tx.value && tx.value !== '0') {
          this.logDeposit(txHash, tx.from, tx.value, blockNumber);

          // Mark as processed
          this.processedTxs.add(txHash);
          this.saveProcessedTransactions();
        }
      }
    } catch (error) {
      console.log(`⚠️ Error processing transaction ${txHash}: ${error.message}`);
    }
  }

  // Process a block and check for deposits
  async processBlock(blockNumber) {
    try {
      const block = await this.web3.eth.getBlock(blockNumber, true);

      if (!block || !block.transactions) {
        return;
      }

      console.log(`🔍 Scanning block ${blockNumber} (${block.transactions.length} transactions)`);

      // Process each transaction in the block
      for (const tx of block.transactions) {
        await this.processTransaction(tx.hash, blockNumber);
      }
    } catch (error) {
      console.log(`⚠️ Error processing block ${blockNumber}: ${error.message}`);
    }
  }

  // Switch to fallback RPC endpoint
  async switchRpcEndpoint() {
    this.fallbackRpcIndex = (this.fallbackRpcIndex + 1) % CONFIG.RPC_ENDPOINTS.length;
    const newRpcUrl = CONFIG.RPC_ENDPOINTS[this.fallbackRpcIndex];

    console.log(`🔄 Switching to fallback RPC: ${newRpcUrl}`);

    try {
      this.web3 = new Web3(new Web3.providers.HttpProvider(newRpcUrl, {
        timeout: 10000,
        keepAlive: true
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

  // Main monitoring loop
  async monitorLoop() {
    while (this.isRunning) {
      try {
        // Get current block number
        const latestBlock = await this.web3.eth.getBlockNumber();

        // Calculate range of blocks to scan
        const startBlock = this.currentBlock + 1;
        const endBlock = Math.min(latestBlock, startBlock + CONFIG.MAX_BLOCKS_PER_SCAN - 1);

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
        await new Promise(resolve => setTimeout(resolve, CONFIG.POLL_INTERVAL));

      } catch (error) {
        console.log(`❌ Error in monitoring loop: ${error.message}`);

        // Try to switch RPC endpoint
        const switched = await this.switchRpcEndpoint();
        if (!switched) {
          console.log(`🔄 Waiting 30 seconds before retry...`);
          await new Promise(resolve => setTimeout(resolve, 30000));
        }
      }
    }
  }

  // Start monitoring
  async start() {
    try {
      console.log('🚀 Starting BSC BNB Deposit Monitor...');
      console.log(`📊 Monitoring wallet: ${CONFIG.HOT_WALLET_ADDRESS}`);
      console.log(`⏱️ Polling interval: ${CONFIG.POLL_INTERVAL}ms`);
      console.log('─'.repeat(60));

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
      process.exit(1);
    }
  }

  // Stop monitoring
  stop() {
    this.isRunning = false;
    console.log('✅ Monitor stopped');
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

  const monitor = new BSCDepositMonitor();
  await monitor.start();
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { BSCDepositMonitor, CONFIG };
