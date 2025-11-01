import { useState } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { toast } from 'react-hot-toast';
import {
  aptosClient,
  MODULE_ADDRESS,
  FUNCTIONS,
  STAKE_AMOUNT,
  normalizeAddress,
  getErrorMessage,
  TX_OPTIONS,
} from '../config/aptos';
import { InputTransactionData } from '@aptos-labs/wallet-adapter-core';

/**
 * Hook for staking to connect with another user
 */
export const useStakeToConnect = () => {
  const { account, signAndSubmitTransaction } = useWallet();
  const [loading, setLoading] = useState(false);

  const stakeToConnect = async (targetAddress: string) => {
    if (!account) {
      toast.error('Please connect your wallet');
      return null;
    }

    setLoading(true);
    try {
      const normalizedTarget = normalizeAddress(targetAddress);

      const payload: InputTransactionData = {
        data: {
          function: FUNCTIONS.STAKE_TO_CONNECT as `${string}::${string}::${string}`,
          typeArguments: [],
          functionArguments: [normalizedTarget, MODULE_ADDRESS],
        },
      };

      const response = await signAndSubmitTransaction(payload);
      
      // Wait for transaction confirmation
      const txn = await aptosClient.waitForTransaction({
        transactionHash: response.hash,
      });

      if (txn.success) {
        toast.success('Stake successful! 🎉');
        
        // Record stake in Supabase and check for match
        try {
          const { supabase, TABLES } = await import('../config/supabase');
          const { normalizeAptosAddress } = await import('../utils/helpers');
          
          const normalizedStaker = normalizeAptosAddress(account.address);
          const normalizedTargetForDB = normalizeAptosAddress(targetAddress);
          
          // Record the stake
          await supabase.from(TABLES.STAKES).insert({
            staker: normalizedStaker,
            target: normalizedTargetForDB,
            amount: '0.1',
            status: 'pending',
            tx_hash: response.hash,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

          // Check if target has also staked on us (mutual stake = match)
          const { data: reverseStake } = await supabase
            .from(TABLES.STAKES)
            .select('*')
            .eq('staker', normalizedTargetForDB)
            .eq('target', normalizedStaker)
            .eq('status', 'pending')
            .maybeSingle();

          if (reverseStake) {
            // Both users have staked - create match!
            const [addr1, addr2] = [normalizedStaker, normalizedTargetForDB].sort();
            const chatRoomId = `${addr1}_${addr2}`;

            // Update both stakes to matched
            await supabase
              .from(TABLES.STAKES)
              .update({ status: 'matched' })
              .in('id', [reverseStake.id]);
              
            await supabase
              .from(TABLES.STAKES)
              .update({ status: 'matched' })
              .eq('staker', normalizedStaker)
              .eq('target', normalizedTargetForDB);

            // Create match
            await supabase.from(TABLES.MATCHES).insert({
              user_a: addr1,
              user_b: addr2,
              matched_at: new Date().toISOString(),
              chat_room_id: chatRoomId,
            });

            toast.success('🎉 It\'s a match! You can now chat!', { duration: 5000 });
          }
        } catch (dbError) {
          console.error('Error recording stake in DB:', dbError);
          // Don't fail the whole operation if DB fails
        }
        
        return response.hash;
      } else {
        toast.error('Transaction failed');
        return null;
      }
    } catch (error: any) {
      console.error('Error staking:', error);
      
      // Better error handling
      if (error.message?.includes('User rejected') || error.message?.includes('rejected the request')) {
        toast.error('Transaction rejected by user');
      } else if (error.message?.includes('Module not found') || error.message?.includes('module')) {
        toast.error('Smart contract not found. Please make sure the contract is deployed.');
      } else if (error.transaction?.vm_status?.includes('ABORTED')) {
        const abortCode = parseInt(error.transaction.vm_status.match(/\d+/)?.[0] || '0');
        toast.error(getErrorMessage(abortCode));
      } else if (error.message?.includes('INSUFFICIENT_BALANCE')) {
        toast.error('Insufficient APT balance');
      } else {
        toast.error(error.message || 'Failed to stake');
      }
      
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
  const { account, signAndSubmitTransaction } = useWallet();
  const [loading, setLoading] = useState(false);

  const refundStake = async (targetAddress: string) => {
    if (!account) {
      toast.error('Please connect your wallet');
      return null;
    }

    setLoading(true);
    try {
      const normalizedTarget = normalizeAddress(targetAddress);

      const payload: InputTransactionData = {
        data: {
          function: FUNCTIONS.REFUND_EXPIRED_STAKE as `${string}::${string}::${string}`,
          typeArguments: [],
          functionArguments: [normalizedTarget, MODULE_ADDRESS],
        },
      };

      const response = await signAndSubmitTransaction(payload);
      
      const txn = await aptosClient.waitForTransaction({
        transactionHash: response.hash,
      });

      if (txn.success) {
        toast.success('Stake refunded! 💰');
        return response.hash;
      } else {
        toast.error('Transaction failed');
        return null;
      }
    } catch (error: any) {
      console.error('Error refunding:', error);
      
      if (error.transaction?.vm_status?.includes('ABORTED')) {
        const abortCode = parseInt(error.transaction.vm_status.match(/\d+/)?.[0] || '0');
        toast.error(getErrorMessage(abortCode));
      } else {
        toast.error(error.message || 'Failed to refund');
      }
      
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
  const { account, signAndSubmitTransaction } = useWallet();
  const [loading, setLoading] = useState(false);

  const releaseStake = async (otherUserAddress: string) => {
    if (!account) {
      toast.error('Please connect your wallet');
      return null;
    }

    setLoading(true);
    try {
      const normalizedOther = normalizeAddress(otherUserAddress);

      const payload: InputTransactionData = {
        data: {
          function: FUNCTIONS.RELEASE_STAKE as `${string}::${string}::${string}`,
          typeArguments: [],
          functionArguments: [normalizedOther, MODULE_ADDRESS],
        },
      };

      const response = await signAndSubmitTransaction(payload);
      
      const txn = await aptosClient.waitForTransaction({
        transactionHash: response.hash,
      });

      if (txn.success) {
        toast.success('Stakes released! 🎉');
        return response.hash;
      } else {
        toast.error('Transaction failed');
        return null;
      }
    } catch (error: any) {
      console.error('Error releasing:', error);
      
      if (error.transaction?.vm_status?.includes('ABORTED')) {
        const abortCode = parseInt(error.transaction.vm_status.match(/\d+/)?.[0] || '0');
        toast.error(getErrorMessage(abortCode));
      } else {
        toast.error(error.message || 'Failed to release stakes');
      }
      
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { releaseStake, loading };
};

/**
 * Hook to check stake status
 */
export const useStakeStatus = () => {
  const [loading, setLoading] = useState(false);

  const getStakeStatus = async (
    stakerAddress: string,
    targetAddress: string
  ): Promise<{
    pending: boolean;
    matched: boolean;
    refunded: boolean;
    released: boolean;
  } | null> => {
    setLoading(true);
    try {
      const normalizedStaker = normalizeAddress(stakerAddress);
      const normalizedTarget = normalizeAddress(targetAddress);

      const result = await aptosClient.view({
        payload: {
          function: FUNCTIONS.GET_STAKE_STATUS as `${string}::${string}::${string}`,
          typeArguments: [],
          functionArguments: [MODULE_ADDRESS, normalizedStaker, normalizedTarget],
        },
      });

      return {
        pending: result[0] as boolean,
        matched: result[1] as boolean,
        refunded: result[2] as boolean,
        released: result[3] as boolean,
      };
    } catch (error) {
      console.error('Error fetching stake status:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { getStakeStatus, loading };
};

/**
 * Hook to check if two users are matched
 */
export const useIsMatched = () => {
  const [loading, setLoading] = useState(false);

  const isMatched = async (
    userA: string,
    userB: string
  ): Promise<boolean> => {
    setLoading(true);
    try {
      const normalizedA = normalizeAddress(userA);
      const normalizedB = normalizeAddress(userB);

      const result = await aptosClient.view({
        payload: {
          function: FUNCTIONS.IS_MATCHED as `${string}::${string}::${string}`,
          typeArguments: [],
          functionArguments: [MODULE_ADDRESS, normalizedA, normalizedB],
        },
      });

      return result[0] as boolean;
    } catch (error) {
      console.error('Error checking match status:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { isMatched, loading };
};

/**
 * Hook to get user's APT balance
 */
export const useAptBalance = () => {
  const { account } = useWallet();
  const [balance, setBalance] = useState<string>('0');
  const [loading, setLoading] = useState(false);

  const fetchBalance = async () => {
    if (!account) return;

    setLoading(true);
    try {
      const resources = await aptosClient.getAccountCoinAmount({
        accountAddress: account.address,
        coinType: '0x1::aptos_coin::AptosCoin',
      });

      // Convert from Octas to APT
      const aptAmount = Number(resources) / 100_000_000;
      setBalance(aptAmount.toFixed(2));
    } catch (error) {
      console.error('Error fetching balance:', error);
      setBalance('0');
    } finally {
      setLoading(false);
    }
  };

  return { balance, fetchBalance, loading };
};

/**
 * Hook to get stake amount (for display)
 */
export const useStakeAmount = () => {
  return {
    stakeAmount: Number(STAKE_AMOUNT) / 100_000_000, // Convert to APT
    stakeAmountFormatted: `${Number(STAKE_AMOUNT) / 100_000_000} APT`,
  };
};
