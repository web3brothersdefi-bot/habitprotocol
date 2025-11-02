/**
 * Base Contract Hooks - Simplified for Base blockchain
 * Uses wagmi for contract interactions
 */

import { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { toast } from 'react-hot-toast';
import { CONTRACT_ADDRESS, USDC_ADDRESS, STAKE_MATCH_ABI, ERC20_ABI, STAKE_AMOUNT } from '../config/wagmi';

/**
 * Hook for staking to connect with another user
 */
export const useStakeToConnect = () => {
  const { address } = useAccount();
  const { writeContract, data: hash } = useWriteContract();
  const [loading, setLoading] = useState(false);

  const stakeToConnect = async (targetAddress: string) => {
    if (!address) {
      toast.error('Please connect your wallet');
      return null;
    }

    setLoading(true);
    try {
      // Call stakeToConnect function
      writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: STAKE_MATCH_ABI,
        functionName: 'stakeToConnect',
        args: [targetAddress as `0x${string}`],
      });

      toast.success('Stake transaction submitted!');
      return hash;
    } catch (error: any) {
      console.error('Stake error:', error);
      toast.error(error.message || 'Failed to stake');
      return null;
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
 */
export const useApproveUSDC = () => {
  const { address } = useAccount();
  const { writeContract, data: hash } = useWriteContract();
  const [loading, setLoading] = useState(false);

  const approveUSDC = async () => {
    if (!address) {
      toast.error('Please connect your wallet');
      return null;
    }

    setLoading(true);
    try {
      writeContract({
        address: USDC_ADDRESS as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [CONTRACT_ADDRESS as `0x${string}`, STAKE_AMOUNT],
      });

      toast.success('USDC approval submitted!');
      return hash;
    } catch (error: any) {
      console.error('Approval error:', error);
      toast.error(error.message || 'Failed to approve USDC');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { approveUSDC, loading };
};

// Re-export for backward compatibility
export { useStakeToConnect as default };
