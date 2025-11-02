/**
 * V3 Hooks - TEMPORARY: Works with V2 contract + Supabase
 * Will be replaced when V3 contract is deployed
 */

import { useState, useEffect } from 'react';
import { useAccount, usePublicClient } from 'wagmi';
import { CONTRACT_ADDRESS, STAKE_MATCH_ABI } from '../config/wagmi';
import { supabase, TABLES } from '../config/supabase';

/**
 * Get incoming stakes - TEMPORARY V2 implementation
 */
export const useIncomingStakesV3 = () => {
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
        console.log('🔍 TEMP: Fetching incoming stakes for:', address);

        // TEMPORARY: Use V2 function (without profiles)
        const result: any = await publicClient.readContract({
          address: CONTRACT_ADDRESS as `0x${string}`,
          abi: STAKE_MATCH_ABI,
          functionName: 'getActiveIncomingStakes',
          args: [address]
        }).catch(() => []);

        console.log('✅ TEMP: Got', result.length, 'incoming stakes');

        // Format for frontend - profiles already included!
        const formattedStakes = result.map((stake: any) => {
          const fromProfile = stake.fromProfile;
          const imageIPFS = fromProfile.imageIPFS;
          
          return {
            // Stake data
            staker_address: stake.from,
            target_address: stake.to,
            amount: stake.amount.toString(),
            timestamp: Number(stake.timestamp),
            status: Number(stake.status),
            matched: stake.matched,
            matchedAt: stake.matchedAt ? Number(stake.matchedAt) : null,
            transaction_hash: `${stake.from}-${stake.to}`,
            
            // Profile data from contract (no Supabase needed!)
            staker_user: {
              wallet_address: stake.from,
              name: fromProfile.name,
              role: fromProfile.role,
              bio: fromProfile.bio,
              image_url: imageIPFS ? `https://gateway.pinata.cloud/ipfs/${imageIPFS}` : null,
              skills: fromProfile.skills,
              company: fromProfile.company,
              twitter: fromProfile.twitter,
              linkedin: fromProfile.linkedin
            }
          };
        });

        setStakes(formattedStakes);

      } catch (err: any) {
        console.error('❌ V3: Error:', err);
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
 * Get outgoing stakes with profiles from V3 contract
 */
export const useOutgoingStakesV3 = () => {
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
        console.log('🔍 V3: Fetching outgoing stakes for:', address);

        // Single contract call - gets stakes WITH profiles!
        const result: any = await publicClient.readContract({
          address: CONTRACT_ADDRESS as `0x${string}`,
          abi: STAKE_MATCH_ABI,
          functionName: 'getActiveOutgoingStakes',
          args: [address]
        });

        console.log('✅ V3: Got', result.length, 'outgoing stakes with profiles');

        // Format for frontend - profiles already included!
        const formattedStakes = result.map((stake: any) => {
          const toProfile = stake.toProfile;
          const imageIPFS = toProfile.imageIPFS;
          
          return {
            // Stake data
            staker_address: stake.from,
            target_address: stake.to,
            amount: stake.amount.toString(),
            timestamp: Number(stake.timestamp),
            status: Number(stake.status),
            matched: stake.matched,
            matchedAt: stake.matchedAt ? Number(stake.matchedAt) : null,
            transaction_hash: `${stake.from}-${stake.to}`,
            
            // Profile data from contract (no Supabase needed!)
            target_user: {
              wallet_address: stake.to,
              name: toProfile.name,
              role: toProfile.role,
              bio: toProfile.bio,
              image_url: imageIPFS ? `https://gateway.pinata.cloud/ipfs/${imageIPFS}` : null,
              skills: toProfile.skills,
              company: toProfile.company,
              twitter: toProfile.twitter,
              linkedin: toProfile.linkedin
            }
          };
        });

        setStakes(formattedStakes);

      } catch (err: any) {
        console.error('❌ V3: Error:', err);
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
