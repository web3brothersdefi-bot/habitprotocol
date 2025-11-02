import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Clock, Mail, Send, CheckCircle, Users, ExternalLink } from 'lucide-react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import { useAccount } from 'wagmi';
import { supabase, TABLES } from '../config/supabase';
import { useStakeToConnect } from '../hooks/useBaseContract';
import { useIncomingStakes, useOutgoingStakes } from '../hooks/useStakesFinal';
import { getRoleBadgeClass, getRoleIcon, formatAddress, getIPFSUrl } from '../utils/helpers';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const RequestCard = ({ request, isIncoming, onAccept, isAccepting }) => {
  const profile = request.profile;
  const navigate = useNavigate();

  if (!profile) {
    return null;
  }

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
              {profile.image_url ? (
                <img
                  src={getIPFSUrl(profile.image_url)}
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
                {request.timestamp ? 
                  new Date(Number(request.timestamp) * 1000).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  }) : 'Recent'
                }
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
                      <span>Accept (1 USDC)</span>
                    </div>
                  )}
                </Button>
                <Button
                  onClick={() => navigate(`/profile/${profile.wallet_address}`)}
                  variant="secondary"
                  className="text-xs"
                >
                  View Profile
                </Button>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-1 text-sm">
                  {request.matched ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-green-400">Matched!</span>
                    </>
                  ) : (
                    <>
                      <Clock className="w-4 h-4 text-yellow-400" />
                      <span className="text-yellow-400">Pending</span>
                    </>
                  )}
                </div>
                
                {/* If matched, show Chat button, otherwise View Profile */}
                {request.matched ? (
                  <Button
                    onClick={() => navigate(`/chats?with=${profile.wallet_address}`)}
                    className="text-xs bg-gradient-to-r from-primary to-purple-500"
                  >
                    💬 Chat Here
                  </Button>
                ) : (
                  <Button
                    onClick={() => navigate(`/profile/${profile.wallet_address}`)}
                    variant="secondary"
                    className="text-xs"
                  >
                    View Profile
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Stake Info */}
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Stake Amount:</span>
            <span className="text-primary font-semibold">1 USDC</span>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
            <span>Wallet:</span>
            <span className="font-mono">{formatAddress(profile.wallet_address)}</span>
          </div>
          {request.transaction_hash && (
            <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
              <span>Transaction:</span>
              <a 
                href={`https://sepolia.basescan.org/tx/${request.transaction_hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline flex items-center gap-1"
              >
                View <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};

const Requests = () => {
  const [activeTab, setActiveTab] = useState('inbox'); // 'inbox' or 'sent'
  const { address, isConnected } = useAccount();
  const { stakeToConnect, loading: staking } = useStakeToConnect();
  const [acceptingId, setAcceptingId] = useState(null);
  const navigate = useNavigate();

  // Fetch stakes from blockchain
  const { stakes: incomingStakes, loading: incomingLoading, error: incomingError } = useIncomingStakes();
  const { stakes: outgoingStakes, loading: outgoingLoading, error: outgoingError } = useOutgoingStakes();

  // Fetch user profiles for stakes
  const [incomingWithUsers, setIncomingWithUsers] = useState([]);
  const [outgoingWithUsers, setOutgoingWithUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfiles = async () => {
      setLoading(true);
      try {
        // Fetch user profiles for incoming stakes
        if (incomingStakes.length > 0) {
          const incomingWithProfiles = await Promise.all(
            incomingStakes.map(async (stake) => {
              try {
                const { data: user } = await supabase
                  .from(TABLES.USERS)
                  .select('*')
                  .eq('wallet_address', stake.staker_address.toLowerCase())
                  .maybeSingle();
                
                return { 
                  ...stake, 
                  staker_user: user || {
                    wallet_address: stake.staker_address,
                    name: formatAddress(stake.staker_address),
                    role: 'user'
                  }
                };
              } catch (err) {
                return {
                  ...stake,
                  staker_user: {
                    wallet_address: stake.staker_address,
                    name: formatAddress(stake.staker_address),
                    role: 'user'
                  }
                };
              }
            })
          );
          setIncomingWithUsers(incomingWithProfiles);
        } else {
          setIncomingWithUsers([]);
        }

        // Fetch user profiles for outgoing stakes
        if (outgoingStakes.length > 0) {
          const outgoingWithProfiles = await Promise.all(
            outgoingStakes.map(async (stake) => {
              try {
                const { data: user } = await supabase
                  .from(TABLES.USERS)
                  .select('*')
                  .eq('wallet_address', stake.target_address.toLowerCase())
                  .maybeSingle();
                
                return { 
                  ...stake, 
                  target_user: user || {
                    wallet_address: stake.target_address,
                    name: formatAddress(stake.target_address),
                    role: 'user'
                  }
                };
              } catch (err) {
                return {
                  ...stake,
                  target_user: {
                    wallet_address: stake.target_address,
                    name: formatAddress(stake.target_address),
                    role: 'user'
                  }
                };
              }
            })
          );
          setOutgoingWithUsers(outgoingWithProfiles);
        } else {
          setOutgoingWithUsers([]);
        }
      } catch (error) {
        console.error('Error fetching user profiles:', error);
        setIncomingWithUsers([]);
        setOutgoingWithUsers([]);
      } finally {
        setLoading(false);
      }
    };

    if (!incomingLoading && !outgoingLoading) {
      fetchUserProfiles();
    }
  }, [incomingStakes, outgoingStakes, incomingLoading, outgoingLoading]);

  const handleAcceptRequest = async (stake) => {
    if (!stake.staker_user) {
      toast.error('User not found');
      return;
    }

    setAcceptingId(stake.id);
    try {
      toast.loading('Accepting request...', { duration: Infinity });
      
      // Stake to connect with this user (will create match)
      const result = await stakeToConnect(stake.staker_address);
      
      if (result) {
        toast.dismiss();
        toast.success('✅ Request accepted! You are now matched!', { duration: 3000 });
        
        // Refresh stakes after a delay
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    } catch (error) {
      console.error('Error accepting request:', error);
      toast.dismiss();
      toast.error(error.message || 'Failed to accept request');
    } finally {
      setAcceptingId(null);
    }
  };

  const inboxCount = incomingWithUsers.length;
  const sentCount = outgoingWithUsers.length;

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
                      Accept requests by staking 1 USDC. If both users stake, you'll instantly match and can start chatting!
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
            loading ? (
              <Card className="p-12 text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                </div>
                <p className="text-gray-400">Loading incoming requests...</p>
              </Card>
            ) : incomingWithUsers.length === 0 ? (
              <Card className="p-12 text-center">
                <Mail className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No Incoming Requests</h3>
                <p className="text-gray-400 mb-4">
                  No one has sent you a connection request yet.
                </p>
                {incomingError && (
                  <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl max-w-md mx-auto">
                    <p className="text-sm text-red-400">⚠️ Check console for details</p>
                  </div>
                )}
                <div className="mb-6 p-4 bg-primary/10 border border-primary/30 rounded-xl max-w-md mx-auto text-sm text-left">
                  <p className="font-semibold mb-2">💡 Tip:</p>
                  <p className="text-grey">Make sure you're using the wallet that received the stake. Check console to see which addresses have stakes.</p>
                </div>
                <Button onClick={() => navigate('/dashboard')}>
                  Discover Users
                </Button>
              </Card>
            ) : (
              incomingWithUsers.map((stake, index) => (
                <RequestCard
                  key={`incoming-${stake.transaction_hash}-${index}`}
                  request={{ ...stake, profile: stake.staker_user }}
                  isIncoming={true}
                  onAccept={() => handleAcceptRequest(stake)}
                  isAccepting={acceptingId === stake.transaction_hash}
                />
              ))
            )
          ) : (
            loading ? (
              <Card className="p-12 text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                </div>
                <p className="text-gray-400">Loading sent requests...</p>
              </Card>
            ) : outgoingWithUsers.length === 0 ? (
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
              outgoingWithUsers.map((stake, index) => (
                <RequestCard
                  key={`outgoing-${stake.transaction_hash}-${index}`}
                  request={{ ...stake, profile: stake.target_user }}
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
