# 📝 What I Need From You - User Action Items

Hi! I've built your complete Habit Platform. Here's what you need to provide to make it fully functional:

## 🔴 CRITICAL - Required Before Testing

### 1. Supabase Setup (15 minutes)

**Why**: Stores all user data, profiles, matches, and chat messages

**Steps**:
1. Go to [supabase.com](https://supabase.com) and create free account
2. Create new project (name it "habit-platform")
3. Go to SQL Editor and run the entire `database/schema.sql` file
4. Go to Settings → API and copy:
   - Project URL (looks like: `https://xxxxx.supabase.co`)
   - `anon public` key (for frontend)
   - `service_role` key (for backend - keep secret!)

**Add to `.env`**:
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

---

### 2. WalletConnect Project ID (5 minutes)

**Why**: Required for wallet connection functionality

**Steps**:
1. Go to [cloud.walletconnect.com](https://cloud.walletconnect.com)
2. Sign up with email
3. Create new project (name: "Habit Platform")
4. Copy the Project ID

**Add to `.env`**:
```env
VITE_WALLETCONNECT_PROJECT_ID=abc123def456...
```

---

### 3. Deploy Smart Contract (10 minutes)

**Why**: This is the core blockchain logic for staking and matching

**Steps**:
1. Go to [remix.ethereum.org](https://remix.ethereum.org)
2. Create new file: `StakeMatch.sol`
3. Copy content from `contracts/StakeMatch.sol`
4. Compile with Solidity 0.8.29
5. Switch MetaMask to **Base Sepolia** network
   - RPC: `https://sepolia.base.org`
   - Chain ID: `84532`
6. Get test ETH from [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet)
7. Deploy the contract
8. **SAVE THE CONTRACT ADDRESS!** (looks like: `0x123...abc`)

**Add to `.env`**:
```env
VITE_CONTRACT_ADDRESS=0x123...abc
```

---

### 4. Get Test USDC (5 minutes)

**Why**: You need USDC to test the staking feature

**Option A - From Contract**:
1. Base Sepolia USDC: `0x036CbD53842c5426634e7929541eC2318f3dCF7e`
2. Add to MetaMask as custom token
3. Try minting from the contract (if public mint available)

**Option B - From Faucet**:
1. Search for "Base Sepolia USDC Faucet"
2. Request test USDC tokens

**Minimum needed**: 5 USDC for testing

---

## 🟡 OPTIONAL - Enhance Features

### 5. Pinata/IPFS (Optional - for profile images)

**Why**: Decentralized storage for profile pictures

**Steps**:
1. Go to [pinata.cloud](https://pinata.cloud)
2. Sign up for free account
3. Go to API Keys → Create Key
4. Copy API Key, Secret Key, and JWT

**Add to `.env`**:
```env
VITE_PINATA_API_KEY=your_key
VITE_PINATA_SECRET_KEY=your_secret
VITE_PINATA_JWT=your_jwt
```

---

### 6. OpenRank API (Optional - for reputation)

**Why**: Calculates user reputation based on on-chain activity

**Steps**:
1. Go to [openrank.com](https://openrank.com)
2. Sign up for API access
3. Get your API key

**Add to `.env`**:
```env
VITE_OPENRANK_API_KEY=your_api_key
```

---

## 📋 Complete .env File Template

Create `.env` in the root directory:

```env
# ===================================
# REQUIRED - App won't work without these
# ===================================

# Supabase (from Step 1)
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...

# Smart Contract (from Step 3)
VITE_CONTRACT_ADDRESS=0x123...abc

# WalletConnect (from Step 2)
VITE_WALLETCONNECT_PROJECT_ID=abc123...

# ===================================
# OPTIONAL - For enhanced features
# ===================================

# Pinata/IPFS (from Step 5)
VITE_PINATA_API_KEY=your_key
VITE_PINATA_SECRET_KEY=your_secret
VITE_PINATA_JWT=your_jwt

# OpenRank (from Step 6)
VITE_OPENRANK_API_KEY=your_api_key
```

---

## 🚀 After You Have Everything

1. **Install dependencies** (already running):
   ```bash
   npm install
   ```

2. **Create `.env` file** with values from above

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Visit**: `http://localhost:3000`

5. **Test the flow**:
   - Connect wallet
   - Complete onboarding
   - Browse users (you can create test users in Supabase manually)
   - Stake to connect
   - Test chat

---

## 🔧 Backend Event Listener (Optional - for production)

To sync blockchain events with database:

1. Create `backend/.env`:
   ```env
   CONTRACT_ADDRESS=0x123...abc
   SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_SERVICE_KEY=eyJhbGc... (service_role key!)
   BASE_SEPOLIA_RPC=https://sepolia.base.org
   ```

2. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```

3. Start listener:
   ```bash
   npm start
   ```

---

## ❓ Questions or Issues?

### Common Questions:

**Q: Do I need all of these?**
A: For basic testing, you only need: Supabase, WalletConnect ID, and deployed smart contract.

**Q: Can I use mainnet?**
A: Yes, but deploy to Base Sepolia testnet first! Update USDC address for mainnet.

**Q: How do I add test users?**
A: You can manually add users in Supabase Table Editor, or complete onboarding multiple times with different wallets.

**Q: The contract deployment failed?**
A: Make sure you have Base Sepolia ETH for gas fees.

**Q: I don't see any users to swipe?**
A: Create a few test users manually in Supabase or complete onboarding with multiple test wallets.

---

## 📞 Ready to Start?

Once you have:
- ✅ Supabase project created
- ✅ WalletConnect Project ID
- ✅ Smart contract deployed
- ✅ `.env` file created
- ✅ Test USDC in your wallet

You're ready to test your Habit Platform! 🎉

---

## 🎯 Quick Start Summary

1. **5 minutes**: Create Supabase project
2. **2 minutes**: Get WalletConnect ID
3. **10 minutes**: Deploy smart contract
4. **2 minutes**: Create `.env` file
5. **5 minutes**: Get test USDC
6. **Ready!**: `npm run dev`

**Total time**: ~25 minutes to get fully running!

---

**Need help?** Check:
- `SETUP_GUIDE.md` for detailed instructions
- `README.md` for project overview
- `DEPLOYMENT.md` for production deployment
- Browser console for error messages
- Supabase logs for database issues

**You got this!** 💪
