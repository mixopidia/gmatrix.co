@echo off
chcp 65001 >nul
echo 🚀 Starting BSC BNB Deposit Monitor...
echo ======================================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 14.0.0 or higher.
    pause
    exit /b 1
)

echo ✅ Node.js version:
node --version

REM Check if package.json exists
if not exist "package.json" (
    echo ❌ package.json not found. Please run this script from the project directory.
    pause
    exit /b 1
)

REM Check if dependencies are installed
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Failed to install dependencies.
        pause
        exit /b 1
    )
)

REM Check if wallet address is configured
findstr "0xYourWalletAddressHere" bsc-deposit-monitor-enhanced.js >nul
if %errorlevel% equ 0 (
    echo ⚠️  WARNING: Please configure your wallet address in bsc-deposit-monitor-enhanced.js
    echo    Replace '0xYourWalletAddressHere' with your actual BSC wallet address.
    echo.
    set /p continue="Do you want to continue anyway? (y/N): "
    if /i not "%continue%"=="y" (
        echo ❌ Setup cancelled.
        pause
        exit /b 1
    )
)

REM Create logs directory if it doesn't exist
if not exist "logs" mkdir logs

REM Start the monitor
echo 🔍 Starting enhanced BSC deposit monitor...
echo 📊 Monitor will run continuously. Press Ctrl+C to stop.
echo 📁 Logs will be saved to:
echo    - deposits.log (deposit records)
echo    - errors.log (error logs)
echo    - monitoring_stats.json (statistics)
echo.

REM Run the monitor
node bsc-deposit-monitor-enhanced.js

pause
