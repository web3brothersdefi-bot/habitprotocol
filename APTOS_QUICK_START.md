# 🚀 **APTOS MIGRATION - QUICK START**

## ⚡ **TL;DR - What You Need to Do**

Your Habit Platform is now ready for Aptos! Follow these steps in order:

---

## ✅ **STEP 1: Install Dependencies** (5 minutes)

### **Windows:**
```powershell
.\install-aptos.ps1
```

### **Mac/Linux:**
```bash
chmod +x install-aptos.sh
./install-aptos.sh
```

### **Or manually:**
```bash
npm uninstall wagmi @rainbow-me/rainbowkit viem
npm install @aptos-labs/ts-sdk@latest @aptos-labs/wallet-adapter-react@latest @aptos-labs/wallet-adapter-ant-design@latest petra-plugin-wallet-adapter@latest martian-wallet-adapter@latest pontem-wallet-adapter@latest
```

---

## ✅ **STEP 2: Install Aptos CLI** (5 minutes)

### **Windows:**
```powershell
iwr "https://aptos.dev/scripts/install_cli.py" -outfile "install_cli.py"
python install_cli.py
```

### **Mac/Linux:**
```bash
curl -fsSL "https://aptos.dev/scripts/install_cli.py" | python3
```

**Verify:**
```bash
aptos --version
```

---

## ✅ **STEP 3: Install Petra Wallet** (2 minutes)

1. Go to **[https://petra.app](https://petra.app)**
2. Install Chrome/Firefox extension
3. Create new wallet (SAVE YOUR SEED PHRASE!)
4. Switch to **Testnet** in settings
5. Copy your address

---

## ✅ **STEP 4: Get Test APT** (2 minutes)

```bash
aptos account fund-with-faucet --account YOUR_ADDRESS --amount 100000000
```

Or visit: **[https://aptoslabs.com/testnet-faucet](https://aptoslabs.com/testnet-faucet)**

---

## ✅ **STEP 5: Deploy Move Contract** (5 minutes)

```bash
cd move

# Initialize (first time only)
aptos init
# Choose: testnet
# Save your private key!

# Compile
aptos move compile

# Deploy
aptos move publish --named-addresses habit=YOUR_ACCOUNT_ADDRESS

# SAVE THE MODULE ADDRESS! (it's your account address)
```

---

## ✅ **STEP 6: Initialize Contract** (1 minute)

```bash
aptos move run \
  --function-id 'YOUR_ADDRESS::stake_match::initialize' \
  --args address:YOUR_ADDRESS
```

---

## ✅ **STEP 7: Update .env** (2 minutes)

Copy `.env.aptos.example` to `.env` and update:

```env
VITE_MODULE_ADDRESS=0x... # Your deployed contract address
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

---

## ✅ **STEP 8: Update Supabase** (3 minutes)

Run in Supabase SQL Editor:

```sql
ALTER TABLE users ALTER COLUMN wallet_address TYPE TEXT;
ALTER TABLE stakes ALTER COLUMN staker TYPE TEXT, ALTER COLUMN target TYPE TEXT;
ALTER TABLE matches ALTER COLUMN user_a TYPE TEXT, ALTER COLUMN user_b TYPE TEXT;
ALTER TABLE chats ALTER COLUMN sender_wallet TYPE TEXT;
```

---

## ✅ **STEP 9: Start Dev Server** (1 minute)

```bash
npm run dev
```

Open **http://localhost:3001**

---

## 🎉 **DONE! Test It Out**

1. Connect Petra wallet
2. Complete onboarding
3. Browse users
4. Click ❤️ to stake (costs ~1 APT)
5. Wait for match
6. Chat!

---

## 📊 **What Changed?**

| Feature | Old (Base) | New (Aptos) |
|---------|------------|-------------|
| **Blockchain** | Base Sepolia | Aptos Testnet ✨ |
| **Language** | Solidity | **Move** ✨ |
| **Token** | USDC | **APT** |
| **Wallets** | MetaMask | **Petra/Martian** |
| **TX Speed** | 2-5s | **1-2s** ⚡ |
| **Gas Cost** | $0.01 | **$0.0001** 💰 |

Everything else (UI, Supabase, Chat, Onboarding) is **exactly the same**!

---

## 🔗 **Important Links**

- **Aptos Docs:** https://aptos.dev
- **Move Tutorial:** https://aptos.dev/move/move-on-aptos
- **Petra Wallet:** https://petra.app
- **Explorer:** https://explorer.aptoslabs.com/?network=testnet
- **Faucet:** https://aptoslabs.com/testnet-faucet

---

## 🆘 **Troubleshooting**

### **"Module not found" errors?**
→ Run the installation script again

### **"Insufficient balance"?**
→ Get more test APT from faucet

### **"Transaction failed"?**
→ Check error code in console, see APTOS_MIGRATION_GUIDE.md

### **Wallet not connecting?**
→ Make sure Petra is on **Testnet** mode

---

## 📖 **Full Documentation**

See **`APTOS_MIGRATION_GUIDE.md`** for:
- Detailed explanations
- Architecture comparison
- Troubleshooting guide
- Testing procedures
- Deployment instructions

---

## ⏱️ **Total Time: ~25 minutes**

That's it! Your platform is now running on Aptos! 🎊

**Welcome to the future of blockchain! ⚡💰🚀**
