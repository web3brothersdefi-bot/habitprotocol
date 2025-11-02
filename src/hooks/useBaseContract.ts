/**
 * Base Contract Hooks - Production Ready with Transaction Waiting
 * Uses wagmi for contract interactions with proper state management
 */

import { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract, usePublicClient } from 'wagmi';
import { getAddress, isAddress } from 'viem';
import { toast } from 'react-hot-toast';
import { CONTRACT_ADDRESS, USDC_ADDRESS, STAKE_MATCH_ABI, ERC20_ABI, STAKE_AMOUNT } from '../config/wagmi';

/**
 * Hook for staking to connect with another user
 * Returns transaction hash and waits for confirmation
 */
export const useStakeToConnect = () => {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();
  const [loading, setLoading] = useState(false);

  const stakeToConnect = async (targetAddress: string) => {
    if (!address) {
      toast.error('Please connect your wallet');
      return null;
    }

    setLoading(true);
    try {
      // Validate and normalize target address
      if (!targetAddress) {
        throw new Error('Target address is required');
      }

      // Ensure address is exactly 42 characters (0x + 40 hex)
      let cleanAddress = targetAddress.trim().toLowerCase();
      
      // If address is longer than 42 characters, truncate to first 42
      if (cleanAddress.length > 42) {
        console.warn('Address too long, truncating:', cleanAddress);
        cleanAddress = cleanAddress.substring(0, 42);
      }
      
      // Validate address format
      if (!isAddress(cleanAddress)) {
        throw new Error('Invalid Ethereum address format');
      }
      
      // Get checksummed address
      const checksummedAddress = getAddress(cleanAddress);
      console.log('Validated address:', checksummedAddress);
      
      // Call stakeToConnect function and wait for tx hash
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: STAKE_MATCH_ABI,
        functionName: 'stakeToConnect',
        args: [checksummedAddress as `0x${string}`],
      });

      console.log('Transaction hash:', hash);
      
      // Wait for transaction confirmation
      if (publicClient) {
        const receipt = await publicClient.waitForTransactionReceipt({ hash });
        console.log('Transaction confirmed:', receipt);
        
        if (receipt.status === 'success') {
          // Stake recorded on-chain! No Supabase needed.
          return hash;
        }
      }
      
      return hash;
    } catch (error: any) {
      console.error('Stake error:', error);
      
      if (error.message?.includes('User rejected') || error.message?.includes('User denied')) {
        throw new Error('Transaction rejected');
      } else if (error.message?.includes('insufficient')) {
        throw new Error('Insufficient USDC or ETH for gas');
      } else {
        throw new Error(error.message || 'Failed to stake');
      }
    } finally {
      setLoading(false);
    }
  };

  return { stakeToConnect, loading };
};

/**
 * Hook for refunding expired stake
 */
export const useRefundStake = () => {
  const { address } = useAccount();
  const { writeContract, data: hash } = useWriteContract();
  const [loading, setLoading] = useState(false);

  const refundStake = async (targetAddress: string) => {
    if (!address) {
      toast.error('Please connect your wallet');
      return null;
    }

    setLoading(true);
    try {
      writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: STAKE_MATCH_ABI,
        functionName: 'refundExpiredStake',
        args: [targetAddress as `0x${string}`],
      });

      toast.success('Refund transaction submitted!');
      return hash;
    } catch (error: any) {
      console.error('Refund error:', error);
      toast.error(error.message || 'Failed to refund');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { refundStake, loading };
};

/**
 * Hook for releasing matched stakes
 */
export const useReleaseStake = () => {
  const { address } = useAccount();
  const { writeContract, data: hash } = useWriteContract();
  const [loading, setLoading] = useState(false);

  const releaseStake = async (targetAddress: string) => {
    if (!address) {
      toast.error('Please connect your wallet');
      return null;
    }

    setLoading(true);
    try {
      writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: STAKE_MATCH_ABI,
        functionName: 'releaseStakeAfterMatch',
        args: [targetAddress as `0x${string}`],
      });

      toast.success('Release transaction submitted!');
      return hash;
    } catch (error: any) {
      console.error('Release error:', error);
      toast.error(error.message || 'Failed to release');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { releaseStake, loading };
};

/**
 * Hook for checking stake status
 */
export const useStakeStatus = (fromAddress?: string, toAddress?: string) => {
  const { data: stakeStatus } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: STAKE_MATCH_ABI,
    functionName: 'getStakeStatus',
    args: [fromAddress as `0x${string}`, toAddress as `0x${string}`],
    query: {
      enabled: !!fromAddress && !!toAddress,
    },
  });

  return { stakeStatus };
};

/**
 * Hook for checking if users are matched
 */
export const useIsMatched = (userA?: string, userB?: string) => {
  const { data: matchData } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: STAKE_MATCH_ABI,
    functionName: 'isMatched',
    args: [userA as `0x${string}`, userB as `0x${string}`],
    query: {
      enabled: !!userA && !!userB,
    },
  });

  return { matchData };
};

/**
 * Hook for approving USDC spending
 * Waits for transaction confirmation before returning
 */
export const useApproveUSDC = () => {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();
  const [loading, setLoading] = useState(false);

  const approveUSDC = async () => {
    if (!address) {
      toast.error('Please connect your wallet');
      return null;
    }

    setLoading(true);
    try {
      // Call approve function and wait for tx hash
      const hash = await writeContractAsync({
        address: USDC_ADDRESS as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [CONTRACT_ADDRESS as `0x${string}`, STAKE_AMOUNT],
      });

      console.log('Approval hash:', hash);
      
      // Wait for transaction confirmation
      if (publicClient) {
        const receipt = await publicClient.waitForTransactionReceipt({ hash });
        console.log('Approval confirmed:', receipt);
        
        if (receipt.status === 'success') {
          return hash;
        }
      }
      
      return hash;
    } catch (error: any) {
      console.error('Approval error:', error);
      
      if (error.message?.includes('User rejected') || error.message?.includes('User denied')) {
        throw new Error('Approval rejected');
      } else {
        throw new Error(error.message || 'Failed to approve USDC');
      }
    } finally {
      setLoading(false);
    }
  };

  return { approveUSDC, loading };
};

// Re-export for backward compatibility
export { useStakeToConnect as default };
