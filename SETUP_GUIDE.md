# 🚀 Habit Platform - Complete Setup Guide

This guide will walk you through setting up the entire Habit Platform from scratch.

## 📋 Prerequisites Checklist

Before you begin, make sure you have:

- ✅ Node.js 18+ installed
- ✅ npm or yarn package manager
- ✅ MetaMask browser extension
- ✅ Base Sepolia testnet added to MetaMask
- ✅ Some Base Sepolia ETH (for gas fees)
- ✅ Base Sepolia USDC tokens

## 🔧 Step 1: Install Dependencies

```bash
cd test4
npm install
```

This will install all frontend dependencies including React, Wagmi, RainbowKit, Tailwind, etc.

For the backend event listener:

```bash
cd backend
npm install
cd ..
```

## 🗄️ Step 2: Set Up Supabase Database

### 2.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in:
   - **Name**: habit-platform
   - **Database Password**: (save this!)
   - **Region**: Choose closest to you
5. Wait for project to be created

### 2.2 Run Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Copy the entire content from `database/schema.sql`
3. Paste it into the SQL Editor
4. Click **Run**
5. Verify all tables were created (check the **Table Editor** tab)

### 2.3 Get Supabase Credentials

1. Go to **Project Settings** → **API**
2. Copy:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGc...` (for frontend)
   - **service_role key**: `eyJhbGc...` (for backend - keep secret!)

## 🔗 Step 3: Deploy Smart Contract

### 3.1 Using Remix IDE (Easiest)

1. Go to [remix.ethereum.org](https://remix.ethereum.org)
2. Create new file: `StakeMatch.sol`
3. Copy content from `contracts/StakeMatch.sol`
4. Compile with Solidity 0.8.29
5. Deploy to Base Sepolia:
   - Switch MetaMask to Base Sepolia
   - Click **Deploy & Run Transactions**
   - Select **Injected Provider - MetaMask**
   - Click **Deploy**
   - Confirm transaction in MetaMask
6. **Save the contract address!** (e.g., `0x123...abc`)

### 3.2 Base Sepolia Network Details

Add to MetaMask if not already added:

- **Network Name**: Base Sepolia
- **RPC URL**: `https://sepolia.base.org`
- **Chain ID**: `84532`
- **Currency Symbol**: ETH
- **Block Explorer**: `https://sepolia.basescan.org`

### 3.3 Get Test Tokens

**For Base Sepolia ETH:**
1. Go to [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet)
2. Enter your wallet address
3. Complete captcha
4. Receive 0.1 ETH

**For Base Sepolia USDC:**
1. The USDC contract on Base Sepolia: `0x036CbD53842c5426634e7929541eC2318f3dCF7e`
2. You can mint test USDC from the contract or use a faucet
3. Make sure you have at least 5 USDC for testing

## 🔑 Step 4: Get WalletConnect Project ID

1. Go to [cloud.walletconnect.com](https://cloud.walletconnect.com)
2. Sign up or log in
3. Create new project
4. Name it: "Habit Platform"
5. Copy the **Project ID**

## 🌐 Step 5: Configure Environment Variables

Create `.env` file in the root directory:

```env
# Supabase (from Step 2.3)
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...

# Smart Contract (from Step 3.1)
VITE_CONTRACT_ADDRESS=0x123...abc

# WalletConnect (from Step 4)
VITE_WALLETCONNECT_PROJECT_ID=abc123...

# Optional: IPFS/Pinata for profile images
VITE_PINATA_API_KEY=your_api_key
VITE_PINATA_SECRET_KEY=your_secret
VITE_PINATA_JWT=your_jwt

# Optional: OpenRank for reputation
VITE_OPENRANK_API_KEY=your_api_key
```

Create `backend/.env` file for the event listener:

```env
# Same contract address as frontend
CONTRACT_ADDRESS=0x123...abc

# Supabase SERVICE ROLE key (NOT the anon key!)
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGc... (service_role key)

# RPC URL
BASE_SEPOLIA_RPC=https://sepolia.base.org
```

## ▶️ Step 6: Start the Application

### Start Frontend Development Server

```bash
npm run dev
```

Visit: `http://localhost:3000`

### Start Backend Event Listener

In a separate terminal:

```bash
cd backend
npm start
```

This will monitor blockchain events and sync with Supabase.

## 🧪 Step 7: Test the Platform

### Test User Flow

1. **Connect Wallet**
   - Click "Connect Wallet" on landing page
   - Select MetaMask
   - Approve connection

2. **Complete Onboarding**
   - Select your role (Founder/Builder/Investor)
   - Fill in profile details
   - Add social links (optional)
   - Choose habits and goals
   - Click "Complete Profile"

3. **Discover Users**
   - You'll be redirected to Dashboard
   - Swipe through user profiles
   - Click ❤️ to stake and connect

4. **Stake to Connect**
   - When you click ❤️, you'll be prompted to:
     - Approve USDC spending (first time only)
     - Stake 1 USDC to connect
   - Wait for transaction confirmation

5. **Get Matched**
   - If the other user also stakes for you
   - You'll get a "Match!" notification
   - Chat room will be created automatically

6. **Start Chatting**
   - Go to "Chats" page
   - Select your match
   - Start messaging in real-time!

## 🐛 Troubleshooting

### Issue: "Network Error" when connecting wallet

**Solution**: Make sure MetaMask is on Base Sepolia network

### Issue: "Insufficient USDC balance"

**Solution**: Get more test USDC from faucet or mint from contract

### Issue: "Transaction failed"

**Solution**: 
- Check you have enough Base Sepolia ETH for gas
- Verify contract address is correct
- Try increasing gas limit

### Issue: Profile not loading

**Solution**:
- Check Supabase credentials in `.env`
- Verify database schema was created correctly
- Check browser console for errors

### Issue: Events not syncing

**Solution**:
- Make sure backend event listener is running
- Check `backend/.env` has correct credentials
- Verify contract address matches

## 📦 Production Deployment

### Frontend (Vercel)

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import repository
4. Add environment variables
5. Deploy!

### Backend (Railway/Render)

1. Push backend code to GitHub
2. Go to [railway.app](https://railway.app) or [render.com](https://render.com)
3. Create new service
4. Connect repository
5. Add environment variables
6. Deploy!

### Database

Supabase is already hosted in the cloud - no deployment needed!

## 🎉 Success!

Your Habit Platform should now be fully functional!

### What You've Built:

- ✅ Web3-authenticated user system
- ✅ Role-based profiles (Founders, Builders, Investors)
- ✅ Swipe-to-discover interface
- ✅ Blockchain-based staking mechanism
- ✅ Real-time chat system
- ✅ Reputation leaderboard
- ✅ Automatic event synchronization

### Next Steps:

1. Invite friends to test
2. Add more users to the database
3. Test the full stake → match → chat flow
4. Customize styling to your brand
5. Add more features!

## 📞 Need Help?

- Check the main README.md for more details
- Review the code comments in each file
- Inspect browser console for errors
- Check Supabase logs for database issues
- Verify blockchain transactions on Base Sepolia explorer

## 🚀 Happy Building!

Turn Habits Into Hustle! 💪
