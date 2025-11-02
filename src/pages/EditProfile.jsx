import React, { useState, useRef } from 'react';
import { useAccount } from 'wagmi';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload, User, Save, ArrowLeft } from 'lucide-react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import Input, { TextArea } from '../components/Input';
import { useAuthStore } from '../store/useStore';
import { useUpdateProfile } from '../hooks/useSupabase';
import { uploadProfileImage } from '../utils/imageUpload';
import { getIPFSUrl } from '../utils/helpers';
import { toast } from 'react-hot-toast';

const EditProfile = () => {
  const { address, isConnected } = useAccount();
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();
  const { updateProfile, loading } = useUpdateProfile();
  const fileInputRef = useRef(null);

  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(user?.image_url ? getIPFSUrl(user.image_url) : null);

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

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Please enter your name');
      return;
    }

    try {
      toast.loading('Updating profile...');

      // Upload new image if changed
      let imageUrl = user?.image_url;
      if (profileImage) {
        try {
          imageUrl = await uploadProfileImage(profileImage, address);
          toast.dismiss();
          toast.success('Image uploaded!');
        } catch (imgError) {
          toast.dismiss();
          console.error('Image upload error:', imgError);
          toast.error('Failed to upload image. Continuing without it.');
        }
      }

      // Prepare updated profile data
      const profileData = {
        name: name.trim(),
        bio: bio.trim() || null,
        image_url: imageUrl,
        // Keep existing data
        role: user.role,
        skills: user.skills,
        experience_level: user.experience_level,
        project_name: user.project_name,
        project_description: user.project_description,
        needs: user.needs,
        fund_name: user.fund_name,
        investment_focus: user.investment_focus,
        portfolio_link: user.portfolio_link,
        twitter_handle: user.twitter_handle,
        linkedin_link: user.linkedin_link,
        github_link: user.github_link,
        website: user.website,
        farcaster_handle: user.farcaster_handle,
        daily_habit: user.daily_habit,
        purpose: user.purpose,
        reputation_score: user.reputation_score || 50,
      };

      // Update in Supabase
      const savedProfile = await updateProfile(address, profileData);
      
      // Update auth store
      setUser(savedProfile);

      toast.dismiss();
      toast.success('Profile updated successfully!');
      
      // Navigate back to profile
      setTimeout(() => {
        navigate('/profile');
      }, 1000);
    } catch (error) {
      toast.dismiss();
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile. Please try again.');
    }
  };

  if (!address || !user) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="p-8 text-center">
            <p>Please connect your wallet and complete onboarding</p>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            onClick={() => navigate('/profile')}
            variant="secondary"
            icon={<ArrowLeft className="w-5 h-5" />}
          >
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold gradient-text">Edit Profile</h1>
            <p className="text-grey">Update your information</p>
          </div>
        </div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-8 space-y-6">
            {/* Profile Image Upload */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative group">
                <div className="avatar w-32 h-32 border-4 border-primary/50">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-5xl">
                      <User className="w-16 h-16" />
                    </div>
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Upload className="w-8 h-8" />
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <p className="text-sm text-grey">Click to upload new image (max 5MB)</p>
            </div>

            {/* Name Input */}
            <Input
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
            />

            {/* Bio Input */}
            <TextArea
              label="Bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell others about yourself..."
              rows={4}
            />

            {/* Info Message */}
            <div className="p-4 bg-primary/10 border border-primary/30 rounded-xl">
              <p className="text-sm text-grey">
                💡 To edit other profile details like role, skills, or social links, 
                please contact support or complete onboarding again.
              </p>
            </div>

            {/* Save Button */}
            <Button
              onClick={handleSave}
              disabled={loading}
              icon={<Save className="w-5 h-5" />}
              className="w-full"
              size="lg"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
};

export default EditProfile;
