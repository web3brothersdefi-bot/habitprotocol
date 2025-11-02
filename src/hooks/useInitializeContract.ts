/**
 * NOTE: This hook is not needed for Base/Ethereum contracts
 * The StakeMatch contract on Base is initialized in the constructor
 * No separate initialization transaction is required
 */
export const useInitializeContract = () => {
  const initialize = async () => {
    console.log('⚠️ Contract initialization not needed on Base');
    console.log('ℹ️ The contract was initialized when deployed');
    return 'not_needed';
  };

  return { initialize };
};
