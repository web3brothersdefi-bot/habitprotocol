# Habit Platform - Aptos Migration Installation (Windows)

Write-Host "🚀 Habit Platform - Aptos Migration Installation" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Clean everything
Write-Host "📦 Step 1/4: Cleaning node_modules and lock files..." -ForegroundColor Yellow
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item package-lock.json -ErrorAction SilentlyContinue

# Step 2: Install with compatible versions
Write-Host "📦 Step 2/4: Installing dependencies (this may take a minute)..." -ForegroundColor Yellow
npm install --legacy-peer-deps

# Step 3: Verify installation
Write-Host "✅ Step 3/4: Verifying installation..." -ForegroundColor Green
npm list @aptos-labs/ts-sdk

# Step 4: Info
Write-Host "✅ Step 4/4: Installation complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Cyan
Write-Host "1. Install Aptos CLI: https://aptos.dev/cli-tools/aptos-cli-tool/install-aptos-cli"
Write-Host "2. Install Petra Wallet: https://petra.app"
Write-Host "3. Deploy Move contract: cd move; aptos move publish"
Write-Host "4. Update .env with MODULE_ADDRESS"
Write-Host "5. Run: npm run dev"
Write-Host ""
Write-Host "📖 See APTOS_MIGRATION_GUIDE.md for complete instructions" -ForegroundColor Cyan
Write-Host ""
