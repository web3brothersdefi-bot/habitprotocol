# 🚀 COMPLETE SETUP & DEPLOYMENT GUIDE (WINDOWS)

## ⚠️ ISSUES IDENTIFIED
1. ❌ Aptos CLI not installed on Windows
2. ❌ Aptos Labs faucet website not working

## ✅ SOLUTIONS PROVIDED
1. ✅ Manual Aptos CLI installation (3 methods)
2. ✅ Alternative faucet methods (4 options)

---

# 📦 PART 1: INSTALL APTOS CLI (Choose One Method)

## 🔥 METHOD 1: Direct Download (EASIEST)

### **Step 1: Download Aptos CLI**

Open your browser and download:
```
https://github.com/aptos-labs/aptos-core/releases/latest/download/aptos-cli-windows-x86_64.zip
```

### **Step 2: Extract the ZIP**
1. Go to your Downloads folder
2. Right-click `aptos-cli-windows-x86_64.zip`
3. Select "Extract All..."
4. Extract to: `C:\Users\crisy\aptos-cli`

### **Step 3: Add to PATH**

**Option A: Using PowerShell (Run as Administrator)**
```powershell
$aptosPath = "C:\Users\crisy\aptos-cli"
$currentPath = [Environment]::GetEnvironmentVariable("Path", "User")
[Environment]::SetEnvironmentVariable("Path", "$currentPath;$aptosPath", "User")
```

**Option B: Using GUI**
1. Press `Windows + R`
2. Type: `sysdm.cpl` and press Enter
3. Click "Advanced" tab
4. Click "Environment Variables"
5. Under "User variables", select "Path"
6. Click "Edit"
7. Click "New"
8. Add: `C:\Users\crisy\aptos-cli`
9. Click OK on all windows

### **Step 4: Verify Installation**
1. **Close all PowerShell windows**
2. **Open NEW PowerShell**
3. Run:
```powershell
aptos --version
```

**Expected output:**
```
aptos 2.x.x
```

✅ **If you see version number, CLI is installed!**

---

## 🔧 METHOD 2: Using PowerShell Script (Semi-Automatic)

### **Step 1: Open PowerShell as Administrator**
1. Press `Windows + X`
2. Select "Windows PowerShell (Admin)"

### **Step 2: Run Installation Commands**

```powershell
# Create directory
New-Item -ItemType Directory -Force -Path "$env:LOCALAPPDATA\aptos"

# Download
$url = "https://github.com/aptos-labs/aptos-core/releases/latest/download/aptos-cli-windows-x86_64.zip"
$output = "$env:TEMP\aptos-cli.zip"
Invoke-WebRequest -Uri $url -OutFile $output

# Extract
Expand-Archive -Path $output -DestinationPath "$env:LOCALAPPDATA\aptos" -Force

# Add to PATH
$aptosPath = "$env:LOCALAPPDATA\aptos"
$currentPath = [Environment]::GetEnvironmentVariable("Path", "User")
[Environment]::SetEnvironmentVariable("Path", "$currentPath;$aptosPath", "User")

# Clean up
Remove-Item $output

Write-Host "Installation complete! Close and reopen PowerShell." -ForegroundColor Green
```

### **Step 3: Restart PowerShell and Verify**
```powershell
aptos --version
```

---

## 🐳 METHOD 3: Using Chocolatey (If you have it)

```powershell
choco install aptos-cli
```

---

# 💰 PART 2: GET TEST APT TOKENS (Alternative Methods)

## ❌ Issue: Aptos Labs Faucet Not Working

## ✅ ALTERNATIVE METHOD 1: Petra Wallet Built-in Faucet

### **Steps:**
1. Open Petra Wallet extension
2. Make sure you're on **Testnet** network
3. Click the "⚙️" icon (Settings)
4. Look for "Faucet" option
5. Click "Fund Account" or "Get Test Tokens"
6. Wait 10-30 seconds
7. Check your balance

**Amount:** Usually 1 APT

---

## ✅ ALTERNATIVE METHOD 2: Aptos Discord Bot

### **Steps:**

1. **Join Aptos Discord:**
```
https://discord.gg/aptoslabs
```

2. **Navigate to faucet channel:**
- Look for `#testnet-faucet` or `#faucet`

3. **Send command:**
```
/faucet address:YOUR_WALLET_ADDRESS
```

**Example:**
```
/faucet address:0x78be456e78ffec3148be7b55580d91adc963e6affdf5a77672d31e44c0baa84c
```

4. **Wait for bot response**
- Bot will send transaction
- Check wallet in 10-30 seconds

**Amount:** 1 APT

---

## ✅ ALTERNATIVE METHOD 3: Community Faucets

### **Option A: Aptos Faucet Portal**
```
https://faucet.testnet.aptoslabs.com/
```

### **Option B: QuickNode Faucet**
```
https://faucet.quicknode.com/aptos/testnet
```

### **Option C: Pontem Wallet Faucet**
If you have Pontem wallet:
- Built-in faucet option
- Usually faster than website

---

## ✅ ALTERNATIVE METHOD 4: Ask for APT (If all else fails)

### **Aptos Discord #testnet-support:**
Post:
```
Need testnet APT for development testing.
Wallet: 0x78be456e78ffec3148be7b55580d91adc963e6affdf5a77672d31e44c0baa84c
Faucet website is down. Can someone help?
```

Community members often help!

---

# 🚀 PART 3: COMPILE & DEPLOY CONTRACT

## ✅ Once you have APT tokens and Aptos CLI installed:

### **Step 1: Initialize Aptos Account**

```powershell
cd c:\Users\crisy\OneDrive\Escritorio\test4
aptos init
```

**You'll be asked:**
```
Choose network from [devnet, testnet, mainnet, local, custom | defaults to devnet]
```
**Type:** `testnet`

```
Enter your private key as a hex literal (0x...) [Current: None | No input: Generate new key (or keep one if present)]
```
**Press Enter** to generate new key

**Output:**
```
Aptos CLI is now set up for account 0x78be456e78ffec3148be7b55580d91adc963e6affdf5a77672d31e44c0baa84c
```

⚠️ **IMPORTANT:** This creates `.aptos/config.yaml` with your keys!

---

### **Step 2: Verify Your Balance**

```powershell
aptos account list --account 0x78be456e78ffec3148be7b55580d91adc963e6affdf5a77672d31e44c0baa84c
```

**Replace with your actual address!**

**Expected output:**
```json
{
  "Result": [
    {
      "coin": {
        "value": "100000000"
      }
    }
  ]
}
```

✅ **100000000 = 1 APT**

---

### **Step 3: Update Move.toml**

File is already updated at:
```
c:\Users\crisy\OneDrive\Escritorio\test4\move\Move.toml
```

Current address: `0x78be456e78ffec3148be7b55580d91adc963e6affdf5a77672d31e44c0baa84c`

✅ **No change needed if this is your wallet address**

---

### **Step 4: Compile Contract**

```powershell
cd c:\Users\crisy\OneDrive\Escritorio\test4\move
aptos move compile
```

**Expected output:**
```
Compiling, may take a little while to download git dependencies...
INCLUDING DEPENDENCY AptosFramework
INCLUDING DEPENDENCY AptosStdlib
INCLUDING DEPENDENCY MoveStdlib
BUILDING habit
{
  "Result": [
    "78be456e78ffec3148be7b55580d91adc963e6affdf5a77672d31e44c0baa84c::stake_match"
  ]
}
```

✅ **Success!**

---

### **Step 5: Publish Contract**

```powershell
aptos move publish --named-addresses habit=0x78be456e78ffec3148be7b55580d91adc963e6affdf5a77672d31e44c0baa84c
```

**Replace with your wallet address!**

**You'll be asked:**
```
Do you want to submit a transaction for a range of [xxxxx - xxxxx] Octas at a gas unit price of 100 Octas? [yes/no]
```
**Type:** `yes`

**Expected output:**
```json
{
  "Result": {
    "transaction_hash": "0xabc123def456...",
    "gas_used": 1234,
    "success": true,
    "vm_status": "Executed successfully"
  }
}
```

✅ **Copy the transaction_hash!**

**Verify on Explorer:**
```
https://explorer.aptoslabs.com/txn/YOUR_TRANSACTION_HASH?network=testnet
```

---

### **Step 6: Initialize Contract**

```powershell
aptos move run --function-id 0x78be456e78ffec3148be7b55580d91adc963e6affdf5a77672d31e44c0baa84c::stake_match::initialize --assume-yes
```

**Replace with your address!**

**Expected output:**
```json
{
  "Result": {
    "transaction_hash": "0xdef789ghi012...",
    "success": true,
    "vm_status": "Executed successfully"
  }
}
```

✅ **Contract initialized!**

---

### **Step 7: Update Frontend .env**

```powershell
cd c:\Users\crisy\OneDrive\Escritorio\test4
```

Create `.env` file:
```powershell
@"
VITE_MODULE_ADDRESS=0x78be456e78ffec3148be7b55580d91adc963e6affdf5a77672d31e44c0baa84c
"@ | Out-File -FilePath .env -Encoding UTF8
```

**Replace with your address!**

---

### **Step 8: Start Dev Server**

```powershell
npm run dev
```

**Expected output:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

✅ **Open:** http://localhost:3000

---

# ✅ VERIFICATION CHECKLIST

## **Aptos CLI:**
- [ ] Downloaded and extracted
- [ ] Added to PATH
- [ ] `aptos --version` works
- [ ] PowerShell restarted

## **Test Tokens:**
- [ ] Got 1 APT from faucet (Discord/Petra/Community)
- [ ] Verified balance in Petra wallet
- [ ] Balance shows in `aptos account list`

## **Contract:**
- [ ] Move.toml has correct address
- [ ] Compiled successfully
- [ ] Published successfully
- [ ] Initialized successfully
- [ ] Verified on explorer

## **Frontend:**
- [ ] .env file created
- [ ] MODULE_ADDRESS set correctly
- [ ] npm run dev works
- [ ] Can see Dashboard

## **Testing:**
- [ ] Dashboard loads
- [ ] Can swipe right
- [ ] Petra shows "0.1 APT" transaction
- [ ] Transaction succeeds
- [ ] Balance decreased by ~0.101 APT

---

# 🚨 TROUBLESHOOTING

## **Issue: "aptos: command not found"**

**Solution 1:** Restart PowerShell
```powershell
# Close all PowerShell windows
# Open new PowerShell
aptos --version
```

**Solution 2:** Check PATH manually
```powershell
$env:Path
```

Should contain: `C:\Users\crisy\aptos-cli` or similar

**Solution 3:** Run from full path
```powershell
C:\Users\crisy\aptos-cli\aptos.exe --version
```

---

## **Issue: "Cannot get test APT tokens"**

**Try in this order:**
1. ✅ Petra Wallet built-in faucet
2. ✅ Aptos Discord bot
3. ✅ QuickNode faucet
4. ✅ Ask in Discord #testnet-support

**Last resort:** I can help you find alternative testnet or use devnet

---

## **Issue: "Module already exists"**

**Solution:** Upgrade module
```powershell
aptos move publish --upgrade-policy compatible --named-addresses habit=YOUR_ADDRESS
```

---

## **Issue: "Insufficient gas"**

**Problem:** Not enough APT

**Solution:** Get more APT from faucet (wait 24h or try different method)

---

# 📝 QUICK COMMAND REFERENCE

## **After CLI is installed:**

```powershell
# Navigate to project
cd c:\Users\crisy\OneDrive\Escritorio\test4

# Initialize (first time only)
aptos init

# Check balance
aptos account list --account YOUR_ADDRESS

# Compile
cd move
aptos move compile

# Publish
aptos move publish --named-addresses habit=YOUR_ADDRESS

# Initialize contract
aptos move run --function-id YOUR_ADDRESS::stake_match::initialize --assume-yes

# Update .env
cd ..
echo "VITE_MODULE_ADDRESS=YOUR_ADDRESS" > .env

# Start dev server
npm run dev
```

---

# 🎉 SUCCESS CRITERIA

**You're done when:**
- ✅ Aptos CLI installed (`aptos --version` works)
- ✅ Have ≥ 1 APT in wallet
- ✅ Contract deployed successfully
- ✅ Contract initialized
- ✅ Frontend shows Dashboard
- ✅ Can stake 0.1 APT successfully

---

# 🔗 HELPFUL LINKS

- **Aptos CLI Releases:** https://github.com/aptos-labs/aptos-core/releases
- **Aptos Discord:** https://discord.gg/aptoslabs
- **Explorer (Testnet):** https://explorer.aptoslabs.com/?network=testnet
- **QuickNode Faucet:** https://faucet.quicknode.com/aptos/testnet
- **Aptos Docs:** https://aptos.dev/

---

**Start with PART 1 (Install CLI), then PART 2 (Get tokens), then PART 3 (Deploy)!** 🚀
