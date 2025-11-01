import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { MODULE_ADDRESS, aptosClient } from '../config/aptos';
import { InputTransactionData } from '@aptos-labs/wallet-adapter-core';
import { toast } from 'react-hot-toast';

/**
 * Initialize the stake_match contract
 * This must be called once after deployment
 */
export async function initializeContract(
  signAndSubmitTransaction: any,
  feeWalletAddress: string = MODULE_ADDRESS
) {
  try {
    console.log('🔧 Initializing contract...');
    
    const payload: InputTransactionData = {
      data: {
        function: `${MODULE_ADDRESS}::stake_match::initialize`,
        typeArguments: [],
        functionArguments: [feeWalletAddress],
      },
    };

    toast.loading('Initializing contract...');
    
    const response = await signAndSubmitTransaction(payload);
    
    // Wait for transaction confirmation
    const txn = await aptosClient.waitForTransaction({
      transactionHash: response.hash,
    });

    toast.dismiss();

    if (txn.success) {
      toast.success('Contract initialized successfully! 🎉');
      console.log('✅ Contract initialized!');
      console.log('Transaction:', response.hash);
      return response.hash;
    } else {
      toast.error('Initialization failed');
      return null;
    }
  } catch (error: any) {
    toast.dismiss();
    console.error('❌ Initialization error:', error);
    
    if (error.message?.includes('E_ALREADY_INITIALIZED')) {
      toast.error('Contract is already initialized');
    } else {
      toast.error(error.message || 'Failed to initialize contract');
    }
    
    return null;
  }
}

/**
 * React Hook for contract initialization
 */
export function useInitializeContract() {
  const { signAndSubmitTransaction, account } = useWallet();

  const initialize = async () => {
    if (!account) {
      toast.error('Please connect your wallet first');
      return null;
    }

    return await initializeContract(signAndSubmitTransaction, MODULE_ADDRESS);
  };

  return { initialize };
}
