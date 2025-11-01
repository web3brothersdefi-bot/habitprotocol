import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Clock, Mail, Send, CheckCircle, Users } from 'lucide-react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import { useIncomingRequests, useOutgoingRequests } from '../hooks/useSupabase';
import { useStakeToConnect } from '../hooks/useAptosContract';
import { getRoleBadgeClass, getRoleIcon, formatAddress, getIPFSUrl } from '../utils/helpers';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const RequestCard = ({ request, isIncoming, onAccept, isAccepting }) => {
  const profile = request.profile;
  const navigate = useNavigate();

  if (!profile) {
    return null;
  }

  const RoleIcon = getRoleIcon(profile.role);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card className="p-6 hover:border-primary/50 transition-all">
        <div className="flex items-start gap-4">
          {/* Profile Image */}
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-dark-light border-2 border-primary/30">
              {profile.profile_image ? (
                <img
                  src={getIPFSUrl(profile.profile_image)}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Users className="w-10 h-10 text-gray-500" />
                </div>
              )}
            </div>
            {isIncoming && (
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                <Heart className="w-4 h-4 text-white" />
              </div>
            )}
          </div>

          {/* User Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold text-white truncate">
                {profile.name}
              </h3>
              <span className={`text-xs px-2 py-1 rounded-full ${getRoleBadgeClass(profile.role)}`}>
                <RoleIcon className="w-3 h-3 inline mr-1" />
                {profile.role}
              </span>
            </div>

            {profile.bio && (
              <p className="text-sm text-gray-400 mb-2 line-clamp-2">
                {profile.bio}
              </p>
            )}

            {profile.company && (
              <p className="text-xs text-gray-500 mb-2">
                📍 {profile.company}
              </p>
            )}

            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              <span>
                {new Date(request.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>

            {/* Tags */}
            {profile.skills && profile.skills.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {profile.skills.slice(0, 3).map((skill, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-2 py-1 bg-primary/10 text-primary rounded"
                  >
                    {skill}
                  </span>
                ))}
                {profile.skills.length > 3 && (
                  <span className="text-xs px-2 py-1 bg-gray-700 text-gray-400 rounded">
                    +{profile.skills.length - 3} more
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2">
            {isIncoming ? (
              <>
                <Button
                  onClick={() => onAccept(request)}
                  disabled={isAccepting}
                  className="bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90"
                >
                  {isAccepting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Accepting...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      <span>Accept (0.1 APT)</span>
                    </div>
                  )}
                </Button>
                <Button
                  onClick={() => navigate(`/profile?address=${profile.wallet_address}`)}
                  variant="secondary"
                  className="text-xs"
                >
                  View Profile
                </Button>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-1 text-yellow-400 text-sm">
                  <Clock className="w-4 h-4" />
                  <span>Pending</span>
                </div>
                <Button
                  onClick={() => navigate(`/profile?address=${profile.wallet_address}`)}
                  variant="secondary"
                  className="text-xs"
                >
                  View Profile
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Stake Info */}
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Stake Amount:</span>
            <span className="text-primary font-semibold">0.1 APT</span>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
            <span>Wallet:</span>
            <span className="font-mono">{formatAddress(profile.wallet_address)}</span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

const Requests = () => {
  const [activeTab, setActiveTab] = useState('inbox'); // 'inbox' or 'sent'
  const { requests: incomingRequests, loading: incomingLoading } = useIncomingRequests();
  const { requests: outgoingRequests, loading: outgoingLoading } = useOutgoingRequests();
  const { stakeToConnect, loading: staking } = useStakeToConnect();
  const [acceptingId, setAcceptingId] = useState(null);
  const navigate = useNavigate();

  const handleAcceptRequest = async (request) => {
    if (!request.profile) {
      toast.error('Profile not found');
      return;
    }

    setAcceptingId(request.id);
    try {
      // Stake to connect with this user
      const result = await stakeToConnect(request.profile.wallet_address);
      
      if (result) {
        toast.success('Request accepted! Checking for match...');
        // The hook will automatically check and create match if both staked
        // Refresh page after a delay to show updated state
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    } catch (error) {
      console.error('Error accepting request:', error);
      toast.error('Failed to accept request');
    } finally {
      setAcceptingId(null);
    }
  };

  const inboxCount = incomingRequests.length;
  const sentCount = outgoingRequests.length;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <Mail className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
              Requests
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Manage your connection requests
            </p>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-2">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('inbox')}
                className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${
                  activeTab === 'inbox'
                    ? 'bg-gradient-to-r from-primary to-purple-500 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-dark-light'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Heart className="w-5 h-5" />
                  <span>Inbox</span>
                  {inboxCount > 0 && (
                    <span className="bg-white/20 text-xs px-2 py-0.5 rounded-full">
                      {inboxCount}
                    </span>
                  )}
                </div>
              </button>
              <button
                onClick={() => setActiveTab('sent')}
                className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${
                  activeTab === 'sent'
                    ? 'bg-gradient-to-r from-primary to-purple-500 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-dark-light'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Send className="w-5 h-5" />
                  <span>Sent</span>
                  {sentCount > 0 && (
                    <span className="bg-white/20 text-xs px-2 py-0.5 rounded-full">
                      {sentCount}
                    </span>
                  )}
                </div>
              </button>
            </div>
          </Card>
        </motion.div>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-4 bg-primary/5 border-primary/30">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Heart className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white mb-1">How it works</h3>
                <p className="text-sm text-gray-400">
                  {activeTab === 'inbox' ? (
                    <>
                      Accept requests by staking 0.1 APT. If both users stake, you'll instantly match and can start chatting!
                    </>
                  ) : (
                    <>
                      Waiting for these users to accept your request. Once they stake back, you'll match automatically!
                    </>
                  )}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Requests List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          {activeTab === 'inbox' ? (
            incomingLoading ? (
              <Card className="p-12 text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                </div>
                <p className="text-gray-400">Loading requests...</p>
              </Card>
            ) : incomingRequests.length === 0 ? (
              <Card className="p-12 text-center">
                <Mail className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No Incoming Requests</h3>
                <p className="text-gray-400 mb-4">
                  No one has sent you a connection request yet.
                </p>
                <Button onClick={() => navigate('/dashboard')}>
                  Discover Users
                </Button>
              </Card>
            ) : (
              incomingRequests.map((request) => (
                <RequestCard
                  key={request.id}
                  request={request}
                  isIncoming={true}
                  onAccept={handleAcceptRequest}
                  isAccepting={acceptingId === request.id}
                />
              ))
            )
          ) : (
            outgoingLoading ? (
              <Card className="p-12 text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                </div>
                <p className="text-gray-400">Loading sent requests...</p>
              </Card>
            ) : outgoingRequests.length === 0 ? (
              <Card className="p-12 text-center">
                <Send className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No Sent Requests</h3>
                <p className="text-gray-400 mb-4">
                  You haven't sent any connection requests yet.
                </p>
                <Button onClick={() => navigate('/dashboard')}>
                  Discover Users
                </Button>
              </Card>
            ) : (
              outgoingRequests.map((request) => (
                <RequestCard
                  key={request.id}
                  request={request}
                  isIncoming={false}
                />
              ))
            )
          )}
        </motion.div>
      </div>
    </Layout>
  );
};

export default Requests;
