# ⚡ QUICK COMMANDS REFERENCE

## 🎯 YOUR WALLET ADDRESS
```
0x78be456e78ffec3148be7b55580d91adc963e6affdf5a77672d31e44c0baa84c
```

---

## 📦 STEP 1: INSTALL APTOS CLI

### **Method: Manual Download (Easiest)**

1. **Download:**
   - Go to: https://github.com/aptos-labs/aptos-core/releases/latest
   - Download: `aptos-cli-windows-x86_64.zip`

2. **Extract:**
   - Extract to: `C:\Users\crisy\aptos-cli`

3. **Add to PATH (PowerShell as Admin):**
```powershell
$aptosPath = "C:\Users\crisy\aptos-cli"
$currentPath = [Environment]::GetEnvironmentVariable("Path", "User")
[Environment]::SetEnvironmentVariable("Path", "$currentPath;$aptosPath", "User")
```

4. **Restart PowerShell and verify:**
```powershell
aptos --version
```

---

## 💰 STEP 2: GET TEST APT TOKENS

### **Method 1: Petra Wallet Faucet**
1. Open Petra extension
2. Click Settings (⚙️)
3. Find "Faucet" option
4. Click "Get Test Tokens"

### **Method 2: Aptos Discord**
1. Join: https://discord.gg/aptoslabs
2. Go to #testnet-faucet
3. Run command:
```
/faucet address:0x78be456e78ffec3148be7b55580d91adc963e6affdf5a77672d31e44c0baa84c
```

### **Method 3: QuickNode Faucet**
- Visit: https://faucet.quicknode.com/aptos/testnet
- Enter your address
- Complete captcha
- Submit

---

## 🚀 STEP 3: DEPLOY CONTRACT

### **Run these commands in PowerShell:**

```powershell
# 1. Navigate to project
cd c:\Users\crisy\OneDrive\Escritorio\test4

# 2. Initialize Aptos (first time only)
aptos init

# When asked:
# - Network: testnet
# - Private key: Press Enter (generate new)

# 3. Check your balance
aptos account list --account 0x78be456e78ffec3148be7b55580d91adc963e6affdf5a77672d31e44c0baa84c

# 4. Go to move directory
cd move

# 5. Compile contract
aptos move compile

# 6. Publish contract
aptos move publish --named-addresses habit=0x78be456e78ffec3148be7b55580d91adc963e6affdf5a77672d31e44c0baa84c

# When asked "Do you want to submit...": Type 'yes'

# 7. Initialize contract
aptos move run --function-id 0x78be456e78ffec3148be7b55580d91adc963e6affdf5a77672d31e44c0baa84c::stake_match::initialize --assume-yes

# 8. Go back to root
cd ..

# 9. Create .env file
echo "VITE_MODULE_ADDRESS=0x78be456e78ffec3148be7b55580d91adc963e6affdf5a77672d31e44c0baa84c" > .env

# 10. Start dev server
npm run dev
```

---

## ✅ VERIFICATION

```powershell
# Check if CLI is installed
aptos --version

# Check balance
aptos account list --account 0x78be456e78ffec3148be7b55580d91adc963e6affdf5a77672d31e44c0baa84c

# Check if contract deployed (after publishing)
aptos account list --query modules --account 0x78be456e78ffec3148be7b55580d91adc963e6affdf5a77672d31e44c0baa84c
```

---

## 🚨 IF APTOS COMMAND NOT FOUND

**Option 1: Run from full path**
```powershell
C:\Users\crisy\aptos-cli\aptos.exe --version
```

**Option 2: Add to PATH manually**
1. Press `Windows + R`
2. Type: `sysdm.cpl`
3. Advanced → Environment Variables
4. Edit Path → New
5. Add: `C:\Users\crisy\aptos-cli`
6. OK → Restart PowerShell

---

## 📊 EXPECTED OUTPUTS

### **After compile:**
```
BUILDING habit
{
  "Result": [
    "78be456e78ffec3148be7b55580d91adc963e6affdf5a77672d31e44c0baa84c::stake_match"
  ]
}
```

### **After publish:**
```json
{
  "Result": {
    "transaction_hash": "0x...",
    "success": true,
    "vm_status": "Executed successfully"
  }
}
```

### **After initialize:**
```json
{
  "Result": {
    "transaction_hash": "0x...",
    "success": true
  }
}
```

---

## 🎯 QUICK TEST

```powershell
# After deployment, test immediately:

# 1. Start server
npm run dev

# 2. Open browser: http://localhost:3000

# 3. Connect Petra wallet

# 4. Go to Dashboard

# 5. Swipe right on a user

# 6. Check Petra popup shows: "0.1 APT"

# 7. Approve transaction

# 8. Success! 🎉
```

---

## 📞 NEED HELP?

**CLI not working?**
- See `COMPLETE_SETUP_GUIDE.md` for detailed troubleshooting

**Can't get tokens?**
- Try all 3 methods in STEP 2
- Ask in Discord #testnet-support

**Deployment fails?**
- Check balance: `aptos account list --account YOUR_ADDRESS`
- Make sure you have ≥ 1 APT
- Check Move.toml has correct address

---

**Follow these steps in order and you'll be deployed in 15 minutes!** 🚀
