# ===================================================
# DEPLOY UPDATED CONTRACT (0.1 APT)
# ===================================================

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Deploying Updated Contract (0.1 APT)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Paths
$aptosExe = "C:\Users\Acer\.aptoscli\bin\aptos.exe"
$moveDir = "c:\Users\crisy\OneDrive\Escritorio\test4\move"
$projectDir = "c:\Users\crisy\OneDrive\Escritorio\test4"
$contractAddress = "0x78be456e78ffec3148be7b55580d91adc963e6affdf5a77672d31e44c0baa84c"

# Step 1: Check balance
Write-Host "Step 1: Checking APT balance..." -ForegroundColor Yellow
$balanceOutput = & $aptosExe account list --query balance 2>&1 | Out-String
Write-Host $balanceOutput -ForegroundColor Green

# Step 2: Compile
Write-Host ""
Write-Host "Step 2: Compiling contract..." -ForegroundColor Yellow
Set-Location $moveDir
$compileOutput = & $aptosExe move compile 2>&1 | Out-String
Write-Host $compileOutput

if ($LASTEXITCODE -ne 0) {
    Write-Host "Compilation failed!" -ForegroundColor Red
    exit 1
}

Write-Host "Compilation successful!" -ForegroundColor Green

# Step 3: Publish with proper gas settings
Write-Host ""
Write-Host "Step 3: Publishing contract..." -ForegroundColor Yellow
Write-Host "This will prompt you to approve the transaction." -ForegroundColor Cyan
Write-Host ""

# Use proper gas parameters
$publishOutput = & $aptosExe move publish `
    --named-addresses "habit=$contractAddress" `
    --gas-unit-price 100 `
    --max-gas 200000 `
    2>&1 | Out-String

Write-Host $publishOutput

if ($publishOutput -match "Success|success") {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "Contract Published Successfully!" -ForegroundColor Green  
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    
    # Step 4: Initialize
    Write-Host "Step 4: Initializing contract..." -ForegroundColor Yellow
    Set-Location $projectDir
    
    $initOutput = & $aptosExe move run `
        --function-id "${contractAddress}::stake_match::initialize" `
        --args "address:$contractAddress" `
        2>&1 | Out-String
    
    Write-Host $initOutput
    
    if ($initOutput -match "Success|success") {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "Contract Initialized Successfully!" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host ""
        
        # Step 5: Create .env file
        Write-Host "Step 5: Creating .env file..." -ForegroundColor Yellow
        $envContent = "VITE_MODULE_ADDRESS=$contractAddress"
        $envContent | Out-File -FilePath "$projectDir\.env" -Encoding UTF8 -NoNewline
        Write-Host ".env file created!" -ForegroundColor Green
        
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host "DEPLOYMENT COMPLETE!" -ForegroundColor Cyan
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Yellow
        Write-Host "1. npm run dev"
        Write-Host "2. Go to http://localhost:3000/dashboard"
        Write-Host "3. Swipe right to test 0.1 APT staking!"
        Write-Host ""
    } else {
        Write-Host "Initialization failed. Try manually:" -ForegroundColor Red
        Write-Host "$aptosExe move run --function-id ${contractAddress}::stake_match::initialize --args address:$contractAddress"
    }
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "Publication Failed!" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Error output:" -ForegroundColor Yellow
    Write-Host $publishOutput
    Write-Host ""
    Write-Host "Possible solutions:" -ForegroundColor Cyan
    Write-Host "1. Get more APT from faucet (need ~0.1 APT for gas)"
    Write-Host "2. Try manual publish command:"
    Write-Host "   $aptosExe move publish --named-addresses habit=$contractAddress"
}
