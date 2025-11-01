# 💰 GET TEST APT TOKENS - COMPLETE GUIDE

## 🎯 **METHOD 1: Aptos Faucet (Official)**

### **Option A: Via Website**

1. **Get Your Wallet Address:**
   - Open Petra Wallet extension
   - Copy your wallet address (starts with `0x`)
   - Example: `0x78be456e78ffec3148be7b55580d91adc963e6affdf5a77672d31e44c0baa84c`

2. **Visit Official Faucet:**
   ```
   https://www.aptoslabs.com/faucet
   ```

3. **Request Tokens:**
   - Paste your wallet address
   - Select "Testnet"
   - Click "Submit"
   - Wait 10-30 seconds
   - You'll receive **1 APT** (100,000,000 Octas)

4. **Verify Balance:**
   - Check Petra Wallet
   - Should show balance increase
   - Or check on explorer: https://explorer.aptoslabs.com/?network=testnet

---

### **Option B: Via Aptos CLI**

If you have Aptos CLI installed:

```bash
# Replace with your wallet address
aptos account fund-with-faucet --account YOUR_ADDRESS --amount 100000000

# Example:
aptos account fund-with-faucet --account 0x78be456e78ffec3148be7b55580d91adc963e6affdf5a77672d31e44c0baa84c --amount 100000000
```

**Amount:** 100000000 Octas = 1 APT

---

### **Option C: Petra Wallet Built-in Faucet**

1. Open Petra Wallet
2. Click on "Testnet" network
3. Look for "Faucet" or "Get Test Tokens" button
4. Click and wait
5. Tokens should appear in 10-30 seconds

---

## 🎯 **METHOD 2: Aptos Discord Faucet**

### **Steps:**

1. **Join Aptos Discord:**
   ```
   https://discord.gg/aptoslabs
   ```

2. **Navigate to Faucet Channel:**
   - Look for `#testnet-faucet` channel

3. **Request Tokens:**
   ```
   !faucet YOUR_WALLET_ADDRESS
   ```
   
   Example:
   ```
   !faucet 0x78be456e78ffec3148be7b55580d91adc963e6affdf5a77672d31e44c0baa84c
   ```

4. **Wait for Bot Response:**
   - Bot will confirm transaction
   - Check your wallet in 10-30 seconds

---

## 🎯 **METHOD 3: Alternative Faucets**

### **Aptos Testnet Faucet (Community)**

1. Visit:
   ```
   https://aptoslabs.com/testnet-faucet
   ```

2. Enter your address
3. Complete captcha
4. Submit
5. Receive tokens

---

## ✅ **VERIFY YOU RECEIVED TOKENS**

### **Method 1: Check Petra Wallet**
- Open Petra extension
- Look at APT balance
- Should show ≥ 1 APT

### **Method 2: Check Explorer**
1. Go to: https://explorer.aptoslabs.com/?network=testnet
2. Enter your address
3. Look for "Coin Balance" section
4. Should show APT balance

### **Method 3: Use Aptos CLI**
```bash
aptos account list --account YOUR_ADDRESS
```

---

## 🚨 **TROUBLESHOOTING**

### **Issue: Faucet Says "Rate Limited"**

**Solution:**
- Faucets have cooldown periods (usually 24 hours)
- Try a different faucet method
- Or wait and try again later

### **Issue: Tokens Not Appearing**

**Checklist:**
1. ✅ Are you on **Testnet** network?
2. ✅ Did you copy the correct address?
3. ✅ Have you waited 30+ seconds?
4. ✅ Try refreshing wallet

**If still not appearing:**
- Check transaction on explorer
- Try faucet again with different method

### **Issue: "Faucet Unavailable"**

**Solution:**
- Try different time of day
- Use Discord faucet instead
- Ask in Aptos Discord for help

---

## 💰 **HOW MUCH DO YOU NEED?**

### **For Your Project:**
- **Deploy Contract:** ~0.01 APT (gas fees)
- **Initialize Contract:** ~0.001 APT
- **10 Stakes:** 10 × 0.1 APT = 1 APT
- **Gas for Stakes:** ~0.1 APT total
- **Buffer:** ~0.5 APT

**Total Recommended:** **2 APT minimum**

### **Getting 2 APT:**
1. Request from faucet: 1 APT ✅
2. Wait 24 hours
3. Request again: 1 APT ✅
4. **OR** use multiple faucet methods simultaneously

---

## 📝 **QUICK REFERENCE**

| Method | Amount | Cooldown | Speed |
|--------|--------|----------|-------|
| Official Faucet | 1 APT | 24h | Fast (10s) |
| Discord Bot | 1 APT | 24h | Fast (10s) |
| Petra Wallet | 1 APT | 24h | Fast (10s) |
| CLI Faucet | Custom | 24h | Fast (10s) |

---

## 🎉 **SUCCESS CHECKLIST**

Once you have tokens:
- [ ] Petra Wallet shows ≥ 1 APT
- [ ] Explorer confirms balance
- [ ] Ready to deploy contract ✅
- [ ] Ready to test staking ✅

---

## 🔗 **USEFUL LINKS**

- **Official Faucet:** https://www.aptoslabs.com/faucet
- **Explorer:** https://explorer.aptoslabs.com/?network=testnet
- **Discord:** https://discord.gg/aptoslabs
- **Aptos Docs:** https://aptos.dev/tutorials/your-first-transaction

---

**Get your tokens now and come back when ready to deploy!** 🚀
