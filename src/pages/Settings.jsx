import React from 'react';
import { useAccount } from 'wagmi';
import { motion } from 'framer-motion';
import { Wallet, Bell, Shield, LogOut, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import { useAuthStore } from '../store/useStore';
import { formatAddress } from '../utils/helpers';
import { toast } from 'react-hot-toast';

const Settings = () => {
  const { isConnected, account, disconnect } = useWallet();
  const address = account?.address;
  const navigate = useNavigate();
  const { user, clearUser } = useAuthStore();

  const handleLogout = () => {
    disconnect();
    clearUser();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const handleEditProfile = () => {
    navigate('/onboarding/profile');
  };

  if (!address || !user) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="p-8 text-center">
            <p>Please connect your wallet</p>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold gradient-text">Settings</h1>
          <p className="text-grey">Manage your account and preferences</p>
        </div>

        {/* Wallet Section */}
        <Card className="p-6 space-y-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Wallet className="w-5 h-5 text-primary" />
            Wallet
          </h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 glass-card rounded-xl">
              <div>
                <p className="text-sm text-grey">isConnected Address</p>
                <p className="font-semibold font-mono">{formatAddress(address)}</p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(address);
                  toast.success('Address copied!');
                }}
              >
                Copy
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 glass-card rounded-xl">
              <div>
                <p className="text-sm text-grey">Network</p>
                <p className="font-semibold">{chain?.name || 'Unknown'}</p>
              </div>
              {chain?.blockExplorers?.default && (
                <a
                  href={`${chain.blockExplorers.default.url}/address/${address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary-light transition-colors"
                >
                  <ExternalLink className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>
        </Card>

        {/* Profile Section */}
        <Card className="p-6 space-y-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Profile
          </h3>

          <div className="space-y-3">
            <div className="p-4 glass-card rounded-xl">
              <p className="text-sm text-grey mb-2">Display Name</p>
              <p className="font-semibold">{user.name}</p>
            </div>

            <div className="p-4 glass-card rounded-xl">
              <p className="text-sm text-grey mb-2">Role</p>
              <p className="font-semibold capitalize">{user.role}</p>
            </div>

            <Button
              onClick={handleEditProfile}
              variant="outline"
              fullWidth
            >
              Edit Profile
            </Button>
          </div>
        </Card>

        {/* Notifications */}
        <Card className="p-6 space-y-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Notifications
          </h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 glass-card rounded-xl">
              <div>
                <p className="font-semibold">New Matches</p>
                <p className="text-sm text-grey">Get notified when you get a new match</p>
              </div>
              <button
                className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary transition-colors"
              >
                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 glass-card rounded-xl">
              <div>
                <p className="font-semibold">New Messages</p>
                <p className="text-sm text-grey">Get notified about new chat messages</p>
              </div>
              <button
                className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary transition-colors"
              >
                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
              </button>
            </div>
          </div>
        </Card>

        {/* Danger Zone */}
        <Card className="p-6 space-y-4 border-red-500/30">
          <h3 className="text-xl font-bold text-red-400">Danger Zone</h3>

          <div className="space-y-3">
            <Button
              onClick={handleLogout}
              variant="danger"
              fullWidth
              icon={<LogOut className="w-5 h-5" />}
            >
              Disconnect Wallet & Logout
            </Button>

            <p className="text-xs text-grey text-center">
              This will disconnect your wallet and clear your session
            </p>
          </div>
        </Card>

        {/* App Info */}
        <Card className="p-6 text-center">
          <p className="text-sm text-grey">
            Habit Platform v1.0.0
          </p>
          <p className="text-xs text-grey mt-2">
            Powered by Base Blockchain
          </p>
        </Card>
      </div>
    </Layout>
  );
};

export default Settings;
