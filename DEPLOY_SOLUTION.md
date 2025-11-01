# 🚀 DEPLOY UPDATED CONTRACT - COMPLETE SOLUTION

## ❌ **CURRENT ISSUE**

**Error:** `INSUFFICIENT_BALANCE_FOR_TRANSACTION_FEE`  
**Your Balance:** 0.996 APT  
**Needed:** ~0.1-0.2 APT for contract deployment gas

---

## 💰 **SOLUTION 1: Get More Test APT (RECOMMENDED)**

### **Method A: Petra Wallet Built-in Faucet**
1. Open Petra Wallet extension
2. Make sure on **Testnet**
3. Click Settings (⚙️)
4. Find "Faucet" option
5. Click "Get Test Tokens"
6. Wait 10 seconds → **Get 1 APT** ✅

### **Method B: Aptos Discord Faucet**
1. Join: https://discord.gg/aptoslabs
2. Go to `#testnet-faucet` channel
3. Send command:
```
/faucet address:0x78be456e78ffec3148be7b55580d91adc963e6affdf5a77672d31e44c0baa84c
```
4. Wait for bot → **Get 1 APT** ✅

### **Method C: Alternative Faucets**
- QuickNode: https://faucet.quicknode.com/aptos/testnet
- Community faucets (search "Aptos testnet faucet")

---

## 🚀 **SOLUTION 2: Deploy with Lower Gas (Try First)**

Since you have 0.996 APT, let's try with minimal gas:

### **Run This Command:**

```powershell
C:\Users\Acer\.aptoscli\bin\aptos.exe move publish --named-addresses habit=0x78be456e78ffec3148be7b55580d91adc963e6affdf5a77672d31e44c0baa84c --gas-unit-price 100 --max-gas 30000 --assume-yes
```

**From directory:** `c:\Users\crisy\OneDrive\Escritorio\test4\move`

**If this works:**
- Contract deployed ✅
- Proceed to initialization

**If this fails:**
- Get more APT (Solution 1)
- Try again

---

## 📋 **COMPLETE DEPLOYMENT STEPS**

### **STEP 1: Get More APT**
```
Current balance: 0.996 APT
Need: ~1.5 APT total (0.996 + 0.5 more)
Get 1 APT from faucet → Total: 1.996 APT ✅
```

### **STEP 2: Navigate to Move Directory**
```powershell
cd c:\Users\crisy\OneDrive\Escritorio\test4\move
```

### **STEP 3: Compile Contract**
```powershell
C:\Users\Acer\.aptoscli\bin\aptos.exe move compile
```

**Expected:**
```
BUILDING HabitPlatform
{
  "Result": [
    "78be...::stake_match"
  ]
}
```

### **STEP 4: Publish Contract**
```powershell
C:\Users\Acer\.aptoscli\bin\aptos.exe move publish --named-addresses habit=0x78be456e78ffec3148be7b55580d91adc963e6affdf5a77672d31e44c0baa84c --assume-yes
```

**Expected:**
```
{
  "Result": {
    "transaction_hash": "0x...",
    "gas_used": xxxx,
    "success": true,
    "vm_status": "Executed successfully"
  }
}
```

### **STEP 5: Initialize Contract**
```powershell
cd ..
C:\Users\Acer\.aptoscli\bin\aptos.exe move run --function-id 0x78be456e78ffec3148be7b55580d91adc963e6affdf5a77672d31e44c0baa84c::stake_match::initialize --args address:0x78be456e78ffec3148be7b55580d91adc963e6affdf5a77672d31e44c0baa84c --assume-yes
```

**Expected:**
```
{
  "Result": {
    "transaction_hash": "0x...",
    "success": true
  }
}
```

### **STEP 6: Create .env File**
```powershell
echo "VITE_MODULE_ADDRESS=0x78be456e78ffec3148be7b55580d91adc963e6affdf5a77672d31e44c0baa84c" > .env
```

### **STEP 7: Start Dev Server**
```powershell
npm run dev
```

### **STEP 8: Test!**
```
Go to: http://localhost:3000/dashboard
Swipe right → Should show 0.1 APT ✅
```

---

## 🔧 **ALTERNATIVE: Use PowerShell Script**

I created a script for you: `deploy-contract.ps1`

**Run it:**
```powershell
cd c:\Users\crisy\OneDrive\Escritorio\test4
powershell -ExecutionPolicy Bypass -File deploy-contract.ps1
```

**What it does:**
1. Checks balance
2. Compiles contract
3. Publishes with proper gas settings
4. Initializes contract
5. Creates .env file
6. Shows next steps

---

## 🎯 **QUICK CHECKLIST**

**Before deploying:**
- [ ] Have ≥ 1 APT in wallet
- [ ] Aptos CLI working (`aptos.exe --version`)
- [ ] In correct directory
- [ ] Move.toml has correct address

**After deploying:**
- [ ] Contract compiled successfully
- [ ] Publish transaction succeeded
- [ ] Initialize transaction succeeded
- [ ] .env file created
- [ ] Dev server runs
- [ ] Dashboard shows 0.1 APT stakes

---

## 🚨 **TROUBLESHOOTING**

### **"INSUFFICIENT_BALANCE_FOR_TRANSACTION_FEE"**
**Solution:** Get more APT from faucet

### **"MAX_GAS_UNITS_BELOW_MIN_TRANSACTION_GAS_UNITS"**
**Solution:** Add `--max-gas 100000` to command

### **"Module already exists"**
**Solution:** This is an upgrade, it should work. If not, use `--upgrade-policy compatible`

### **"Simulation failed"**
**Solution:** 
1. Check balance
2. Try with different gas settings
3. Get more APT

---

## 📊 **GAS COST ESTIMATES**

| Operation | Gas Cost | APT Cost |
|-----------|----------|----------|
| **Compile** | 0 | Free |
| **Publish (new)** | ~50,000 units | ~0.05 APT |
| **Publish (upgrade)** | ~80,000 units | ~0.08 APT |
| **Initialize** | ~1,000 units | ~0.001 APT |
| **Each stake** | ~1,000 units | ~0.001 APT |

**Total for deployment:** ~0.1 APT  
**Recommended balance:** 1.5+ APT

---

## ✅ **RECOMMENDED PATH**

### **Path 1: If you can get more APT easily**
```
1. Get 1 APT from faucet (total: 1.996 APT)
2. Run deploy-contract.ps1 script
3. Done! ✅
```

### **Path 2: If faucet not working**
```
1. Try publish with lower gas:
   --max-gas 30000
2. If works: proceed
3. If fails: must get more APT (no alternative)
```

---

## 🎉 **SUCCESS CRITERIA**

**You'll know it worked when:**
1. ✅ Publish shows "success": true
2. ✅ Initialize shows "success": true
3. ✅ .env file exists with MODULE_ADDRESS
4. ✅ Dashboard loads
5. ✅ Swipe right shows "0.1 APT"
6. ✅ Transaction succeeds
7. ✅ Balance decreases by ~0.101 APT

---

## 📞 **NEXT STEPS**

### **RIGHT NOW:**
1. **Get 1 APT from Petra Wallet faucet** (fastest)
2. **Run the deploy script** or manual commands
3. **Test on Dashboard**

### **COMMANDS SUMMARY:**
```powershell
# 1. Get APT (Petra wallet → Settings → Faucet)

# 2. Deploy
cd c:\Users\crisy\OneDrive\Escritorio\test4\move
C:\Users\Acer\.aptoscli\bin\aptos.exe move compile
C:\Users\Acer\.aptoscli\bin\aptos.exe move publish --named-addresses habit=0x78be456e78ffec3148be7b55580d91adc963e6affdf5a77672d31e44c0baa84c --assume-yes

# 3. Initialize
cd ..
C:\Users\Acer\.aptoscli\bin\aptos.exe move run --function-id 0x78be456e78ffec3148be7b55580d91adc963e6affdf5a77672d31e44c0baa84c::stake_match::initialize --args address:0x78be456e78ffec3148be7b55580d91adc963e6affdf5a77672d31e44c0baa84c --assume-yes

# 4. Create .env
echo "VITE_MODULE_ADDRESS=0x78be456e78ffec3148be7b55580d91adc963e6affdf5a77672d31e44c0baa84c" > .env

# 5. Test
npm run dev
```

---

**Get APT from faucet first, then deploy! You're 1 APT away from success!** 🚀
