# 🚀 DEPLOY UPDATED CONTRACT (0.1 APT) - STEP BY STEP

## 📋 **WHAT CHANGED**

✅ Stake amount: **1 APT → 0.1 APT**

**Files Updated:**
1. `move/sources/stake_match.move` - Line 29: Contract constant
2. `src/config/aptos.ts` - Line 36: Frontend constant
3. `src/pages/Dashboard.jsx` - Line 175: UI message

---

## ⚠️ **PREREQUISITES**

Before deploying, make sure you have:

### **1. Aptos CLI Installed**
```bash
# Check if installed:
aptos --version

# If not installed, install:
# Windows (PowerShell as Admin):
iwr "https://aptos.dev/scripts/install_cli.py" -useb | iex

# Mac/Linux:
curl -fsSL "https://aptos.dev/scripts/install_cli.py" | python3
```

### **2. Test APT Tokens**
- **Minimum needed:** 0.1 APT (for gas fees)
- **Recommended:** 1 APT (for testing + gas)
- See `GET_TEST_TOKENS.md` for how to get tokens

### **3. Wallet Ready**
- Petra Wallet installed
- Connected to **Testnet**
- Address funded with APT

---

## 🔧 **STEP-BY-STEP DEPLOYMENT**

### **STEP 1: Navigate to Project Directory**

```bash
cd c:/Users/crisy/OneDrive/Escritorio/test4
```

---

### **STEP 2: Initialize Aptos Account (If First Time)**

If you haven't set up an Aptos account yet:

```bash
aptos init
```

**You'll be asked:**
1. **Network:** Choose `testnet`
2. **Private Key:** 
   - Press Enter to generate new key
   - OR paste your Petra wallet private key

**Output will show:**
```
Account created at address: 0x...
```

**Important:** Save this address! You'll need it.

---

### **STEP 3: Check Your Balance**

```bash
aptos account list --account YOUR_ADDRESS
```

**Replace YOUR_ADDRESS with your wallet address.**

**Expected output:**
```
{
  "coin": {
    "value": "100000000"  // This is 1 APT
  }
}
```

If balance is 0, go get test tokens first (see `GET_TEST_TOKENS.md`)!

---

### **STEP 4: Update Move.toml with Your Address**

Open `move/Move.toml` and update:

```toml
[addresses]
habit = "YOUR_WALLET_ADDRESS_HERE"
```

**Example:**
```toml
[addresses]
habit = "0x78be456e78ffec3148be7b55580d91adc963e6affdf5a77672d31e44c0baa84c"
```

**Save the file!**

---

### **STEP 5: Compile the Contract**

```bash
cd move
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

**✅ If successful:** You'll see "BUILDING habit" and your module address

**❌ If error:** Check that:
- `Move.toml` has correct address
- No syntax errors in `stake_match.move`

---

### **STEP 6: Deploy (Publish) the Contract**

Still in the `move` directory:

```bash
aptos move publish
```

**You'll be asked:**
```
Do you want to publish this package at object address 0x...? [yes/no]
```

**Type:** `yes` and press Enter

**Expected output:**
```
{
  "Result": {
    "transaction_hash": "0xabc123...",
    "gas_used": 1234,
    "gas_unit_price": 100,
    "sender": "0x78be...",
    "sequence_number": 0,
    "success": true,
    "timestamp_us": 1234567890,
    "version": 123456,
    "vm_status": "Executed successfully"
  }
}
```

**✅ Copy the `transaction_hash`!** You'll need it to verify.

---

### **STEP 7: Verify Deployment**

#### **Option A: Check on Explorer**

1. Go to: https://explorer.aptoslabs.com/?network=testnet
2. Paste the `transaction_hash` from Step 6
3. Check transaction status

**Should see:**
- ✅ Status: Success
- ✅ Type: User Transaction
- ✅ Function: `0x1::code::publish_package`

#### **Option B: Check via CLI**

```bash
aptos account list --account YOUR_ADDRESS
```

**Look for:** `modules` section showing `stake_match`

---

### **STEP 8: Initialize the Contract**

After deployment, initialize it:

```bash
aptos move run \
  --function-id YOUR_ADDRESS::stake_match::initialize \
  --assume-yes
```

**Replace YOUR_ADDRESS** with your wallet address.

**Expected output:**
```
{
  "Result": {
    "transaction_hash": "0xdef456...",
    "success": true,
    "vm_status": "Executed successfully"
  }
}
```

**✅ Contract is now initialized and ready!**

---

### **STEP 9: Update Frontend .env File**

Go back to project root:

```bash
cd ..
```

Create or update `.env` file:

```bash
# .env file
VITE_MODULE_ADDRESS=0x78be456e78ffec3148be7b55580d91adc963e6affdf5a77672d31e44c0baa84c
```

**Replace with YOUR wallet address!**

---

### **STEP 10: Verify Contract Constants**

Let's verify the stake amount is correct:

```bash
aptos move view \
  --function-id YOUR_ADDRESS::stake_match::get_stake_amount \
  --args address:YOUR_ADDRESS
```

**Expected output:**
```
{
  "Result": [
    "10000000"  // This is 0.1 APT ✅
  ]
}
```

**If you see `100000000`, the old contract is still deployed!**

---

## ✅ **SUCCESS VERIFICATION**

### **Checklist:**

- [ ] Contract compiled without errors
- [ ] Deploy transaction shows `success: true`
- [ ] Initialize transaction successful
- [ ] Explorer shows contract deployed
- [ ] `get_stake_amount` returns `10000000` (0.1 APT)
- [ ] `.env` file updated with MODULE_ADDRESS
- [ ] Frontend shows "Staking 0.1 APT" message

---

## 🚨 **TROUBLESHOOTING**

### **Error: "Insufficient balance"**

**Problem:** Not enough APT for gas fees

**Solution:** Get test tokens (see `GET_TEST_TOKENS.md`)

---

### **Error: "Account does not exist"**

**Problem:** Wallet not initialized

**Solution:** Run `aptos init` again or fund your account first

---

### **Error: "Module already exists"**

**Problem:** You've already deployed to this address

**Solution:** 
1. You can upgrade the module:
   ```bash
   aptos move publish --upgrade-policy compatible
   ```

2. Or deploy to a new address (create new wallet)

---

### **Error: "Invalid address format"**

**Problem:** Address in `Move.toml` is wrong

**Solution:** 
- Ensure address starts with `0x`
- Must be 66 characters total (0x + 64 hex chars)
- Use your Petra wallet address

---

### **Compilation Error: "Undeclared variable"**

**Problem:** Syntax error in contract

**Solution:** 
- Check `stake_match.move` for typos
- Ensure line 29 shows: `const STAKE_AMOUNT: u64 = 10_000_000;`

---

## 📝 **POST-DEPLOYMENT TASKS**

### **1. Update Documentation**

Update `APTOS_MIGRATION_STATUS.md`:

```markdown
## ✅ **Contract Re-deployed (0.1 APT)**

**Transaction:** https://explorer.aptoslabs.com/txn/YOUR_TX_HASH?network=testnet

**Module Address:** `0xYOUR_ADDRESS`

**Stake Amount:** 0.1 APT (10,000,000 Octas)

**Status:** ✅ Deployed and initialized successfully
```

---

### **2. Test the Contract**

Start your dev server:

```bash
npm run dev
```

Then test:
1. Go to Dashboard
2. Swipe right on a user
3. Petra should ask to approve **0.1 APT** transaction
4. Approve and verify success

---

### **3. Monitor Gas Usage**

After a few test stakes, check gas usage:

```bash
aptos account list --account YOUR_ADDRESS
```

**With 0.1 APT stakes:**
- Each stake costs ~0.001 APT in gas
- Much cheaper to test!
- Can do 10 stakes with 1 APT

---

## 🎉 **DEPLOYMENT COMPLETE!**

**Your updated contract is now live with:**
- ✅ 0.1 APT stake amount (instead of 1 APT)
- ✅ Lower barrier to entry for testing
- ✅ Same features and functionality
- ✅ Ready for production testing

---

## 🔗 **NEXT STEPS**

1. ✅ Test staking functionality
2. ✅ Verify matches work
3. ✅ Test refund after 2 days
4. ✅ Test release after 7 days
5. ✅ Deploy to mainnet when ready

---

## 📞 **NEED HELP?**

If you encounter any issues:

1. **Check logs:** Look for error messages in console
2. **Check explorer:** Verify transactions on Aptos Explorer
3. **Check balance:** Make sure you have enough APT
4. **Discord:** Ask in Aptos Discord (#developer-discussions)

---

**Ready to deploy? Follow the steps above!** 🚀
