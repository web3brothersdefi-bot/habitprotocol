import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_ADDRESS, STAKE_MATCH_ABI, USDC_ADDRESS, ERC20_ABI, STAKE_AMOUNT } from '../config/wagmi';
import { toast } from 'react-hot-toast';

/**
 * Hook to check USDC allowance and approve if needed
 */
export const useUSDCApproval = () => {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: USDC_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: address ? [address, CONTRACT_ADDRESS] : undefined,
  });

  const { data: balance } = useReadContract({
    address: USDC_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  const approveUSDC = async () => {
    try {
      const hash = await writeContractAsync({
        address: USDC_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [CONTRACT_ADDRESS, STAKE_AMOUNT],
      });

      toast.success('Approval transaction submitted!');
      
      // Wait for confirmation
      await new Promise((resolve) => {
        const checkInterval = setInterval(async () => {
          await refetchAllowance();
          if (allowance >= STAKE_AMOUNT) {
            clearInterval(checkInterval);
            resolve();
          }
        }, 1000);
      });

      return hash;
    } catch (error) {
      console.error('Approval error:', error);
      toast.error('Failed to approve USDC');
      throw error;
    }
  };

  const needsApproval = allowance < STAKE_AMOUNT;
  const hasBalance = balance >= STAKE_AMOUNT;

  return {
    allowance,
    balance,
    needsApproval,
    hasBalance,
    approveUSDC,
    refetchAllowance,
  };
};

/**
 * Hook to stake to connect with another user
 */
export const useStakeToConnect = () => {
  const { writeContractAsync } = useWriteContract();

  const stakeToConnect = async (targetAddress) => {
    try {
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: STAKE_MATCH_ABI,
        functionName: 'stakeToConnect',
        args: [targetAddress],
      });

      toast.success('Stake transaction submitted!');
      return hash;
    } catch (error) {
      console.error('Stake error:', error);
      toast.error(error.message || 'Failed to stake');
      throw error;
    }
  };

  return { stakeToConnect };
};

/**
 * Hook to get stake status between two users
 */
export const useStakeStatus = (fromAddress, toAddress) => {
  const { data, isLoading, refetch } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: STAKE_MATCH_ABI,
    functionName: 'getStakeStatus',
    args: fromAddress && toAddress ? [fromAddress, toAddress] : undefined,
  });

  return {
    status: data?.[0],
    amount: data?.[1],
    timestamp: data?.[2],
    isLoading,
    refetch,
  };
};

/**
 * Hook to check if two users are matched
 */
export const useMatchStatus = (userA, userB) => {
  const { data, isLoading, refetch } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: STAKE_MATCH_ABI,
    functionName: 'isMatched',
    args: userA && userB ? [userA, userB] : undefined,
  });

  return {
    matched: data?.[0],
    matchedAt: data?.[1],
    released: data?.[2],
    isLoading,
    refetch,
  };
};

/**
 * Hook to refund expired stake
 */
export const useRefundStake = () => {
  const { writeContractAsync } = useWriteContract();

  const refundStake = async (targetAddress) => {
    try {
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: STAKE_MATCH_ABI,
        functionName: 'refundExpiredStake',
        args: [targetAddress],
      });

      toast.success('Refund transaction submitted!');
      return hash;
    } catch (error) {
      console.error('Refund error:', error);
      toast.error(error.message || 'Failed to refund stake');
      throw error;
    }
  };

  return { refundStake };
};

/**
 * Hook to release stake after match period
 */
export const useReleaseStake = () => {
  const { writeContractAsync } = useWriteContract();

  const releaseStake = async (targetAddress) => {
    try {
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: STAKE_MATCH_ABI,
        functionName: 'releaseStakeAfterMatch',
        args: [targetAddress],
      });

      toast.success('Release transaction submitted!');
      return hash;
    } catch (error) {
      console.error('Release error:', error);
      toast.error(error.message || 'Failed to release stake');
      throw error;
    }
  };

  return { releaseStake };
};

/**
 * Hook to wait for transaction confirmation
 */
export const useTransactionStatus = (hash) => {
  const { data, isLoading, isSuccess, isError } = useWaitForTransactionReceipt({
    hash,
  });

  return {
    receipt: data,
    isLoading,
    isSuccess,
    isError,
  };
};
