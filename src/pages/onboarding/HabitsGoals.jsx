import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { motion } from 'framer-motion';
import { ChevronLeft, Wrench, Users as UsersIcon, Brain, Rocket, Palette, Target, DollarSign, Eye, Sparkles } from 'lucide-react';
import Logo from '../../components/Logo';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { useOnboardingStore, useAuthStore } from '../../store/useStore';
import { useUpdateProfile } from '../../hooks/useSupabase';
import { toast } from 'react-hot-toast';

const HabitsGoals = () => {
  const navigate = useNavigate();
  const { connected, account } = useWallet();
  const address = account?.address;
  const { formData, updateFormData, resetFormData } = useOnboardingStore();
  const { setOnboardingStep, setUser } = useAuthStore();
  const { updateProfile, loading } = useUpdateProfile();

  const [dailyHabit, setDailyHabit] = useState(formData.dailyHabit || '');
  const [purpose, setPurpose] = useState(formData.purpose || '');

  const habits = [
    { id: 'building', icon: Wrench, label: 'Building' },
    { id: 'networking', icon: UsersIcon, label: 'Networking' },
    { id: 'learning', icon: Brain, label: 'Learning' },
    { id: 'shipping', icon: Rocket, label: 'Shipping' },
    { id: 'creating', icon: Palette, label: 'Creating' },
  ];

  const purposes = [
    { id: 'collaboration', icon: UsersIcon, label: 'Collaboration' },
    { id: 'funding', icon: DollarSign, label: 'Funding' },
    { id: 'exposure', icon: Eye, label: 'Exposure' },
    { id: 'team', icon: Target, label: 'Finding Team' },
    { id: 'exploring', icon: Sparkles, label: 'Exploring Web3' },
  ];

  const handleMint = async () => {
    if (!dailyHabit || !purpose) {
      toast.error('Please select both your habit and purpose');
      return;
    }

    if (!address) {
      toast.error('Please connect your wallet');
      return;
    }

    // Validate required fields
    if (!formData.role) {
      toast.error('Role is missing. Please restart onboarding.');
      navigate('/onboarding/role');
      return;
    }

    if (!formData.name) {
      toast.error('Name is missing. Please complete your profile.');
      navigate('/onboarding/profile');
      return;
    }

    try {
      // Update form data with final values
      updateFormData({ dailyHabit, purpose });

      // Prepare profile data for Supabase with explicit null checks
      const profileData = {
        role: formData.role.trim(),
        name: formData.name.trim(),
        bio: formData.bio?.trim() || null,
        skills: Array.isArray(formData.skills) ? formData.skills : [],
        // Ensure experience_level is lowercase and null if empty
        experience_level: formData.experienceLevel 
          ? formData.experienceLevel.toLowerCase() 
          : null,
        project_name: formData.projectName?.trim() || null,
        project_description: formData.projectDescription?.trim() || null,
        needs: Array.isArray(formData.needs) ? formData.needs : [],
        fund_name: formData.fundName?.trim() || null,
        investment_focus: formData.investmentFocus?.trim() || null,
        portfolio_link: formData.portfolioLink?.trim() || null,
        twitter_handle: formData.twitter?.trim() || null,
        linkedin_link: formData.linkedin?.trim() || null,
        github_link: formData.github?.trim() || null,
        website: formData.website?.trim() || null,
        farcaster_handle: formData.farcaster?.trim() || null,
        daily_habit: dailyHabit,
        purpose: purpose,
        reputation_score: 50,
      };

      // Save to Supabase
      const savedProfile = await updateProfile(address, profileData);

      // Update auth store with saved profile data (includes normalized address)
      setUser(savedProfile);

      // Show success message
      toast.success('Profile created successfully! 🎉');

      // Reset onboarding form
      resetFormData();
      setOnboardingStep(1);

      // Navigate to dashboard
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (error) {
      console.error('Error creating profile:', error);
      toast.error('Failed to create profile. Please try again.');
    }
  };

  const handleBack = () => {
    navigate('/onboarding/socials');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-3xl space-y-8">
        <div className="flex justify-center">
          <Logo size="md" showText={true} />
        </div>

        <div className="text-center space-y-2">
          <p className="text-sm text-grey">Step 5 of 5</p>
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((step) => (
              <div
                key={step}
                className={`h-2 rounded-full transition-all duration-300 ${
                  step <= 5 ? 'w-8 bg-primary' : 'w-2 bg-grey/30'
                }`}
              />
            ))}
          </div>
        </div>

        <motion.div
          className="text-center space-y-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold gradient-text">
            Your Habit Mindset
          </h1>
          <p className="text-grey text-lg">
            What drives you every day?
          </p>
        </motion.div>

        <motion.div
          className="space-y-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Daily Habit */}
          <Card className="p-8 space-y-6">
            <div>
              <h3 className="text-xl font-bold mb-4">
                What's your daily builder habit?
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {habits.map((habit) => {
                  const Icon = habit.icon;
                  const isSelected = dailyHabit === habit.id;

                  return (
                    <motion.div
                      key={habit.id}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div
                        onClick={() => setDailyHabit(habit.id)}
                        className={`glass-card p-4 cursor-pointer transition-all text-center space-y-2 ${
                          isSelected ? 'border-2 border-primary bg-primary/10' : 'hover:border-white/20'
                        }`}
                      >
                        <div className="flex justify-center">
                          <Icon className="w-6 h-6" />
                        </div>
                        <span className="text-sm font-medium block">{habit.label}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </Card>

          {/* Purpose */}
          <Card className="p-8 space-y-6">
            <div>
              <h3 className="text-xl font-bold mb-4">
                Why are you here?
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {purposes.map((item) => {
                  const Icon = item.icon;
                  const isSelected = purpose === item.id;

                  return (
                    <motion.div
                      key={item.id}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div
                        onClick={() => setPurpose(item.id)}
                        className={`glass-card p-4 cursor-pointer transition-all text-center space-y-2 ${
                          isSelected ? 'border-2 border-primary bg-primary/10' : 'hover:border-white/20'
                        }`}
                      >
                        <div className="flex justify-center">
                          <Icon className="w-6 h-6" />
                        </div>
                        <span className="text-sm font-medium block">{item.label}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </Card>

          {/* Profile Summary */}
          {dailyHabit && purpose && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary-light/10 border-primary/30">
                <h3 className="text-lg font-bold mb-4 text-center">
                  🎉 Your Habit Profile Summary
                </h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-grey">Role:</span>
                    <span className="ml-2 font-semibold capitalize">{formData.role}</span>
                  </div>
                  <div>
                    <span className="text-grey">Name:</span>
                    <span className="ml-2 font-semibold">{formData.name}</span>
                  </div>
                  <div>
                    <span className="text-grey">Daily Habit:</span>
                    <span className="ml-2 font-semibold capitalize">{dailyHabit}</span>
                  </div>
                  <div>
                    <span className="text-grey">Purpose:</span>
                    <span className="ml-2 font-semibold capitalize">{purpose.replace('_', ' ')}</span>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </motion.div>

        {/* Navigation Buttons */}
        <div className="flex gap-4">
          <Button
            onClick={handleBack}
            variant="secondary"
            size="lg"
            icon={<ChevronLeft className="w-5 h-5" />}
            className="flex-1"
          >
            Back
          </Button>
          
          <Button
            onClick={handleMint}
            disabled={!dailyHabit || !purpose || loading}
            loading={loading}
            size="lg"
            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
            icon={<Sparkles className="w-5 h-5" />}
          >
            Complete Profile
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HabitsGoals;
