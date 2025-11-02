import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Code, Palette, Megaphone, Users, Rocket, DollarSign } from 'lucide-react';
import Logo from '../../components/Logo';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input, { TextArea } from '../../components/Input';
import { useOnboardingStore, useAuthStore } from '../../store/useStore';
import { toast } from 'react-hot-toast';

const RoleDetails = () => {
  const { address, isConnected } = useAccount();
  const navigate = useNavigate();
  const { formData, updateFormData } = useOnboardingStore();
  const { setOnboardingStep } = useAuthStore();

  const [projectName, setProjectName] = useState(formData.projectName || '');
  const [projectDescription, setProjectDescription] = useState(formData.projectDescription || '');
  const [needs, setNeeds] = useState(formData.needs || []);
  const [skills, setSkills] = useState(formData.skills || []);
  // Capitalize first letter for display if coming from formData (which is lowercase)
  const [experienceLevel, setExperienceLevel] = useState(
    formData.experienceLevel 
      ? formData.experienceLevel.charAt(0).toUpperCase() + formData.experienceLevel.slice(1)
      : ''
  );
  const [openToProjects, setOpenToProjects] = useState(formData.openToProjects || false);
  const [fundName, setFundName] = useState(formData.fundName || '');
  const [investmentFocus, setInvestmentFocus] = useState(formData.investmentFocus || '');
  const [portfolioLink, setPortfolioLink] = useState(formData.portfolioLink || '');

  const skillOptions = [
    { id: 'developer', icon: Code, label: 'Developer' },
    { id: 'designer', icon: Palette, label: 'Designer' },
    { id: 'marketer', icon: Megaphone, label: 'Marketer' },
    { id: 'writer', icon: Users, label: 'Writer' },
  ];

  const needOptions = [
    { id: 'developers', icon: Code, label: 'Developers' },
    { id: 'designers', icon: Palette, label: 'Designers' },
    { id: 'funding', icon: DollarSign, label: 'Funding' },
    { id: 'marketing', icon: Megaphone, label: 'Marketing' },
  ];

  const experienceLevels = ['Beginner', 'Intermediate', 'Expert'];

  const toggleSelection = (array, setter, value) => {
    if (array.includes(value)) {
      setter(array.filter((item) => item !== value));
    } else {
      setter([...array, value]);
    }
  };

  const handleNext = () => {
    const role = formData.role;

    // Validation based on role
    if (role === 'founder') {
      if (!projectName.trim()) {
        toast.error('Please enter your project name');
        return;
      }
      updateFormData({ projectName, projectDescription, needs });
    } else if (role === 'builder') {
      if (skills.length === 0) {
        toast.error('Please select at least one skill');
        return;
      }
      if (!experienceLevel) {
        toast.error('Please select your experience level');
        return;
      }
      // Convert experience level to lowercase to match database constraint
      updateFormData({ 
        skills, 
        experienceLevel: experienceLevel.toLowerCase(), 
        openToProjects 
      });
    } else if (role === 'investor') {
      updateFormData({ fundName, investmentFocus, portfolioLink });
    }

    setOnboardingStep(4);
    navigate('/onboarding/socials');
  };

  const handleBack = () => {
    navigate('/onboarding/profile');
  };

  const renderFounderForm = () => (
    <div className="space-y-6">
      <Input
        label="Project Name *"
        placeholder="Enter your project name"
        value={projectName}
        onChange={(e) => setProjectName(e.target.value)}
        maxLength={50}
        icon={<Rocket className="w-5 h-5" />}
      />

      <TextArea
        label="What are you building? *"
        placeholder="Describe your project..."
        value={projectDescription}
        onChange={(e) => setProjectDescription(e.target.value)}
        maxLength={200}
        rows={4}
      />

      <div className="space-y-3">
        <label className="block text-sm font-medium text-grey">
          What do you need? (Select all that apply)
        </label>
        <div className="grid grid-cols-2 gap-3">
          {needOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = needs.includes(option.id);
            return (
              <motion.div
                key={option.id}
                whileTap={{ scale: 0.95 }}
              >
                <div
                  onClick={() => toggleSelection(needs, setNeeds, option.id)}
                  className={`glass-card p-4 cursor-pointer transition-all ${
                    isSelected ? 'border-2 border-primary bg-primary/10' : 'hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{option.label}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderBuilderForm = () => (
    <div className="space-y-6">
      <div className="space-y-3">
        <label className="block text-sm font-medium text-grey">
          Skill Set * (Select all that apply)
        </label>
        <div className="grid grid-cols-2 gap-3">
          {skillOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = skills.includes(option.id);
            return (
              <motion.div
                key={option.id}
                whileTap={{ scale: 0.95 }}
              >
                <div
                  onClick={() => toggleSelection(skills, setSkills, option.id)}
                  className={`glass-card p-4 cursor-pointer transition-all ${
                    isSelected ? 'border-2 border-primary bg-primary/10' : 'hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{option.label}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-medium text-grey">
          Experience Level *
        </label>
        <div className="grid grid-cols-3 gap-3">
          {experienceLevels.map((level) => (
            <motion.div
              key={level}
              whileTap={{ scale: 0.95 }}
            >
              <div
                onClick={() => setExperienceLevel(level)}
                className={`glass-card p-4 text-center cursor-pointer transition-all ${
                  experienceLevel === level
                    ? 'border-2 border-primary bg-primary/10'
                    : 'hover:border-white/20'
                }`}
              >
                <span className="font-medium">{level}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="glass-card p-4 flex items-center justify-between">
        <span className="text-grey">Open to new projects?</span>
        <button
          onClick={() => setOpenToProjects(!openToProjects)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            openToProjects ? 'bg-primary' : 'bg-grey/30'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              openToProjects ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
    </div>
  );

  const renderInvestorForm = () => (
    <div className="space-y-6">
      <Input
        label="Fund Name (optional)"
        placeholder="Enter your fund name"
        value={fundName}
        onChange={(e) => setFundName(e.target.value)}
        maxLength={50}
      />

      <TextArea
        label="Investment Focus"
        placeholder="e.g., Early stage, Gaming, Infrastructure, DeFi..."
        value={investmentFocus}
        onChange={(e) => setInvestmentFocus(e.target.value)}
        maxLength={200}
        rows={4}
      />

      <Input
        label="Portfolio Link (optional)"
        placeholder="https://..."
        value={portfolioLink}
        onChange={(e) => setPortfolioLink(e.target.value)}
        type="url"
      />
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl space-y-8">
        <div className="flex justify-center">
          <Logo size="md" showText={true} />
        </div>

        <div className="text-center space-y-2">
          <p className="text-sm text-grey">Step 3 of 5</p>
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((step) => (
              <div
                key={step}
                className={`h-2 rounded-full transition-all duration-300 ${
                  step <= 3 ? 'w-8 bg-primary' : 'w-2 bg-grey/30'
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
            Tell Us More
          </h1>
          <p className="text-grey text-lg">About What You Do</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-8">
            {formData.role === 'founder' && renderFounderForm()}
            {formData.role === 'builder' && renderBuilderForm()}
            {formData.role === 'investor' && renderInvestorForm()}
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

export default RoleDetails;
