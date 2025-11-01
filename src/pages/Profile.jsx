import React from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { motion } from 'framer-motion';
import { Edit, Twitter, Linkedin, Github, Globe, Sparkles, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import { useAuthStore } from '../store/useStore';
import { formatAddress, getRoleBadgeClass, getRoleIcon, getIPFSUrl, getReputationColor } from '../utils/helpers';

const Profile = () => {
  const { connected, account } = useWallet();
  const address = account?.address;
  const { user } = useAuthStore();
  const navigate = useNavigate();

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
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Header */}
        <Card className="overflow-hidden">
          {/* Banner */}
          <div className="h-32 bg-gradient-to-r from-primary via-primary-light to-primary"></div>

          {/* Profile Info */}
          <div className="p-6 -mt-16">
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-end">
              {/* Avatar */}
              <div className="avatar w-32 h-32 border-4 border-dark-light">
                {user.image_url ? (
                  <img
                    src={getIPFSUrl(user.image_url)}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-5xl">
                    {getRoleIcon(user.role)}
                  </div>
                )}
              </div>

              {/* Name and Role */}
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-bold">{user.name}</h1>
                  <span className={`badge ${getRoleBadgeClass(user.role)}`}>
                    {getRoleIcon(user.role)} {user.role}
                  </span>
                </div>

                <p className="text-grey">{formatAddress(user.wallet_address)}</p>

                {user.bio && (
                  <p className="text-lg">{user.bio}</p>
                )}

                {/* Reputation */}
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-400" />
                  <span className="text-sm">
                    Reputation Score:{' '}
                    <span className={`font-bold ${getReputationColor(user.reputation_score || 50)}`}>
                      {user.reputation_score || 50}
                    </span>
                  </span>
                </div>
              </div>

              {/* Edit Button */}
              <Button
                onClick={() => navigate('/settings')}
                variant="secondary"
                icon={<Edit className="w-5 h-5" />}
              >
                Edit Profile
              </Button>
            </div>
          </div>
        </Card>

        {/* Details Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Role-Specific Info */}
          {user.role === 'founder' && (
            <Card className="p-6 space-y-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                Project
              </h3>
              
              {user.project_name && (
                <div>
                  <p className="text-sm text-grey">Project Name</p>
                  <p className="font-semibold">{user.project_name}</p>
                </div>
              )}

              {user.project_description && (
                <div>
                  <p className="text-sm text-grey">Description</p>
                  <p>{user.project_description}</p>
                </div>
              )}

              {user.needs && user.needs.length > 0 && (
                <div>
                  <p className="text-sm text-grey mb-2">Looking For</p>
                  <div className="flex flex-wrap gap-2">
                    {user.needs.map((need) => (
                      <span key={need} className="badge capitalize">
                        {need}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          )}

          {user.role === 'builder' && (
            <Card className="p-6 space-y-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                Skills
              </h3>

              {user.skills && user.skills.length > 0 && (
                <div>
                  <p className="text-sm text-grey mb-2">Skill Set</p>
                  <div className="flex flex-wrap gap-2">
                    {user.skills.map((skill) => (
                      <span key={skill} className="badge capitalize">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {user.experience_level && (
                <div>
                  <p className="text-sm text-grey">Experience Level</p>
                  <p className="font-semibold capitalize">{user.experience_level}</p>
                </div>
              )}
            </Card>
          )}

          {user.role === 'investor' && (
            <Card className="p-6 space-y-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                Investment
              </h3>

              {user.fund_name && (
                <div>
                  <p className="text-sm text-grey">Fund Name</p>
                  <p className="font-semibold">{user.fund_name}</p>
                </div>
              )}

              {user.investment_focus && (
                <div>
                  <p className="text-sm text-grey">Investment Focus</p>
                  <p>{user.investment_focus}</p>
                </div>
              )}
            </Card>
          )}

          {/* Social Links */}
          <Card className="p-6 space-y-4">
            <h3 className="text-xl font-bold">Social Links</h3>

            <div className="space-y-3">
              {user.twitter_handle && (
                <a
                  href={`https://twitter.com/${user.twitter_handle.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 glass-card hover:bg-white/10 transition-all rounded-xl"
                >
                  <Twitter className="w-5 h-5 text-primary" />
                  <span>{user.twitter_handle}</span>
                </a>
              )}

              {user.linkedin_link && (
                <a
                  href={user.linkedin_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 glass-card hover:bg-white/10 transition-all rounded-xl"
                >
                  <Linkedin className="w-5 h-5 text-primary" />
                  <span>LinkedIn</span>
                </a>
              )}

              {user.github_link && (
                <a
                  href={user.github_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 glass-card hover:bg-white/10 transition-all rounded-xl"
                >
                  <Github className="w-5 h-5 text-primary" />
                  <span>GitHub</span>
                </a>
              )}

              {user.website && (
                <a
                  href={user.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 glass-card hover:bg-white/10 transition-all rounded-xl"
                >
                  <Globe className="w-5 h-5 text-primary" />
                  <span>Website</span>
                </a>
              )}

              {!user.twitter_handle && !user.linkedin_link && !user.github_link && !user.website && (
                <p className="text-grey text-sm">No social links added</p>
              )}
            </div>
          </Card>
        </div>

        {/* Habits & Purpose */}
        {(user.daily_habit || user.purpose) && (
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">Habit Mindset</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {user.daily_habit && (
                <div>
                  <p className="text-sm text-grey mb-2">Daily Habit</p>
                  <p className="font-semibold capitalize">{user.daily_habit}</p>
                </div>
              )}

              {user.purpose && (
                <div>
                  <p className="text-sm text-grey mb-2">Purpose</p>
                  <p className="font-semibold capitalize">{user.purpose.replace('_', ' ')}</p>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Profile;
