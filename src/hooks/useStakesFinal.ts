/**
 * FINAL PRODUCTION-READY Stakes Hook
 * Combines event logs + direct queries + proper error handling
 */

import { useState, useEffect } from 'react';
import { useAccount, usePublicClient } from 'wagmi';
import { CONTRACT_ADDRESS, STAKE_MATCH_ABI } from '../config/wagmi';

/**
 * Get stakes where current user is the TARGET (incoming requests)
 */
export const useIncomingStakes = () => {
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
        console.log('🔍 INCOMING: Querying stakes TO:', address);
        
        const currentBlock = await publicClient.getBlockNumber();
        
        // Try multiple block ranges
        const blockRanges = [
          { from: currentBlock - BigInt(10000), to: currentBlock, label: 'Last 10k' },
          { from: currentBlock - BigInt(50000), to: currentBlock, label: 'Last 50k' },
          { from: currentBlock - BigInt(100000), to: currentBlock, label: 'Last 100k' },
        ];

        let allLogs: any[] = [];

        // Try each range until we get results or exhaust options
        for (const range of blockRanges) {
          try {
            console.log(`📊 INCOMING: Trying ${range.label} blocks (${range.from.toString()} → ${currentBlock.toString()})`);
            
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
              // Don't filter by args - get all events and filter manually
              fromBlock: range.from,
              toBlock: range.to
            });

            // Debug: Log all events to see addresses
            console.log('🔍 DEBUG: All events:', logs.map((log: any) => ({
              from: log.args.from,
              to: log.args.to,
              myAddress: address
            })));

            // Manually filter for events where TO = me
            const incomingLogs = logs.filter((log: any) => {
              const toAddress = log.args.to?.toLowerCase();
              const myAddress = address?.toLowerCase();
              console.log(`🔍 Comparing: ${toAddress} === ${myAddress} ? ${toAddress === myAddress}`);
              return toAddress === myAddress;
            });

            console.log(`✅ INCOMING: Found ${logs.length} total events, ${incomingLogs.length} for me in ${range.label}`);
            
            if (incomingLogs.length > 0) {
              allLogs = incomingLogs;
              break; // Got results, stop trying
            }
          } catch (err: any) {
            console.warn(`⚠️ INCOMING: ${range.label} failed:`, err.message);
            // Continue to next range
          }
        }

        // Process logs and get current status
        const stakesWithStatus = await Promise.all(
          allLogs.map(async (log: any) => {
            const stakerAddress = log.args.from;
            
            try {
              // Get current status from contract
              const statusResult: any = await publicClient.readContract({
                address: CONTRACT_ADDRESS as `0x${string}`,
                abi: STAKE_MATCH_ABI,
                functionName: 'getStakeStatus',
                args: [stakerAddress, address]
              });

              const [status, amount, timestamp] = statusResult;

              // Check if matched
              const matchResult: any = await publicClient.readContract({
                address: CONTRACT_ADDRESS as `0x${string}`,
                abi: STAKE_MATCH_ABI,
                functionName: 'isMatched',
                args: [stakerAddress, address]
              });

              const [matched, matchedAt] = matchResult;

              return {
                staker_address: stakerAddress,
                target_address: address,
                amount: amount.toString(),
                timestamp: Number(timestamp),
                status: Number(status),
                matched,
                matchedAt: matchedAt ? Number(matchedAt) : null,
                transaction_hash: log.transactionHash
              };
            } catch (err) {
              console.error('Error checking stake status:', err);
              return null;
            }
          })
        );

        const validStakes = stakesWithStatus.filter((s): s is any => 
          s !== null && (s.status === 1 || s.status === 2) // Pending or Matched
        );

        console.log(`📥 INCOMING: Found ${validStakes.length} active stakes`);
        setStakes(validStakes);

      } catch (err: any) {
        console.error('❌ INCOMING: Error:', err);
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
 * Get stakes where current user is the STAKER (outgoing requests)
 */
export const useOutgoingStakes = () => {
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
        console.log('🔍 OUTGOING: Querying stakes FROM:', address);
        
        const currentBlock = await publicClient.getBlockNumber();
        
        // Try multiple block ranges
        const blockRanges = [
          { from: currentBlock - BigInt(10000), to: currentBlock, label: 'Last 10k' },
          { from: currentBlock - BigInt(50000), to: currentBlock, label: 'Last 50k' },
          { from: currentBlock - BigInt(100000), to: currentBlock, label: 'Last 100k' },
        ];

        let allLogs: any[] = [];

        // Try each range until we get results
        for (const range of blockRanges) {
          try {
            console.log(`📊 OUTGOING: Trying ${range.label} blocks (${range.from.toString()} → ${currentBlock.toString()})`);
            
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
              // Don't filter by args - get all events and filter manually
              fromBlock: range.from,
              toBlock: range.to
            });

            // Manually filter for events where FROM = me
            const outgoingLogs = logs.filter((log: any) => 
              log.args.from.toLowerCase() === address.toLowerCase()
            );

            console.log(`✅ OUTGOING: Found ${logs.length} total events, ${outgoingLogs.length} from me in ${range.label}`);
            
            if (outgoingLogs.length > 0) {
              allLogs = outgoingLogs;
              break; // Got results, stop trying
            }
          } catch (err: any) {
            console.warn(`⚠️ OUTGOING: ${range.label} failed:`, err.message);
            // Continue to next range
          }
        }

        // Process logs and get current status
        const stakesWithStatus = await Promise.all(
          allLogs.map(async (log: any) => {
            const targetAddress = log.args.to;
            
            try {
              // Get current status from contract
              const statusResult: any = await publicClient.readContract({
                address: CONTRACT_ADDRESS as `0x${string}`,
                abi: STAKE_MATCH_ABI,
                functionName: 'getStakeStatus',
                args: [address, targetAddress]
              });

              const [status, amount, timestamp] = statusResult;

              // Check if matched
              const matchResult: any = await publicClient.readContract({
                address: CONTRACT_ADDRESS as `0x${string}`,
                abi: STAKE_MATCH_ABI,
                functionName: 'isMatched',
                args: [address, targetAddress]
              });

              const [matched, matchedAt] = matchResult;

              return {
                staker_address: address,
                target_address: targetAddress,
                amount: amount.toString(),
                timestamp: Number(timestamp),
                status: Number(status),
                matched,
                matchedAt: matchedAt ? Number(matchedAt) : null,
                transaction_hash: log.transactionHash
              };
            } catch (err) {
              console.error('Error checking stake status:', err);
              return null;
            }
          })
        );

        const validStakes = stakesWithStatus.filter((s): s is any => 
          s !== null && (s.status === 1 || s.status === 2) // Pending or Matched
        );

        console.log(`📤 OUTGOING: Found ${validStakes.length} active stakes`);
        setStakes(validStakes);

      } catch (err: any) {
        console.error('❌ OUTGOING: Error:', err);
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
