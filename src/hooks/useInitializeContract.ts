import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { toast } from 'react-hot-toast';
import { aptosClient, MODULE_ADDRESS } from '../config/aptos';
import { InputTransactionData } from '@aptos-labs/wallet-adapter-core';

/**
 * Hook to initialize the stake_match contract
 * Must be called once after deployment before anyone can stake
 */
export const useInitializeContract = () => {
  const { signAndSubmitTransaction, account } = useWallet();

  const initialize = async () => {
    if (!account) {
      toast.error('Please connect your wallet first');
      return null;
    }

    try {
      console.log('🔧 Initializing contract at:', MODULE_ADDRESS);
      
      // Initialize with contract address as fee wallet
      const payload: InputTransactionData = {
        data: {
          function: `${MODULE_ADDRESS}::stake_match::initialize`,
          typeArguments: [],
          functionArguments: [MODULE_ADDRESS], // fee_wallet = contract address
        },
      };

      toast.loading('Initializing contract... Please approve in Petra');
      
      const response = await signAndSubmitTransaction(payload);
      
      // Wait for transaction confirmation
      const txn = await aptosClient.waitForTransaction({
        transactionHash: response.hash,
      });

      toast.dismiss();

      if (txn.success) {
        toast.success('✅ Contract initialized successfully!');
        console.log('✅ Transaction hash:', response.hash);
        console.log('✅ View on explorer: https://explorer.aptoslabs.com/txn/' + response.hash + '?network=testnet');
        return response.hash;
      } else {
        toast.error('❌ Initialization transaction failed');
        return null;
      }
    } catch (error: any) {
      toast.dismiss();
      console.error('❌ Initialization error:', error);
      
      // Check for specific errors
      if (error.message?.includes('E_ALREADY_INITIALIZED') || 
          error.message?.includes('0x2')) {
        toast.success('✅ Contract already initialized!');
        return 'already_initialized';
      } else if (error.message?.includes('User rejected')) {
        toast.error('Transaction rejected');
      } else {
        toast.error(error.message || 'Failed to initialize contract');
      }
      
      return null;
    }
  };

  return { initialize };
};
