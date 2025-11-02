/**
 * COMPATIBILITY FILE - Maps old Aptos config to new Base/wagmi config
 * This file exists to maintain compatibility with existing imports
 * All new code should import from './wagmi' instead
 */

import { CONTRACT_ADDRESS, USDC_ADDRESS, STAKE_AMOUNT as WAGMI_STAKE_AMOUNT, REFUND_PERIOD as WAGMI_REFUND_PERIOD, RELEASE_PERIOD as WAGMI_RELEASE_PERIOD } from './wagmi';

// Re-export from wagmi config for backward compatibility
export const MODULE_ADDRESS = CONTRACT_ADDRESS;
export const MODULE_NAME = "stake_match";
export const MODULE_ID = `${MODULE_ADDRESS}::${MODULE_NAME}`;

// Contract constants (converted from Aptos to Base/USDC)
export const STAKE_AMOUNT = WAGMI_STAKE_AMOUNT; // 1 USDC (6 decimals)
export const REFUND_PERIOD = WAGMI_REFUND_PERIOD; // 2 days in seconds
export const RELEASE_PERIOD = WAGMI_RELEASE_PERIOD; // 7 days in seconds
export const PLATFORM_FEE_BPS = 100; // 1% = 100 basis points

// Dummy client for compatibility
export const aptosClient = {
  waitForTransaction: async () => ({ success: true })
};

// Helper functions
export function formatAPT(amount: bigint | number): string {
  const num = typeof amount === 'bigint' ? Number(amount) : amount;
  return (num / 1_000_000).toFixed(2); // USDC has 6 decimals
}

export function aptToOctas(usdc: number): bigint {
  return BigInt(Math.floor(usdc * 1_000_000)); // USDC has 6 decimals
}

export function formatAddress(address: string, chars = 4): string {
  if (!address) return '';
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export function isValidAptosAddress(address: string): boolean {
  // Ethereum addresses are 20 bytes (40 hex chars) with 0x prefix
  const addressRegex = /^0x[a-fA-F0-9]{40}$/;
  return addressRegex.test(address);
}

export function normalizeAddress(address: string): string {
  if (!address.startsWith('0x')) {
    address = '0x' + address;
  }
  return address.toLowerCase();
}

export const TX_OPTIONS = {
  max_gas_amount: "100000",
  gas_unit_price: "1",
};

export const FUNCTIONS = {
  INITIALIZE: 'initialize', // Not used on Base
  STAKE_TO_CONNECT: 'stakeToConnect',
  REFUND_EXPIRED_STAKE: 'refundExpiredStake',
  RELEASE_STAKE: 'releaseStakeAfterMatch',
  GET_STAKE_STATUS: 'getStakeStatus',
  IS_MATCHED: 'isMatched',
  GET_STAKE_AMOUNT: 'STAKE_AMOUNT',
};

export function getExplorerLink(
  type: 'transaction' | 'account' | 'module',
  identifier: string
): string {
  const baseUrl = 'https://sepolia.basescan.org';
  
  switch (type) {
    case 'transaction':
      return `${baseUrl}/tx/${identifier}`;
    case 'account':
    case 'module':
      return `${baseUrl}/address/${identifier}`;
    default:
      return baseUrl;
  }
}

export interface StakeStatus {
  pending: boolean;
  matched: boolean;
  refunded: boolean;
  released: boolean;
}

export interface StakeInfo {
  staker: string;
  target: string;
  amount: bigint;
  timestamp: number;
  status: StakeStatus;
}

export const ERROR_CODES = {
  E_NOT_INITIALIZED: 1,
  E_ALREADY_INITIALIZED: 2,
  E_NO_STAKE_EXISTS: 3,
  E_STAKE_ALREADY_EXISTS: 4,
  E_INSUFFICIENT_BALANCE: 5,
  E_REFUND_PERIOD_NOT_ELAPSED: 6,
  E_RELEASE_PERIOD_NOT_ELAPSED: 7,
  E_NOT_MATCHED: 8,
  E_ALREADY_REFUNDED: 9,
  E_ALREADY_RELEASED: 10,
  E_INVALID_AMOUNT: 11,
  E_UNAUTHORIZED: 12,
};

export function getErrorMessage(code: number): string {
  switch (code) {
    case ERROR_CODES.E_NOT_INITIALIZED:
      return "Contract not initialized";
    case ERROR_CODES.E_ALREADY_INITIALIZED:
      return "Contract already initialized";
    case ERROR_CODES.E_NO_STAKE_EXISTS:
      return "No stake exists";
    case ERROR_CODES.E_STAKE_ALREADY_EXISTS:
      return "Stake already exists";
    case ERROR_CODES.E_INSUFFICIENT_BALANCE:
      return "Insufficient balance";
    case ERROR_CODES.E_REFUND_PERIOD_NOT_ELAPSED:
      return "Refund period not elapsed (wait 2 days)";
    case ERROR_CODES.E_RELEASE_PERIOD_NOT_ELAPSED:
      return "Release period not elapsed (wait 7 days)";
    case ERROR_CODES.E_NOT_MATCHED:
      return "Users not matched";
    case ERROR_CODES.E_ALREADY_REFUNDED:
      return "Stake already refunded";
    case ERROR_CODES.E_ALREADY_RELEASED:
      return "Stake already released";
    case ERROR_CODES.E_INVALID_AMOUNT:
      return "Invalid stake amount (must be 1 USDC)";
    case ERROR_CODES.E_UNAUTHORIZED:
      return "Unauthorized action";
    default:
      return "Unknown error occurred";
  }
}
