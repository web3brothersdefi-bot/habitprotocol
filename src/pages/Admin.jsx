import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Zap, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import { useInitializeContract } from '../hooks/useInitializeContract';
import { MODULE_ADDRESS } from '../config/aptos';

const Admin = () => {
  const { initialize } = useInitializeContract();
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState(null);

  const handleInitialize = async () => {
    setLoading(true);
    setTxHash(null);
    
    try {
      const hash = await initialize();
      if (hash && hash !== 'already_initialized') {
        setTxHash(hash);
      }
    } catch (error) {
      console.error('Initialization failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <Settings className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
              Contract Administration
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Initialize and manage the stake_match contract
            </p>
          </div>
        </motion.div>

        {/* Contract Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              Contract Information
            </h2>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="text-gray-400">Module Address:</span>
                <code className="text-sm bg-dark-light px-3 py-1 rounded font-mono">
                  {MODULE_ADDRESS.slice(0, 10)}...{MODULE_ADDRESS.slice(-8)}
                </code>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="text-gray-400">Network:</span>
                <span className="text-primary font-semibold">Testnet</span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="text-gray-400">Stake Amount:</span>
                <span className="text-green-400 font-semibold">0.1 APT</span>
              </div>

              <div className="flex justify-between items-center py-2">
                <span className="text-gray-400">View on Explorer:</span>
                <a
                  href={`https://explorer.aptoslabs.com/account/${MODULE_ADDRESS}?network=testnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80 flex items-center gap-1 text-sm"
                >
                  Open <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Initialize Contract Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6 bg-gradient-to-br from-primary/5 to-purple-500/5 border-primary/30">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              Initialize Contract
            </h2>
            
            <div className="space-y-4">
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                <p className="text-sm text-yellow-200">
                  ⚠️ <strong>Important:</strong> The contract must be initialized once after deployment before anyone can stake.
                  This creates the StakeRegistry resource on-chain.
                </p>
              </div>

              <div className="space-y-2 text-sm text-gray-300">
                <p><strong>What happens when you initialize:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Creates StakeRegistry at the contract address</li>
                  <li>Sets up escrow for holding stakes</li>
                  <li>Configures fee collection wallet</li>
                  <li>Enables stake_to_connect function</li>
                </ul>
              </div>

              <div className="space-y-2 text-sm text-gray-300 mt-4">
                <p><strong>Requirements:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>✅ Contract deployed to: <code className="text-primary text-xs">{MODULE_ADDRESS.slice(0, 10)}...</code></li>
                  <li>✅ Wallet connected</li>
                  <li>✅ Small amount of APT for gas (~0.001 APT)</li>
                </ul>
              </div>

              {txHash && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-green-200 font-semibold mb-2">Contract initialized successfully!</p>
                      <a
                        href={`https://explorer.aptoslabs.com/txn/${txHash}?network=testnet`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:text-primary/80 flex items-center gap-1"
                      >
                        View transaction <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              )}

              <Button
                onClick={handleInitialize}
                disabled={loading}
                className="w-full mt-4 bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Initializing Contract...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    <span>Initialize Contract Now</span>
                  </div>
                )}
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">What to do next</h2>
            
            <div className="space-y-4 text-sm text-gray-300">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                  1
                </div>
                <div>
                  <p className="font-semibold text-white mb-1">Click "Initialize Contract Now"</p>
                  <p className="text-gray-400">Petra wallet will open asking for approval</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                  2
                </div>
                <div>
                  <p className="font-semibold text-white mb-1">Approve the transaction</p>
                  <p className="text-gray-400">It will cost ~0.001 APT in gas fees</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                  3
                </div>
                <div>
                  <p className="font-semibold text-white mb-1">Wait for confirmation</p>
                  <p className="text-gray-400">Should take 1-2 seconds on Aptos</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-xs font-bold">
                  ✓
                </div>
                <div>
                  <p className="font-semibold text-white mb-1">Done! Start using the platform</p>
                  <p className="text-gray-400">Go to Dashboard and start staking to connect with users</p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Admin;
