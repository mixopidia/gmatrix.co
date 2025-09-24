#!/bin/bash

# BSC Deposit Monitor Startup Script
# This script starts the BSC BNB deposit monitoring system

echo "🚀 Starting BSC BNB Deposit Monitor..."
echo "======================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 14.0.0 or higher."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 14 ]; then
    echo "❌ Node.js version 14.0.0 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found. Please run this script from the project directory."
    exit 1
fi

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies."
        exit 1
    fi
fi

# Check if wallet address is configured
if grep -q "0xYourWalletAddressHere" bsc-deposit-monitor-enhanced.js; then
    echo "⚠️  WARNING: Please configure your wallet address in bsc-deposit-monitor-enhanced.js"
    echo "   Replace '0xYourWalletAddressHere' with your actual BSC wallet address."
    echo ""
    read -p "Do you want to continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Setup cancelled."
        exit 1
    fi
fi

# Create logs directory if it doesn't exist
mkdir -p logs

# Start the monitor
echo "🔍 Starting enhanced BSC deposit monitor..."
echo "📊 Monitor will run continuously. Press Ctrl+C to stop."
echo "📁 Logs will be saved to:"
echo "   - deposits.log (deposit records)"
echo "   - errors.log (error logs)"
echo "   - monitoring_stats.json (statistics)"
echo ""

# Run the monitor
node bsc-deposit-monitor-enhanced.js
