# 🚀 **COMPLETE MIGRATION GUIDE: Base → Aptos**

## 📖 **Table of Contents**

1. [Overview](#overview)
2. [What Changed](#what-changed)
3. [Prerequisites](#prerequisites)
4. [Step-by-Step Migration](#step-by-step-migration)
5. [Testing on Aptos Testnet](#testing)
6. [Deployment](#deployment)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 **Overview**

**Old Stack:** Base Sepolia + Solidity + ERC20 USDC + MetaMask  
**New Stack:** Aptos Testnet + Move + APT + Petra/Martian Wallets

**What Stays:** UI, Supabase, Onboarding, Chat - ALL THE SAME!  
**What Changes:** Blockchain layer, smart contract, wallet integration

---

## 🔄 **What Changed**

### **Files Created:**
- ✅ `move/sources/stake_match.move` - Move smart contract
- ✅ `move/Move.toml` - Move package configuration
- ✅ `src/config/aptos.ts` - Aptos configuration (replaces `wagmi.js`)
- ✅ `src/providers/WalletProvider.tsx` - Aptos wallet provider
- ✅ `src/hooks/useAptosContract.ts` - Contract interaction hooks

### **Files to Update:**
- 🔄 `package.json` - New dependencies
- 🔄 `src/main.jsx` - New wallet provider
- 🔄 `src/App.jsx` - Use Aptos hooks
- 🔄 `.env` - Aptos configuration
- 🔄 All pages using wallet (Dashboard, etc.)

### **Files to Delete:**
- ❌ `src/config/wagmi.js` - No longer needed
- ❌ `src/hooks/useContract.js` - Replaced by `useAptosContract.ts`
- ❌ `contracts/StakeMatch.sol` - Replaced by Move contract

---

## 📋 **Prerequisites**

### **1. Install Aptos CLI**

#### **macOS/Linux:**
```bash
curl -fsSL "https://aptos.dev/scripts/install_cli.py" | python3
```

#### **Windows:**
```powershell
iwr "https://aptos.dev/scripts/install_cli.py" -outfile "install_cli.py"
python install_cli.py
```

**Verify:**
```bash
aptos --version
# Should show: aptos 3.x.x
```

### **2. Install Petra Wallet**
- Go to [https://petra.app](https://petra.app)
- Install browser extension
- Create new wallet
- Switch to **Testnet**
- Get test APT from faucet

### **3. Get Test APT**
```bash
# Using Aptos CLI (replace with your address)
aptos account fund-with-faucet --account YOUR_ADDRESS --amount 100000000

# Or visit: https://aptoslabs.com/testnet-faucet
```

---

## 🔧 **Step-by-Step Migration**

### **STEP 1: Install New Dependencies**

```bash
# Remove old EVM dependencies
npm uninstall wagmi @rainbow-me/rainbowkit viem

# Install Aptos dependencies
npm install @aptos-labs/ts-sdk@latest
npm install @aptos-labs/wallet-adapter-react@latest
npm install @aptos-labs/wallet-adapter-ant-design@latest
npm install petra-plugin-wallet-adapter@latest
npm install martian-wallet-adapter@latest
npm install pontem-wallet-adapter@latest

# Verify installation
npm list @aptos-labs/ts-sdk
```

### **STEP 2: Initialize Aptos Project**

```bash
# Initialize Move project (if not done)
cd move
aptos init

# When prompted:
# - Choose "testnet"
# - Enter private key OR generate new one
# - Save the account address!
```

### **STEP 3: Deploy Move Smart Contract**

```bash
# Compile the contract
cd move
aptos move compile

# Test the contract (optional)
aptos move test

# Deploy to testnet
aptos move publish --named-addresses habit=YOUR_ACCOUNT_ADDRESS

# Save the transaction hash!
# Your module will be at: YOUR_ACCOUNT_ADDRESS::stake_match
```

### **STEP 4: Initialize the Contract**

After deployment, initialize it:

```bash
# Using Aptos CLI
aptos move run \
  --function-id 'YOUR_ADDRESS::stake_match::initialize' \
  --args address:YOUR_ADDRESS

# Or use the Aptos Explorer UI
```

### **STEP 5: Update .env File**

```env
# ===== APTOS CONFIGURATION =====

# Module address (from deployment)
VITE_MODULE_ADDRESS=0x1234...your_deployed_address

# Aptos Connect (optional)
VITE_APTOS_CONNECT_DAPP_ID=your_dapp_id

# ===== KEEP THESE SAME =====

# Supabase
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...

# Pinata (if using)
VITE_PINATA_API_KEY=...
VITE_PINATA_SECRET_KEY=...
VITE_PINATA_JWT=...
```

### **STEP 6: Update Supabase Database Schema**

Aptos addresses are longer (32 bytes vs 20 bytes). Update your database:

```sql
-- Increase wallet_address field size
ALTER TABLE users 
  ALTER COLUMN wallet_address TYPE TEXT;

-- Do the same for other tables
ALTER TABLE stakes 
  ALTER COLUMN staker TYPE TEXT,
  ALTER COLUMN target TYPE TEXT;

ALTER TABLE matches 
  ALTER COLUMN user_a TYPE TEXT,
  ALTER COLUMN user_b TYPE TEXT;

ALTER TABLE chats 
  ALTER COLUMN sender_wallet TYPE TEXT;

-- Update indexes if needed
REINDEX TABLE users;
```

### **STEP 7: Update Main Entry Point**

The `src/main.jsx` is already updated! But verify it looks like this:

```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WalletProvider } from './providers/WalletProvider';
import App from './App.jsx';
import './index.css';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <WalletProvider>
        <App />
      </WalletProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
```

### **STEP 8: Update Landing Page (Wallet Connect)**

I'll create a new wallet connect button component next!

### **STEP 9: Update All Pages**

Replace:
- `useAccount()` → `useWallet()`
- `address` → `account?.address`
- `isConnected` → `connected`
- Contract hooks → New Aptos hooks

### **STEP 10: Test Everything**

```bash
# Start dev server
npm run dev

# Open browser
# Install Petra wallet
# Switch to testnet
# Get test APT
# Test the app!
```

---

## 🧪 **Testing on Aptos Testnet**

### **1. Connect Wallet**
- Click "Connect Wallet"
- Select Petra/Martian
- Approve connection
- See your address (long, 0x123...)

### **2. Check Balance**
```bash
# Via CLI
aptos account list --account YOUR_ADDRESS

# Should show APT balance
```

### **3. Test Staking**
1. Complete onboarding
2. Browse users
3. Click ❤️ to stake
4. Approve transaction in Petra
5. Wait for confirmation (~1-2 seconds)
6. Check Aptos Explorer

### **4. View Transaction**
```
https://explorer.aptoslabs.com/txn/TRANSACTION_HASH?network=testnet
```

### **5. Check Contract State**
```bash
# View stake status
aptos move run \
  --function-id 'YOUR_ADDRESS::stake_match::get_stake_status' \
  --args address:YOUR_ADDRESS address:STAKER address:TARGET
```

---

## 🚀 **Deployment**

### **Frontend (Same as Before)**
- Deploy to Vercel/Netlify
- Add environment variables
- Deploy!

### **Backend Event Listener (Update for Aptos)**
- Use Aptos Indexer API
- Subscribe to module events
- Update Supabase on events

### **Smart Contract (Already Done)**
- Deployed to testnet
- For mainnet: `aptos move publish --network mainnet`

---

## ❓ **Troubleshooting**

### **Issue: "Module not found"**
**Solution:**
```bash
npm install
# Make sure all @aptos-labs packages are installed
```

### **Issue: "Invalid address format"**
**Solution:**
Aptos addresses must be 32 bytes (64 hex chars):
```javascript
// Use normalizeAddress helper
import { normalizeAddress } from './config/aptos';
const addr = normalizeAddress('0x123'); // Adds leading zeros
```

### **Issue: "Transaction failed with abort code"**
**Solution:**
Check the error code:
- Code 3: No stake exists
- Code 4: Stake already exists
- Code 6: Refund period not elapsed (wait 2 days)
- Code 7: Release period not elapsed (wait 7 days)

### **Issue: "Insufficient balance"**
**Solution:**
```bash
# Get more test APT
aptos account fund-with-faucet --account YOUR_ADDRESS --amount 100000000
```

### **Issue: "Wallet not connecting"**
**Solution:**
1. Make sure Petra is installed
2. Switch to Testnet in Petra settings
3. Refresh the page
4. Try disconnecting and reconnecting

---

## 📊 **Comparison: Before vs After**

| Feature | Base (Before) | Aptos (After) |
|---------|---------------|---------------|
| Transaction Time | ~2-5 seconds | ~1-2 seconds ⚡ |
| Gas Fees | ~$0.01-0.05 | ~$0.0001-0.001 💰 |
| Stake Token | USDC | APT |
| Stake Amount | 1 USDC | 1 APT |
| Address Length | 20 bytes | 32 bytes |
| Wallets | MetaMask, Coinbase | Petra, Martian, Pontem |
| Smart Contract | Solidity | Move |
| Safety | EVM security | Move formal verification ✅ |

---

## 🎯 **Migration Checklist**

- [ ] Aptos CLI installed
- [ ] Petra wallet installed and funded
- [ ] Move contract compiled
- [ ] Move contract deployed
- [ ] Contract initialized
- [ ] Module address saved
- [ ] .env updated with module address
- [ ] Dependencies installed (`npm install`)
- [ ] Supabase schema updated for longer addresses
- [ ] All pages updated to use Aptos hooks
- [ ] Landing page has new wallet connect
- [ ] Dashboard uses new staking hooks
- [ ] Tested full flow on testnet
- [ ] Backend event listener updated (if needed)

---

## 🔗 **Useful Resources**

- **Aptos Docs:** https://aptos.dev
- **Move Language:** https://move-language.github.io/move/
- **Petra Wallet:** https://petra.app
- **Aptos Explorer:** https://explorer.aptoslabs.com
- **Testnet Faucet:** https://aptoslabs.com/testnet-faucet
- **Aptos Discord:** https://discord.gg/aptoslabs

---

## 🎉 **Next Steps**

After successful migration:

1. ✅ Test complete user flow
2. ✅ Create test users with different roles
3. ✅ Test staking and matching
4. ✅ Test chat functionality
5. ✅ Test refund after 2 days
6. ✅ Test release after 7 days
7. ✅ Monitor gas costs
8. ✅ Optimize transaction calls
9. ✅ Deploy to mainnet (when ready)

---

## 💪 **You Got This!**

The migration is extensive but systematic. Follow each step carefully, test thoroughly, and you'll have a production-ready Aptos dApp!

**Key Advantages of Aptos:**
- ⚡ Faster transactions
- 💰 Lower gas fees
- 🔒 Move language safety
- 🚀 Better scalability
- 🌟 Modern architecture

**Welcome to the Aptos ecosystem!** 🎊
