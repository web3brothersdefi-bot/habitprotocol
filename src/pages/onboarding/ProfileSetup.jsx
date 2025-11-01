import React, { useState, useRef } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload, User, ChevronLeft } from 'lucide-react';
import Logo from '../../components/Logo';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input, { TextArea } from '../../components/Input';
import { useOnboardingStore, useAuthStore } from '../../store/useStore';
import { toast } from 'react-hot-toast';

const ProfileSetup = () => {
  const { connected, account } = useWallet();
  const address = account?.address;
  const navigate = useNavigate();
  const { formData, updateFormData } = useOnboardingStore();
  const { setOnboardingStep } = useAuthStore();
  const fileInputRef = useRef(null);

  const [name, setName] = useState(formData.name || '');
  const [bio, setBio] = useState(formData.bio || '');
  const [profileImage, setProfileImage] = useState(formData.profileImage || null);
  const [imagePreview, setImagePreview] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNext = () => {
    if (!name.trim()) {
      toast.error('Please enter your name');
      return;
    }

    updateFormData({
      name: name.trim(),
      bio: bio.trim(),
      profileImage,
    });
    
    setOnboardingStep(3);
    navigate('/onboarding/details');
  };

  const handleBack = () => {
    navigate('/onboarding/role');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl space-y-8">
        {/* Logo */}
        <div className="flex justify-center">
          <Logo size="md" showText={true} />
        </div>

        {/* Progress */}
        <div className="text-center space-y-2">
          <p className="text-sm text-grey">Step 2 of 5</p>
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((step) => (
              <div
                key={step}
                className={`h-2 rounded-full transition-all duration-300 ${
                  step <= 2 ? 'w-8 bg-primary' : 'w-2 bg-grey/30'
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
            Let's Set Up Your Profile
          </h1>
          <p className="text-grey text-lg">
            Tell us about yourself
          </p>
        </motion.div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-8 space-y-6">
            {/* Profile Image Upload */}
            <div className="flex flex-col items-center space-y-4">
              <div
                className="relative w-32 h-32 rounded-full border-2 border-dashed border-grey hover:border-primary transition-colors cursor-pointer group"
                onClick={() => fileInputRef.current?.click()}
              >
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                    <User className="w-12 h-12 text-grey" />
                  </div>
                )}
                
                <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Upload className="w-8 h-8 text-white" />
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

              <p className="text-sm text-grey">
                Click to upload profile picture (optional)
              </p>
            </div>

            {/* Name Input */}
            <Input
              label="Display Name *"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
              icon={<User className="w-5 h-5" />}
            />

            {/* Bio Input */}
            <TextArea
              label="Short Bio (optional)"
              placeholder="Tell others about yourself..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={150}
              rows={4}
            />
          </Card>
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
            onClick={handleNext}
            disabled={!name.trim()}
            size="lg"
            className="flex-1"
          >
            Next →
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetup;
