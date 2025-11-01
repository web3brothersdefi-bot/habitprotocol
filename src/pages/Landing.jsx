import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import WalletSelector from '../components/WalletSelector';
import { motion } from 'framer-motion';
import Logo from '../components/Logo';
import { Sparkles, Users, Zap, Shield } from 'lucide-react';
import { useAuthStore } from '../store/useStore';

const Landing = () => {
  const { connected, account } = useWallet();
  const address = account?.address;
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (connected && address) {
      // Check if user exists in store (profile loaded from Supabase)
      if (user && user.name) {
        // Existing user - go to dashboard
        console.log('🚀 Redirecting existing user to dashboard');
        navigate('/dashboard');
      } else {
        // New user - start onboarding
        console.log('📝 New user - starting onboarding');
        navigate('/onboarding/role');
      }
    }
  }, [connected, address, user, navigate]);

  const features = [
    {
      icon: Users,
      title: 'Connect with Builders',
      description: 'Network with founders, developers, and investors in Web3',
    },
    {
      icon: Zap,
      title: 'Stake to Match',
      description: 'Show genuine interest by staking 1 USDC to connect',
    },
    {
      icon: Shield,
      title: 'Verified Reputation',
      description: 'On-chain verification powered by OpenRank',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-4">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary-light/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 2,
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-12">
        {/* Logo and Tagline */}
        <motion.div
          className="flex flex-col items-center gap-6"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Logo size="xl" showText={false} />
          
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-bold gradient-text text-shadow-lg">
              Habit
            </h1>
            <p className="text-xl md:text-2xl text-grey font-medium">
              Your Daily Habit to Make It Big
            </p>
          </div>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          className="text-3xl md:text-4xl font-bold text-white text-shadow"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          Turn Habits Into Hustle
        </motion.p>

        {/* Features */}
        <motion.div
          className="grid md:grid-cols-3 gap-6 mt-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                className="glass-card p-6 text-center space-y-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/20">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">{feature.title}</h3>
                <p className="text-sm text-grey">{feature.description}</p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Connect Button */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          <div className="flex justify-center">
            <WalletSelector />
          </div>

          <p className="text-sm text-grey">
            Powered by Aptos Blockchain
          </p>
          
          <p className="text-xs text-grey-dark max-w-md mx-auto">
            By connecting your wallet, you agree to our Terms of Service and Privacy Policy
          </p>
        </motion.div>

        {/* Floating Animation Elements */}
        <motion.div
          className="absolute top-20 right-20 opacity-20"
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <Sparkles className="w-16 h-16 text-primary" />
        </motion.div>
        
        <motion.div
          className="absolute bottom-20 left-20 opacity-20"
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
        >
          <Zap className="w-16 h-16 text-primary-light" />
        </motion.div>
      </div>
    </div>
  );
};

export default Landing;
