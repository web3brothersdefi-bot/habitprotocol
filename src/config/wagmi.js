import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { baseSepolia } from 'wagmi/chains';

// Validate WalletConnect Project ID
const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;

if (!projectId || projectId === 'YOUR_PROJECT_ID') {
  console.warn('⚠️ WalletConnect Project ID not configured. Get one at https://cloud.walletconnect.com');
}

export const wagmiConfig = getDefaultConfig({
  appName: 'Habit Platform',
  projectId: projectId || 'YOUR_PROJECT_ID',
  chains: [baseSepolia],
  ssr: false,
});

export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '0x20E7979abDdE55F098a4Ec77edF2079685278F27';

// Base Sepolia USDC Address
export const USDC_ADDRESS = '0x036CbD53842c5426634e7929541eC2318f3dCF7e';

// Platform fee wallet
export const FEE_WALLET = '0x486b50e142037eBEFF08cB120D0F0462834Dd32c';

// Contract constants
export const STAKE_AMOUNT = BigInt(1 * 1e6); // 1 USDC (6 decimals)
export const REFUND_PERIOD = 2 * 24 * 60 * 60; // 2 days in seconds
export const RELEASE_PERIOD = 7 * 24 * 60 * 60; // 7 days in seconds

// Contract ABI - only the functions we need
export const STAKE_MATCH_ABI = [
  {
    "inputs": [{ "internalType": "address", "name": "target", "type": "address" }],
    "name": "stakeToConnect",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "target", "type": "address" }],
    "name": "refundExpiredStake",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "target", "type": "address" }],
    "name": "releaseStakeAfterMatch",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "from", "type": "address" },
      { "internalType": "address", "name": "to", "type": "address" }
    ],
    "name": "getStakeStatus",
    "outputs": [
      { "internalType": "enum StakeMatch.StakeStatus", "name": "status", "type": "uint8" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "userA", "type": "address" },
      { "internalType": "address", "name": "userB", "type": "address" }
    ],
    "name": "isMatched",
    "outputs": [
      { "internalType": "bool", "name": "matched", "type": "bool" },
      { "internalType": "uint256", "name": "matchedAt", "type": "uint256" },
      { "internalType": "bool", "name": "released", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "from", "type": "address" },
      { "indexed": true, "internalType": "address", "name": "to", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ],
    "name": "Staked",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "userA", "type": "address" },
      { "indexed": true, "internalType": "address", "name": "userB", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ],
    "name": "Matched",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "from", "type": "address" },
      { "indexed": true, "internalType": "address", "name": "to", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "Refunded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "userA", "type": "address" },
      { "indexed": true, "internalType": "address", "name": "userB", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "Released",
    "type": "event"
  }
];

// ERC20 ABI for USDC approval
export const ERC20_ABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "spender", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "approve",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "owner", "type": "address" },
      { "internalType": "address", "name": "spender", "type": "address" }
    ],
    "name": "allowance",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "account", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
];
