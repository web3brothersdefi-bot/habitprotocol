import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { motion } from 'framer-motion';
import { Crown, Brain, Wallet } from 'lucide-react';
import Logo from '../../components/Logo';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { useOnboardingStore, useAuthStore } from '../../store/useStore';

const RoleSelection = () => {
  const navigate = useNavigate();
  const { formData, updateFormData } = useOnboardingStore();
  const { connected, account } = useWallet();
  const address = account?.address;
  const { setOnboardingStep } = useAuthStore();
  const [selectedRole, setSelectedRole] = useState(formData.role);

  const roles = [
    {
      id: 'founder',
      icon: Crown,
      title: 'Founder',
      description: "You're building something and need a team or support",
      color: 'from-yellow-500 to-orange-500',
    },
    {
      id: 'builder',
      icon: Brain,
      title: 'Builder',
      description: "You've got skills. You build, design, or market great stuff",
      color: 'from-blue-500 to-cyan-500',
    },
    {
      id: 'investor',
      icon: Wallet,
      title: 'VC / Investor',
      description: 'You fund ideas and want to find great teams early',
      color: 'from-green-500 to-emerald-500',
    },
  ];

  const handleNext = () => {
    if (!connected) return;
    
    updateFormData({ role: selectedRole });
    setOnboardingStep(2);
    navigate('/onboarding/profile');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-4xl space-y-8">
        {/* Logo */}
        <div className="flex justify-center">
          <Logo size="md" showText={true} />
        </div>

        {/* Progress */}
        <div className="text-center space-y-2">
          <p className="text-sm text-grey">Step 1 of 5</p>
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((step) => (
              <div
                key={step}
                className={`h-2 rounded-full transition-all duration-300 ${
                  step === 1 ? 'w-8 bg-primary' : 'w-2 bg-grey/30'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Title */}
        <motion.div
          className="text-center space-y-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold gradient-text">
            Who are you?
          </h1>
          <p className="text-grey text-lg">
            Choose your role to get started
          </p>
        </motion.div>

        {/* Role Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {roles.map((role, index) => {
            const Icon = role.icon;
            const isSelected = selectedRole === role.id;

            return (
              <motion.div
                key={role.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className={`p-6 text-center space-y-4 cursor-pointer transition-all duration-300 ${
                    isSelected
                      ? 'border-2 border-primary bg-primary/10 scale-105'
                      : 'hover:border-white/20'
                  }`}
                  onClick={() => setSelectedRole(role.id)}
                >
                  {/* Icon with Gradient Background */}
                  <div className="flex justify-center">
                    <div className="relative">
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${role.color} rounded-2xl blur-lg opacity-50`}
                      />
                      <div
                        className={`relative bg-gradient-to-br ${role.color} rounded-2xl p-4`}
                      >
                        <Icon className="w-12 h-12 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl font-bold">{role.title}</h3>

                  {/* Description */}
                  <p className="text-sm text-grey leading-relaxed">
                    {role.description}
                  </p>

                  {/* Selection Indicator */}
                  {isSelected && (
                    <motion.div
                      className="flex justify-center"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    >
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                        <svg
                          className="w-5 h-5 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                    </motion.div>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Next Button */}
        <div className="flex justify-center pt-4">
          <Button
            onClick={handleNext}
            disabled={!selectedRole}
            size="lg"
            className="px-16"
          >
            Next →
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
