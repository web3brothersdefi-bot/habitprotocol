import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Twitter, Linkedin, Globe, Github } from 'lucide-react';
import Logo from '../../components/Logo';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { useOnboardingStore, useAuthStore } from '../../store/useStore';

const Socials = () => {
  const { address, isConnected } = useAccount();
  const navigate = useNavigate();
  const { formData, updateFormData } = useOnboardingStore();
  const { setOnboardingStep } = useAuthStore();

  const [twitter, setTwitter] = useState(formData.twitter || '');
  const [linkedin, setLinkedin] = useState(formData.linkedin || '');
  const [github, setGithub] = useState(formData.github || '');
  const [website, setWebsite] = useState(formData.website || '');
  const [farcaster, setFarcaster] = useState(formData.farcaster || '');

  const handleNext = () => {
    updateFormData({
      twitter: twitter.trim(),
      linkedin: linkedin.trim(),
      github: github.trim(),
      website: website.trim(),
      farcaster: farcaster.trim(),
    });

    setOnboardingStep(5);
    navigate('/onboarding/habits');
  };

  const handleSkip = () => {
    updateFormData({
      twitter: '',
      linkedin: '',
      github: '',
      website: '',
      farcaster: '',
    });
    
    setOnboardingStep(5);
    navigate('/onboarding/habits');
  };

  const handleBack = () => {
    navigate('/onboarding/details');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl space-y-8">
        <div className="flex justify-center">
          <Logo size="md" showText={true} />
        </div>

        <div className="text-center space-y-2">
          <p className="text-sm text-grey">Step 4 of 5</p>
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((step) => (
              <div
                key={step}
                className={`h-2 rounded-full transition-all duration-300 ${
                  step <= 4 ? 'w-8 bg-primary' : 'w-2 bg-grey/30'
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
            Connect Your Socials
          </h1>
          <p className="text-grey text-lg">
            Help others find and verify you
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-8 space-y-6">
            <Input
              label="Twitter / X Handle"
              placeholder="@username"
              value={twitter}
              onChange={(e) => setTwitter(e.target.value)}
              icon={<Twitter className="w-5 h-5" />}
            />

            <Input
              label="LinkedIn"
              placeholder="linkedin.com/in/username"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              icon={<Linkedin className="w-5 h-5" />}
              type="url"
            />

            {formData.role === 'builder' && (
              <Input
                label="GitHub"
                placeholder="github.com/username"
                value={github}
                onChange={(e) => setGithub(e.target.value)}
                icon={<Github className="w-5 h-5" />}
                type="url"
              />
            )}

            <Input
              label="Farcaster"
              placeholder="@username"
              value={farcaster}
              onChange={(e) => setFarcaster(e.target.value)}
              icon={<div className="w-5 h-5 flex items-center justify-center font-bold text-primary">F</div>}
            />

            <Input
              label="Personal / Project Website"
              placeholder="https://yourwebsite.com"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              icon={<Globe className="w-5 h-5" />}
              type="url"
            />

            <div className="pt-4 text-center">
              <button
                onClick={handleSkip}
                className="text-grey hover:text-white transition-colors text-sm underline"
              >
                Skip for now
              </button>
            </div>
          </Card>
        </motion.div>

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
          
          <Button onClick={handleNext} size="lg" className="flex-1">
            Next →
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Socials;
