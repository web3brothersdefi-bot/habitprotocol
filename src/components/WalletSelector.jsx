import React, { useState } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, ChevronDown, LogOut } from 'lucide-react';
import { formatAddress } from '../utils/helpers';

const WalletSelector = () => {
  const { connected, account, connect, disconnect, wallets } = useWallet();
  const [isOpen, setIsOpen] = useState(false);

  // Deduplicate wallets by name to avoid duplicate key warnings
  const uniqueWallets = wallets?.reduce((acc, wallet) => {
    const exists = acc.find(w => w.name === wallet.name);
    if (!exists) {
      acc.push(wallet);
    }
    return acc;
  }, []) || [];

  const handleConnect = async (walletName) => {
    try {
      await connect(walletName);
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to connect:', error);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
    } catch (error) {
      console.error('Failed to disconnect:', error);
    }
  };

  if (connected && account) {
    return (
      <div className="relative">
        <motion.button
          className="glass-button flex items-center gap-2 px-4 py-2"
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Wallet className="w-4 h-4" />
          <span className="hidden sm:inline">{formatAddress(account.address)}</span>
          <ChevronDown className="w-4 h-4" />
        </motion.button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="absolute right-0 mt-2 w-48 glass-card rounded-xl p-2 z-50"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <button
                className="w-full flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/10 transition-colors text-left"
                onClick={handleDisconnect}
              >
                <LogOut className="w-4 h-4" />
                <span>Disconnect</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="relative">
      <motion.button
        className="btn-primary flex items-center gap-2"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Wallet className="w-4 h-4" />
        <span>Connect Wallet</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute right-0 mt-2 w-64 glass-card rounded-xl p-4 z-50"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <h3 className="text-sm font-semibold mb-3">Connect Wallet</h3>
            <div className="space-y-2">
              {uniqueWallets.map((wallet, index) => (
                <button
                  key={`${wallet.name}-${index}`}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors text-left"
                  onClick={() => handleConnect(wallet.name)}
                >
                  {wallet.icon && (
                    <img src={wallet.icon} alt={wallet.name} className="w-6 h-6" />
                  )}
                  <span>{wallet.name}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WalletSelector;
