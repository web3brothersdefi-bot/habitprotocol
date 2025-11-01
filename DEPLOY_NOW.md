# ⚡ DEPLOY CONTRACT NOW - 5 MINUTES

## ❌ **THE PROBLEM**

- Contract code updated to 0.1 APT ✅
- **NOT deployed yet** ❌
- Still getting E_NOT_INITIALIZED (old contract)
- Your balance: **0.996 APT** (need ~1.5 APT)

---

## ✅ **THE SOLUTION (2 Steps)**

### **STEP 1: Get 1 More APT (2 minutes)**

**Fastest: Petra Wallet**
1. Open Petra extension
2. Click ⚙️ Settings
3. Find "Faucet"
4. Click "Get Test Tokens"
5. Wait 10 seconds
6. **Done! Now have 1.996 APT** ✅

**Alternative: Discord**
```
1. Join: https://discord.gg/aptoslabs
2. Channel: #testnet-faucet
3. Command: /faucet address:0x78be456e78ffec3148be7b55580d91adc963e6affdf5a77672d31e44c0baa84c
4. Wait → Get 1 APT
```

---

### **STEP 2: Deploy Contract (3 minutes)**

**Copy and run these commands:**

```powershell
# 1. Go to move directory
cd c:\Users\crisy\OneDrive\Escritorio\test4\move

# 2. Compile
C:\Users\Acer\.aptoscli\bin\aptos.exe move compile

# 3. Publish
C:\Users\Acer\.aptoscli\bin\aptos.exe move publish --named-addresses habit=0x78be456e78ffec3148be7b55580d91adc963e6affdf5a77672d31e44c0baa84c --assume-yes

# 4. Initialize
cd ..
C:\Users\Acer\.aptoscli\bin\aptos.exe move run --function-id 0x78be456e78ffec3148be7b55580d91adc963e6affdf5a77672d31e44c0baa84c::stake_match::initialize --args address:0x78be456e78ffec3148be7b55580d91adc963e6affdf5a77672d31e44c0baa84c --assume-yes

# 5. Create .env
echo "VITE_MODULE_ADDRESS=0x78be456e78ffec3148be7b55580d91adc963e6affdf5a77672d31e44c0baa84c" > .env

# 6. Start server
npm run dev
```

**Done!** Go to Dashboard and test ✅

---

## 🎯 **WHAT TO EXPECT**

### **After Compile:**
```
BUILDING HabitPlatform
{
  "Result": [
    "78be...::stake_match"
  ]
}
```
✅ **Compilation successful!**

---

### **After Publish:**
```
{
  "Result": {
    "transaction_hash": "0x...",
    "gas_used": 45623,
    "success": true,
    "vm_status": "Executed successfully"
  }
}
```
✅ **Contract deployed with 0.1 APT!**

---

### **After Initialize:**
```
{
  "Result": {
    "transaction_hash": "0x...",
    "success": true
  }
}
```
✅ **Contract initialized!**

---

### **After Testing:**
```
Dashboard → Swipe right
↓
Petra shows: "0.1 APT" ✅
↓
Approve
↓
Success! ✅
```

---

## 🚨 **IF ERRORS**

### **"INSUFFICIENT_BALANCE"**
→ Get more APT from faucet (Step 1)

### **"MAX_GAS_UNITS_BELOW_MIN"**
→ Add to publish command: `--max-gas 100000`

### **"E_NOT_INITIALIZED"**
→ Run initialize command again (Step 4)

---

## ✅ **SUCCESS CHECKLIST**

After deployment:
- [ ] Compile: "BUILDING HabitPlatform" ✅
- [ ] Publish: "success": true ✅
- [ ] Initialize: "success": true ✅
- [ ] .env file exists ✅
- [ ] npm run dev works ✅
- [ ] Dashboard shows 0.1 APT ✅
- [ ] Staking works ✅

---

## 🔗 **HELPFUL LINKS**

**Get Test APT:**
- Petra Wallet (Settings → Faucet)
- https://discord.gg/aptoslabs (#testnet-faucet)
- https://faucet.quicknode.com/aptos/testnet

**Check Transactions:**
- https://explorer.aptoslabs.com/?network=testnet

**Your Wallet:**
- 0x78be456e78ffec3148be7b55580d91adc963e6affdf5a77672d31e44c0baa84c

---

## ⚡ **QUICK VERSION**

```powershell
# Get 1 APT from Petra Wallet faucet first!

cd c:\Users\crisy\OneDrive\Escritorio\test4\move
C:\Users\Acer\.aptoscli\bin\aptos.exe move compile
C:\Users\Acer\.aptoscli\bin\aptos.exe move publish --named-addresses habit=0x78be456e78ffec3148be7b55580d91adc963e6affdf5a77672d31e44c0baa84c --assume-yes
cd ..
C:\Users\Acer\.aptoscli\bin\aptos.exe move run --function-id 0x78be456e78ffec3148be7b55580d91adc963e6affdf5a77672d31e44c0baa84c::stake_match::initialize --args address:0x78be456e78ffec3148be7b55580d91adc963e6affdf5a77672d31e44c0baa84c --assume-yes
echo "VITE_MODULE_ADDRESS=0x78be456e78ffec3148be7b55580d91adc963e6affdf5a77672d31e44c0baa84c" > .env
npm run dev
```

**Total time: 5 minutes**  
**Total cost: ~0.1 APT**

---

**GET APT FROM FAUCET NOW → THEN RUN COMMANDS!** 🚀
