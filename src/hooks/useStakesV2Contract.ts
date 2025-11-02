/**
 * Hooks for StakeMatchV2 Contract
 * Uses new getter functions - NO event logs needed!
 */

import { useState, useEffect } from 'react';
import { useAccount, usePublicClient } from 'wagmi';
import { CONTRACT_ADDRESS } from '../config/wagmi';

// V2 Contract ABI - Only the new getter functions
const STAKE_MATCH_V2_ABI = [
  {
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
    "name": "getActiveIncomingStakes",
    "outputs": [{
      "components": [
        {"internalType": "address", "name": "from", "type": "address"},
        {"internalType": "address", "name": "to", "type": "address"},
        {"internalType": "uint256", "name": "amount", "type": "uint256"},
        {"internalType": "uint256", "name": "timestamp", "type": "uint256"},
        {"internalType": "enum StakeMatchV2.StakeStatus", "name": "status", "type": "uint8"},
        {"internalType": "bool", "name": "matched", "type": "bool"},
        {"internalType": "uint256", "name": "matchedAt", "type": "uint256"}
      ],
      "internalType": "struct StakeMatchV2.StakeInfo[]",
      "name": "",
      "type": "tuple[]"
    }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
    "name": "getActiveOutgoingStakes",
    "outputs": [{
      "components": [
        {"internalType": "address", "name": "from", "type": "address"},
        {"internalType": "address", "name": "to", "type": "address"},
        {"internalType": "uint256", "name": "amount", "type": "uint256"},
        {"internalType": "uint256", "name": "timestamp", "type": "uint256"},
        {"internalType": "enum StakeMatchV2.StakeStatus", "name": "status", "type": "uint8"},
        {"internalType": "bool", "name": "matched", "type": "bool"},
        {"internalType": "uint256", "name": "matchedAt", "type": "uint256"}
      ],
      "internalType": "struct StakeMatchV2.StakeInfo[]",
      "name": "",
      "type": "tuple[]"
    }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "target", "type": "address"}],
    "name": "stakeToConnect",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

/**
 * Get incoming stakes (requests received) - V2 Contract
 */
export const useIncomingStakesV2Contract = () => {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const [stakes, setStakes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address || !publicClient) {
      setLoading(false);
      return;
    }

    const fetchStakes = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('🔍 V2: Fetching incoming stakes for:', address);

        // Single contract call - gets ALL incoming stakes!
        const result: any = await publicClient.readContract({
          address: CONTRACT_ADDRESS as `0x${string}`,
          abi: STAKE_MATCH_V2_ABI,
          functionName: 'getActiveIncomingStakes',
          args: [address]
        });

        console.log('✅ V2: Got', result.length, 'incoming stakes');

        // Convert to frontend format
        const formattedStakes = result.map((stake: any) => ({
          staker_address: stake.from,
          target_address: stake.to,
          amount: stake.amount.toString(),
          timestamp: Number(stake.timestamp),
          status: Number(stake.status),
          matched: stake.matched,
          matchedAt: stake.matchedAt ? Number(stake.matchedAt) : null
        }));

        setStakes(formattedStakes);

      } catch (err: any) {
        console.error('❌ V2: Error:', err);
        setError(err.message);
        setStakes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStakes();

    // Auto-refresh every 15 seconds
    const interval = setInterval(fetchStakes, 15000);
    return () => clearInterval(interval);

  }, [address, publicClient]);

  return { stakes, loading, error };
};

/**
 * Get outgoing stakes (requests sent) - V2 Contract
 */
export const useOutgoingStakesV2Contract = () => {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const [stakes, setStakes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address || !publicClient) {
      setLoading(false);
      return;
    }

    const fetchStakes = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('🔍 V2: Fetching outgoing stakes for:', address);

        // Single contract call - gets ALL outgoing stakes!
        const result: any = await publicClient.readContract({
          address: CONTRACT_ADDRESS as `0x${string}`,
          abi: STAKE_MATCH_V2_ABI,
          functionName: 'getActiveOutgoingStakes',
          args: [address]
        });

        console.log('✅ V2: Got', result.length, 'outgoing stakes');

        // Convert to frontend format
        const formattedStakes = result.map((stake: any) => ({
          staker_address: stake.from,
          target_address: stake.to,
          amount: stake.amount.toString(),
          timestamp: Number(stake.timestamp),
          status: Number(stake.status),
          matched: stake.matched,
          matchedAt: stake.matchedAt ? Number(stake.matchedAt) : null
        }));

        setStakes(formattedStakes);

      } catch (err: any) {
        console.error('❌ V2: Error:', err);
        setError(err.message);
        setStakes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStakes();

    // Auto-refresh every 15 seconds
    const interval = setInterval(fetchStakes, 15000);
    return () => clearInterval(interval);

  }, [address, publicClient]);

  return { stakes, loading, error };
};
