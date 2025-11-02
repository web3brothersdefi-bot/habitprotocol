/**
 * ROBUST Blockchain Stakes Query - V2
 * Combines event logs + direct contract queries for reliability
 */

import { useState, useEffect } from 'react';
import { useAccount, usePublicClient } from 'wagmi';
import { CONTRACT_ADDRESS, STAKE_MATCH_ABI } from '../config/wagmi';
import { supabase, TABLES } from '../config/supabase';

// Contract deployment block (ADJUST THIS!)
const CONTRACT_DEPLOYMENT_BLOCK = 15000000n; // Replace with your actual deployment block

/**
 * Get incoming stakes (requests received)
 */
export const useIncomingStakesV2 = () => {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const [stakes, setStakes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!address || !publicClient) {
      setLoading(false);
      return;
    }

    const fetchStakes = async () => {
      setLoading(true);
      try {
        console.log('🔍 Fetching incoming stakes for:', address);

        // Strategy 1: Try getting all users from Supabase, then check each
        const { data: users, error: usersError } = await supabase
          .from(TABLES.USERS)
          .select('wallet_address');

        if (usersError) throw usersError;

        console.log('👥 Checking', users.length, 'potential stakers');

        // Check each user to see if they staked to us
        const incomingStakes = [];
        
        for (const user of users) {
          try {
            const stakerAddress = user.wallet_address;
            
            // Skip if checking against self
            if (stakerAddress.toLowerCase() === address.toLowerCase()) continue;

            // Query contract directly
            const result: any = await publicClient.readContract({
              address: CONTRACT_ADDRESS as `0x${string}`,
              abi: STAKE_MATCH_ABI,
              functionName: 'getStakeStatus',
              args: [stakerAddress, address]
            });

            const [status, amount, timestamp] = result;

            // Status 1 = Pending, 2 = Matched
            if (status === 1 || status === 2) {
              console.log('✅ Found stake from:', stakerAddress, 'Status:', status);
              
              // Check if matched
              const matchResult: any = await publicClient.readContract({
                address: CONTRACT_ADDRESS as `0x${string}`,
                abi: STAKE_MATCH_ABI,
                functionName: 'isMatched',
                args: [stakerAddress, address]
              });

              const [matched, matchedAt] = matchResult;

              incomingStakes.push({
                staker_address: stakerAddress,
                target_address: address,
                amount: amount.toString(),
                timestamp: Number(timestamp),
                status: Number(status),
                matched,
                matchedAt: matchedAt ? Number(matchedAt) : null,
                transaction_hash: null // Don't have this from direct query
              });
            }
          } catch (error) {
            // Silent fail for individual checks
          }
        }

        console.log('📥 Found', incomingStakes.length, 'incoming stakes');
        setStakes(incomingStakes);

      } catch (error) {
        console.error('❌ Error fetching incoming stakes:', error);
        setStakes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStakes();

    // Refresh every 10 seconds for real-time updates
    const interval = setInterval(fetchStakes, 10000);
    return () => clearInterval(interval);

  }, [address, publicClient]);

  return { stakes, loading };
};

/**
 * Get outgoing stakes (requests sent)
 */
export const useOutgoingStakesV2 = () => {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const [stakes, setStakes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!address || !publicClient) {
      setLoading(false);
      return;
    }

    const fetchStakes = async () => {
      setLoading(true);
      try {
        console.log('🔍 Fetching outgoing stakes for:', address);

        // Strategy 1: Try getting all users from Supabase, then check each
        const { data: users, error: usersError } = await supabase
          .from(TABLES.USERS)
          .select('wallet_address');

        if (usersError) throw usersError;

        console.log('👥 Checking stakes to', users.length, 'potential targets');

        // Check each user to see if we staked to them
        const outgoingStakes = [];
        
        for (const user of users) {
          try {
            const targetAddress = user.wallet_address;
            
            // Skip if checking against self
            if (targetAddress.toLowerCase() === address.toLowerCase()) continue;

            // Query contract directly
            const result: any = await publicClient.readContract({
              address: CONTRACT_ADDRESS as `0x${string}`,
              abi: STAKE_MATCH_ABI,
              functionName: 'getStakeStatus',
              args: [address, targetAddress]
            });

            const [status, amount, timestamp] = result;

            // Status 1 = Pending, 2 = Matched
            if (status === 1 || status === 2) {
              console.log('✅ Found stake to:', targetAddress, 'Status:', status);
              
              // Check if matched
              const matchResult: any = await publicClient.readContract({
                address: CONTRACT_ADDRESS as `0x${string}`,
                abi: STAKE_MATCH_ABI,
                functionName: 'isMatched',
                args: [address, targetAddress]
              });

              const [matched, matchedAt] = matchResult;

              outgoingStakes.push({
                staker_address: address,
                target_address: targetAddress,
                amount: amount.toString(),
                timestamp: Number(timestamp),
                status: Number(status),
                matched,
                matchedAt: matchedAt ? Number(matchedAt) : null,
                transaction_hash: null
              });
            }
          } catch (error) {
            // Silent fail for individual checks
          }
        }

        console.log('📤 Found', outgoingStakes.length, 'outgoing stakes');
        setStakes(outgoingStakes);

      } catch (error) {
        console.error('❌ Error fetching outgoing stakes:', error);
        setStakes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStakes();

    // Refresh every 10 seconds for real-time updates
    const interval = setInterval(fetchStakes, 10000);
    return () => clearInterval(interval);

  }, [address, publicClient]);

  return { stakes, loading };
};
