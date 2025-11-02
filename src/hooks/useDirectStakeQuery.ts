/**
 * Direct contract storage query - bypasses events
 * Queries stake data directly from contract storage
 */

import { useState, useEffect } from 'react';
import { useAccount, usePublicClient } from 'wagmi';
import { CONTRACT_ADDRESS, STAKE_MATCH_ABI } from '../config/wagmi';

/**
 * Query incoming stakes by checking contract storage directly
 * This is a fallback when event logs don't work
 */
export const useDirectIncomingStakes = (potentialStakers: string[]) => {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const [stakes, setStakes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!address || !publicClient || !potentialStakers.length) {
      setLoading(false);
      return;
    }

    const checkStakes = async () => {
      setLoading(true);
      try {
        console.log('🔍 Checking direct stakes for', potentialStakers.length, 'users');
        
        const stakeChecks = await Promise.all(
          potentialStakers.map(async (stakerAddress) => {
            try {
              // Query contract storage directly
              const result: any = await publicClient.readContract({
                address: CONTRACT_ADDRESS as `0x${string}`,
                abi: STAKE_MATCH_ABI,
                functionName: 'getStakeStatus',
                args: [stakerAddress, address]
              });

              const [status, amount, timestamp] = result;
              
              // Status 1 = Pending (incoming request)
              if (status === 1) {
                console.log('✅ Found stake from', stakerAddress);
                return {
                  staker_address: stakerAddress,
                  target_address: address,
                  amount: amount,
                  timestamp: timestamp,
                  status: status,
                  matched: false
                };
              }
              
              return null;
            } catch (error) {
              console.error('Error checking stake from', stakerAddress, error);
              return null;
            }
          })
        );

        const validStakes = stakeChecks.filter(s => s !== null);
        console.log('📥 Found', validStakes.length, 'incoming stakes');
        setStakes(validStakes);
      } catch (error) {
        console.error('Error in direct stake query:', error);
        setStakes([]);
      } finally {
        setLoading(false);
      }
    };

    checkStakes();
  }, [address, publicClient, JSON.stringify(potentialStakers)]);

  return { stakes, loading };
};

/**
 * Get list of all users to check for potential stakes
 */
export const useAllUserAddresses = () => {
  // This would come from Supabase - all registered users
  // For now, return empty array
  return { addresses: [], loading: false };
};
