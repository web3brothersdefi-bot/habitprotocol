# Habit Platform - Web3 Networking for Builders

![Habit Platform](https://img.shields.io/badge/Habit-Platform-4F46E5)
![React](https://img.shields.io/badge/React-18.3-61DAFB)
![Vite](https://img.shields.io/badge/Vite-5.0-646CFF)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-38B2AC)

A decentralized networking platform connecting builders, founders, and investors through verified reputation and mutual stake-based matching on Base blockchain.

## 🌟 Features

- **Web3 Authentication**: Connect with MetaMask, Coinbase Wallet, or WalletConnect
- **Role-Based Profiles**: Founders, Builders, or Investors
- **Stake to Connect**: 1 USDC mutual staking system for genuine connections
- **Swipe Interface**: Tinder-like discovery experience
- **Real-time Chat**: Powered by Supabase Realtime
- **Reputation System**: OpenRank-based verification
- **Modern UI**: Glassmorphism design with responsive layout

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm/yarn
- MetaMask or compatible Web3 wallet
- Supabase account
- Base Sepolia testnet USDC (for testing)

### Installation

1. **Clone the repository**
```bash
cd test4
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**

Create a `.env` file in the root directory:

```env
# Supabase
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Smart Contract (Deploy StakeMatch.sol to Base Sepolia first)
VITE_CONTRACT_ADDRESS=your_deployed_contract_address

# WalletConnect Project ID (Get from https://cloud.walletconnect.com)
VITE_WALLETCONNECT_PROJECT_ID=your_project_id

# Optional: IPFS/Pinata for profile storage
VITE_PINATA_API_KEY=your_pinata_api_key
VITE_PINATA_SECRET_KEY=your_pinata_secret_key
VITE_PINATA_JWT=your_pinata_jwt

# Optional: OpenRank for reputation
VITE_OPENRANK_API_KEY=your_openrank_api_key
```

4. **Set up Supabase Database**

Run the SQL schema in your Supabase SQL editor (see `database/schema.sql`):

```bash
# The schema is provided in the database folder
```

5. **Deploy Smart Contract**

Deploy `contracts/StakeMatch.sol` to Base Sepolia:

```bash
# Using Hardhat, Foundry, or Remix
# Contract Address: 0x... (save this for .env)
```

6. **Start development server**

```bash
npm run dev
```

Visit `http://localhost:3000` in your browser.

## 📦 Project Structure

```
test4/
├── contracts/
│   └── StakeMatch.sol          # Smart contract (1 USDC stake)
├── database/
│   └── schema.sql              # Supabase database schema
├── src/
│   ├── components/             # Reusable UI components
│   │   ├── Logo.jsx
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── Input.jsx
│   │   └── Layout.jsx
│   ├── config/                 # Configuration files
│   │   ├── wagmi.js           # Web3 config
│   │   └── supabase.js        # Database config
│   ├── hooks/                  # Custom React hooks
│   │   ├── useContract.js     # Smart contract hooks
│   │   └── useSupabase.js     # Database hooks
│   ├── pages/                  # Page components
│   │   ├── Landing.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Chats.jsx
│   │   ├── Profile.jsx
│   │   ├── Leaderboard.jsx
│   │   ├── Settings.jsx
│   │   └── onboarding/        # Onboarding flow
│   ├── store/                  # State management (Zustand)
│   │   └── useStore.js
│   ├── utils/                  # Helper functions
│   │   └── helpers.js
│   ├── App.jsx                 # Main app with routing
│   ├── main.jsx               # Entry point
│   └── index.css              # Global styles
├── public/
├── .env.example
├── package.json
├── tailwind.config.js
├── vite.config.js
└── README.md
```

## 🎯 User Flow

1. **Landing Page**: Connect Web3 wallet
2. **Onboarding Step 1**: Select role (Founder/Builder/Investor)
3. **Onboarding Step 2**: Set up profile (name, bio, photo)
4. **Onboarding Step 3**: Role-specific details (skills, projects, etc.)
5. **Onboarding Step 4**: Social links (Twitter, LinkedIn, GitHub)
6. **Onboarding Step 5**: Habits & goals, complete profile
7. **Dashboard**: Swipe to discover users
8. **Stake to Connect**: Both users stake 1 USDC to match
9. **Chat**: Unlocked when mutual stake confirmed
10. **Release**: After 7 days, stakes are released (99% each, 1% platform fee)

## 🔧 Smart Contract Details

- **Network**: Base Sepolia Testnet
- **USDC Address**: `0x036CbD53842c5426634e7929541eC2318f3dCF7e`
- **Stake Amount**: 1 USDC (1,000,000 units with 6 decimals)
- **Refund Period**: 2 days (if no mutual stake)
- **Release Period**: 7 days (after match)
- **Platform Fee**: 1%
- **Fee Wallet**: `0x486b50e142037eBEFF08cB120D0F0462834Dd32c`

### Contract Functions

- `stakeToConnect(address target)` - Stake 1 USDC to connect
- `refundExpiredStake(address target)` - Refund after 2 days
- `releaseStakeAfterMatch(address target)` - Release after 7 days
- `getStakeStatus(from, to)` - Check stake status
- `isMatched(userA, userB)` - Check if matched

## 🗄️ Database Schema

### Tables

1. **users** - User profiles
   - wallet_address (primary key)
   - role, name, bio
   - skills, experience_level
   - social links
   - reputation_score

2. **stakes** - Stake records
   - staker, target
   - amount, status
   - tx_hash

3. **matches** - User matches
   - user_a, user_b
   - matched_at
   - chat_room_id

4. **chats** - Chat messages
   - room_id
   - sender_wallet
   - message, timestamp

5. **reputations** - OpenRank data
   - wallet
   - openrank_data (JSONB)
   - last_updated

## 🎨 Design System

### Colors

- **Primary Blue**: `#4F46E5`
- **Grey**: `#919191`
- **Dark**: `#0F172A`
- **White**: `#FFFFFF`

### Components

- Glassmorphism design with backdrop blur
- Graph pattern background
- Smooth animations with Framer Motion
- Responsive on all devices (mobile-first)

## 🔐 Security Best Practices

- All contract interactions require wallet signature
- USDC approval required before staking
- Funds locked in contract, not controlled by admin
- Profile data stored on IPFS (decentralized)
- Real-time data validation

## 🧪 Testing

### Get Test USDC

1. Visit Base Sepolia Faucet
2. Get some Base ETH for gas
3. Mint test USDC from the token contract
4. Approve and stake!

### Test Flow

```bash
# 1. Connect wallet
# 2. Complete onboarding
# 3. Browse users
# 4. Stake to connect
# 5. Wait for mutual stake
# 6. Chat unlocked!
```

## 📱 Responsive Design

- **Mobile**: Compact view with bottom navigation
- **Tablet**: Optimized layouts
- **Desktop**: Sidebar navigation, larger cards

## 🚢 Deployment

### Frontend (Vercel/Netlify)

```bash
npm run build
# Deploy dist/ folder
```

### Smart Contract (Base Sepolia)

```bash
# Deploy using Hardhat or Foundry
# Update VITE_CONTRACT_ADDRESS in .env
```

### Database (Supabase)

```bash
# Already hosted on Supabase Cloud
# Just run the schema SQL
```

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, TailwindCSS
- **Web3**: Wagmi, RainbowKit, Viem
- **Database**: Supabase (PostgreSQL + Realtime)
- **Smart Contract**: Solidity 0.8.29, OpenZeppelin
- **State**: Zustand
- **Animations**: Framer Motion
- **Storage**: IPFS (Pinata)
- **Reputation**: OpenRank SDK

## 📝 Environment Setup

1. **Supabase**: Create project at supabase.com
2. **WalletConnect**: Get project ID from cloud.walletconnect.com
3. **Pinata**: Sign up at pinata.cloud for IPFS
4. **OpenRank**: Get API key from openrank.com
5. **Base Sepolia**: Add network to MetaMask

## 🤝 Contributing

This is a production-ready codebase. Feel free to:

- Report bugs
- Suggest features
- Submit pull requests
- Improve documentation

## 📄 License

MIT License - feel free to use this project for your own purposes.

## 🙋 Support

If you need help:

1. Check `.env.example` for required variables
2. Verify Supabase schema is correctly set up
3. Ensure smart contract is deployed and address is correct
4. Make sure you have Base Sepolia ETH and USDC

## 🎉 What's Next?

Future enhancements:
- NFT badges for verified profiles
- AI-powered matching recommendations
- Push Protocol for decentralized notifications
- XMTP for decentralized messaging
- DAO governance for platform decisions
- Multi-chain support

---

Built with ❤️ for the Web3 community. Turn Habits Into Hustle! 🚀
