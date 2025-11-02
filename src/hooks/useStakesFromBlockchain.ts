/**
 * Read Stakes from Blockchain - OPTIMIZED FOR PRODUCTION
 * All stake data comes from smart contract with proper block ranges
 */

import { useState, useEffect } from 'react';
import { useAccount, usePublicClient, useReadContract } from 'wagmi';
import { CONTRACT_ADDRESS, STAKE_MATCH_ABI } from '../config/wagmi';

// Contract deployment block on Base Sepolia (adjust if needed)
// Use recent blocks to avoid RPC limits
const getStartBlock = async (publicClient: any) => {
  try {
    const currentBlock = await publicClient.getBlockNumber();
    // Query last 50,000 blocks (well under 100k limit)
    return currentBlock - BigInt(50000);
  } catch (error) {
    console.error('Error getting start block:', error);
    return 'earliest';
  }
};

/**
 * Get all stakes sent BY current user (outgoing)
 * Reads from blockchain events with optimized block range
 */
export const useMyOutgoingStakes = () => {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const [stakes, setStakes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!address || !publicClient) {
      setLoading(false);
      return;
    }

    const fetchOutgoingStakes = async () => {
      setLoading(true);
      try {
        const currentBlock = await publicClient.getBlockNumber();
        const fromBlock = currentBlock - BigInt(100000); // Increased to 100k blocks
        
        console.log('🔍 Querying outgoing stakes:', {
          address,
          fromBlock: fromBlock.toString(),
          currentBlock: currentBlock.toString(),
          contract: CONTRACT_ADDRESS
        });
        
        // Get all "Staked" events where FROM = current user
        const logs = await publicClient.getLogs({
          address: CONTRACT_ADDRESS as `0x${string}`,
          event: {
            type: 'event',
            name: 'Staked',
            inputs: [
              { indexed: true, name: 'from', type: 'address' },
              { indexed: true, name: 'to', type: 'address' },
              { indexed: false, name: 'amount', type: 'uint256' },
              { indexed: false, name: 'timestamp', type: 'uint256' }
            ]
          },
          args: {
            from: address as `0x${string}`
          },
          fromBlock
        });
        
        console.log('📋 Found outgoing logs:', logs.length);

        // For each stake, check status on-chain
        const stakesWithStatus = await Promise.all(
          logs.map(async (log: any) => {
            const targetAddress = log.args.to;
            
            // Call getStakeStatus to get current status
            const stakeStatus: any = await publicClient.readContract({
              address: CONTRACT_ADDRESS as `0x${string}`,
              abi: STAKE_MATCH_ABI,
              functionName: 'getStakeStatus',
              args: [address, targetAddress]
            });

            // Check if matched
            const matchStatus: any = await publicClient.readContract({
              address: CONTRACT_ADDRESS as `0x${string}`,
              abi: STAKE_MATCH_ABI,
              functionName: 'isMatched',
              args: [address, targetAddress]
            });

            return {
              target_address: targetAddress,
              staker_address: address,
              amount: log.args.amount,
              timestamp: log.args.timestamp,
              transaction_hash: log.transactionHash,
              block_number: log.blockNumber,
              status: stakeStatus[0], // 0=None, 1=Active, 2=Refunded, 3=Released
              matched: matchStatus[0],
              matched_at: matchStatus[1],
              released: matchStatus[2]
            };
          })
        );

        // Filter out refunded/released stakes (only show active and matched)
        const activeStakes = stakesWithStatus.filter(
          (stake) => stake.status === 1 || (stake.matched && !stake.released)
        );

        setStakes(activeStakes);
      } catch (error) {
        console.error('Error fetching outgoing stakes:', error);
        setStakes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOutgoingStakes();
  }, [address, publicClient]);

  return { stakes, loading };
};

/**
 * Get all stakes TO current user (incoming)
 * Reads from blockchain events
 */
export const useMyIncomingStakes = () => {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const [stakes, setStakes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!address || !publicClient) {
      setLoading(false);
      return;
    }

    const fetchIncomingStakes = async () => {
      setLoading(true);
      try {
        const currentBlock = await publicClient.getBlockNumber();
        const fromBlock = currentBlock - BigInt(100000); // Increased to 100k blocks
        
        console.log('🔍 Querying incoming stakes:', {
          address,
          fromBlock: fromBlock.toString(),
          currentBlock: currentBlock.toString(),
          contract: CONTRACT_ADDRESS
        });
        
        // Get all "Staked" events where TO = current user
        const logs = await publicClient.getLogs({
          address: CONTRACT_ADDRESS as `0x${string}`,
          event: {
            type: 'event',
            name: 'Staked',
            inputs: [
              { indexed: true, name: 'from', type: 'address' },
              { indexed: true, name: 'to', type: 'address' },
              { indexed: false, name: 'amount', type: 'uint256' },
              { indexed: false, name: 'timestamp', type: 'uint256' }
            ]
          },
          args: {
            to: address as `0x${string}`
          },
          fromBlock
        });
        
        console.log('📋 Found incoming logs:', logs.length);

        // For each stake, check status on-chain
        const stakesWithStatus = await Promise.all(
          logs.map(async (log: any) => {
            const stakerAddress = log.args.from;
            
            // Call getStakeStatus
            const stakeStatus: any = await publicClient.readContract({
              address: CONTRACT_ADDRESS as `0x${string}`,
              abi: STAKE_MATCH_ABI,
              functionName: 'getStakeStatus',
              args: [stakerAddress, address]
            });

            // Check if matched
            const matchStatus: any = await publicClient.readContract({
              address: CONTRACT_ADDRESS as `0x${string}`,
              abi: STAKE_MATCH_ABI,
              functionName: 'isMatched',
              args: [stakerAddress, address]
            });

            return {
              staker_address: stakerAddress,
              target_address: address,
              amount: log.args.amount,
              timestamp: log.args.timestamp,
              transaction_hash: log.transactionHash,
              block_number: log.blockNumber,
              status: stakeStatus[0],
              matched: matchStatus[0],
              matched_at: matchStatus[1],
              released: matchStatus[2]
            };
          })
        );

        // Filter out refunded/released stakes (only show active)
        const activeStakes = stakesWithStatus.filter(
          (stake) => stake.status === 1 && !stake.matched
        );

        setStakes(activeStakes);
      } catch (error) {
        console.error('Error fetching incoming stakes:', error);
        setStakes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchIncomingStakes();
  }, [address, publicClient]);

  return { stakes, loading };
};

/**
 * Get all addresses I've staked to (for exclusion in discover)
 */
export const useStakedAddresses = () => {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const [stakedAddresses, setStakedAddresses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!address || !publicClient) {
      setLoading(false);
      return;
    }

    const fetchStakedAddresses = async () => {
      setLoading(true);
      try {
        const fromBlock = await getStartBlock(publicClient);
        
        // Get all "Staked" events where FROM = current user
        const logs = await publicClient.getLogs({
          address: CONTRACT_ADDRESS as `0x${string}`,
          event: {
            type: 'event',
            name: 'Staked',
            inputs: [
              { indexed: true, name: 'from', type: 'address' },
              { indexed: true, name: 'to', type: 'address' },
              { indexed: false, name: 'amount', type: 'uint256' },
              { indexed: false, name: 'timestamp', type: 'uint256' }
            ]
          },
          args: {
            from: address as `0x${string}`
          },
          fromBlock
        });

        // Extract unique target addresses
        const addresses = logs.map((log: any) => log.args.to.toLowerCase());
        const uniqueAddresses = Array.from(new Set(addresses));

        setStakedAddresses(uniqueAddresses);
      } catch (error) {
        console.error('Error fetching staked addresses:', error);
        setStakedAddresses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStakedAddresses();
  }, [address, publicClient]);

  return { stakedAddresses, loading };
};
