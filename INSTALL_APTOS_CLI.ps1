# ==================================================
# APTOS CLI INSTALLATION SCRIPT FOR WINDOWS
# ==================================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Installing Aptos CLI for Windows" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Download Aptos CLI
Write-Host "Step 1: Downloading Aptos CLI..." -ForegroundColor Yellow
$aptosUrl = "https://github.com/aptos-labs/aptos-core/releases/latest/download/aptos-cli-windows-x86_64.zip"
$downloadPath = "$env:TEMP\aptos-cli.zip"
$extractPath = "$env:LOCALAPPDATA\aptos"

# Create directory if it doesn't exist
New-Item -ItemType Directory -Force -Path $extractPath | Out-Null

# Download
try {
    Invoke-WebRequest -Uri $aptosUrl -OutFile $downloadPath -UseBasicParsing
    Write-Host "Downloaded successfully!" -ForegroundColor Green
} catch {
    Write-Host "Failed to download. Error: $_" -ForegroundColor Red
    exit 1
}

# Extract
Write-Host ""
Write-Host "Step 2: Extracting..." -ForegroundColor Yellow
try {
    Expand-Archive -Path $downloadPath -DestinationPath $extractPath -Force
    Write-Host "Extracted successfully!" -ForegroundColor Green
} catch {
    Write-Host "Failed to extract. Error: $_" -ForegroundColor Red
    exit 1
}

# Add to PATH
Write-Host ""
Write-Host "Step 3: Adding to PATH..." -ForegroundColor Yellow
$currentPath = [Environment]::GetEnvironmentVariable("Path", "User")
if ($currentPath -notlike "*$extractPath*") {
    [Environment]::SetEnvironmentVariable(
        "Path",
        "$currentPath;$extractPath",
        "User"
    )
    Write-Host "Added to PATH successfully!" -ForegroundColor Green
    Write-Host "IMPORTANT: Close and reopen PowerShell for PATH changes to take effect!" -ForegroundColor Yellow
} else {
    Write-Host "Already in PATH!" -ForegroundColor Green
}

# Clean up
Remove-Item $downloadPath -Force

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Installation Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Close this PowerShell window"
Write-Host "2. Open a NEW PowerShell window"
Write-Host "3. Run: aptos --version"
Write-Host "4. If it works, continue with deployment!"
Write-Host ""
