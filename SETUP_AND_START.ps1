# ================================================================
# HABIT PLATFORM - SETUP AND START (BASE SEPOLIA)
# Run this script to install dependencies and start your dApp
# ================================================================

Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "  HABIT PLATFORM - BASE SEPOLIA SETUP" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

# Get current directory
$PROJECT_ROOT = $PSScriptRoot

Write-Host "[1/3] Installing dependencies..." -ForegroundColor Green
Write-Host "  This may take 2-3 minutes..." -ForegroundColor Gray
Write-Host ""

npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Installation failed!" -ForegroundColor Red
    Write-Host "  Try manually: npm install" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "✅ Dependencies installed successfully!" -ForegroundColor Green
Write-Host ""

Write-Host "[2/3] Checking configuration..." -ForegroundColor Green

# Check if contract address is set
$envContent = Get-Content ".env" -Raw
if ($envContent -match "0x20E7979abDdE55F098a4Ec77edF2079685278F27") {
    Write-Host "  ✅ Contract address: 0x20E7979abDdE55F098a4Ec77edF2079685278F27" -ForegroundColor Green
} else {
    Write-Host "  ⚠️ Contract address not found in .env" -ForegroundColor Yellow
}

Write-Host "  ✅ Network: Base Sepolia (Chain ID: 84532)" -ForegroundColor Green
Write-Host "  ✅ USDC: 0x036CbD53842c5426634e7929541eC2318f3dCF7e" -ForegroundColor Green
Write-Host ""

Write-Host "[3/3] Starting development server..." -ForegroundColor Green
Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "  YOUR DAPP IS STARTING!" -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "📝 BEFORE YOU TEST:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Open MetaMask" -ForegroundColor White
Write-Host "   - Switch to 'Base Sepolia' network" -ForegroundColor Gray
Write-Host "   - If not listed, add it:" -ForegroundColor Gray
Write-Host "     Network: Base Sepolia" -ForegroundColor Gray
Write-Host "     RPC: https://sepolia.base.org" -ForegroundColor Gray
Write-Host "     Chain ID: 84532" -ForegroundColor Gray
Write-Host ""

Write-Host "2. Get Test Tokens" -ForegroundColor White
Write-Host "   - ETH: https://www.coinbase.com/faucets" -ForegroundColor Gray
Write-Host "   - USDC: https://faucet.circle.com" -ForegroundColor Gray
Write-Host ""

Write-Host "3. Add USDC to MetaMask" -ForegroundColor White
Write-Host "   - Import Token → 0x036CbD53842c5426634e7929541eC2318f3dCF7e" -ForegroundColor Gray
Write-Host ""

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "  OPENING BROWSER..." -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

# Start dev server
npm run dev
