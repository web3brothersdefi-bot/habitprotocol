import React, { useState, useEffect, useMemo } from 'react';
import { useAccount } from 'wagmi';
import { useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { X, Heart, Search, SlidersHorizontal, Sparkles, Zap, User } from 'lucide-react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import { useDiscoverUsers } from '../hooks/useSupabase';
import { useStakeToConnect, useApproveUSDC } from '../hooks/useBaseContract';
import { useStakedAddresses } from '../hooks/useStakesFromBlockchain';
import { useAuthStore } from '../store/useStore';
import { getRoleBadgeClass, getRoleIcon, formatAddress, getIPFSUrl } from '../utils/helpers';
import { toast } from 'react-hot-toast';
import { useReadContract } from 'wagmi';
import { CONTRACT_ADDRESS, USDC_ADDRESS, ERC20_ABI, STAKE_AMOUNT } from '../config/wagmi';

const SwipeCard = ({ user, onSwipe }) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  const handleDragEnd = (event, info) => {
    if (Math.abs(info.offset.x) > 100) {
      onSwipe(info.offset.x > 0 ? 'right' : 'left');
    }
  };

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      style={{ x, rotate, opacity }}
      onDragEnd={handleDragEnd}
      className="absolute w-full max-w-md cursor-grab active:cursor-grabbing"
      whileTap={{ scale: 0.95 }}
    >
      <Card className="overflow-hidden">
        {/* Profile Image */}
        <div className="relative h-96 bg-gradient-to-b from-dark-light to-dark overflow-hidden">
          {user.image_url ? (
            <img
              src={getIPFSUrl(user.image_url)}
              alt={user.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl">
              {getRoleIcon(user.role)}
            </div>
          )}
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/50 to-transparent" />

          {/* Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 space-y-3">
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-bold text-shadow">{user.name}</h2>
              <span className={`badge ${getRoleBadgeClass(user.role)}`}>
                {getRoleIcon(user.role)} {user.role}
              </span>
            </div>

            {user.bio && (
              <p className="text-grey text-sm line-clamp-2 text-shadow">{user.bio}</p>
            )}

            {/* Skills or Tags */}
            {user.skills && user.skills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {user.skills.slice(0, 3).map((skill) => (
                  <span key={skill} className="badge text-xs">
                    {skill}
                  </span>
                ))}
              </div>
            )}

            {/* Reputation Score */}
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span className="text-sm">
                Reputation: <span className="font-semibold text-yellow-400">{user.reputation_score || 50}</span>
              </span>
            </div>

            {/* Wallet Address */}
            <p className="text-xs text-grey">{formatAddress(user.wallet_address)}</p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="p-6 space-y-4">
          {user.project_name && (
            <div>
              <h3 className="font-semibold text-sm text-grey">Project</h3>
              <p>{user.project_name}</p>
            </div>
          )}

          {user.project_description && (
            <div>
              <h3 className="font-semibold text-sm text-grey">About</h3>
              <p className="text-sm">{user.project_description}</p>
            </div>
          )}

          {user.investment_focus && (
            <div>
              <h3 className="font-semibold text-sm text-grey">Investment Focus</h3>
              <p className="text-sm">{user.investment_focus}</p>
            </div>
          )}

          {/* Social Links */}
          {(user.twitter_handle || user.linkedin_link || user.github_link) && (
            <div className="flex gap-3 pt-2">
              {user.twitter_handle && (
                <a
                  href={`https://twitter.com/${user.twitter_handle.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-grey hover:text-primary transition-colors"
                >
                  𝕏
                </a>
              )}
              {user.linkedin_link && (
                <a
                  href={user.linkedin_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-grey hover:text-primary transition-colors"
                >
                  in
                </a>
              )}
              {user.github_link && (
                <a
                  href={user.github_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-grey hover:text-primary transition-colors"
                >
                  gh
                </a>
              )}
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};

const Dashboard = () => {
  const { address, isConnected } = useAccount();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ role: null, skills: [] });
  const [showFilters, setShowFilters] = useState(false);
  const { users: allUsers, loading, refetch: refetchUsers } = useDiscoverUsers(filters);
  const { stakedAddresses, loading: stakesLoading } = useStakedAddresses(); // Blockchain
  const [currentIndex, setCurrentIndex] = useState(0);
  const { stakeToConnect, loading: stakeLoading } = useStakeToConnect();
  const { approveUSDC, loading: approvalLoading } = useApproveUSDC();
  const [isStaking, setIsStaking] = useState(false);
  
  // Check USDC allowance
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: USDC_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: [address, CONTRACT_ADDRESS],
    query: { enabled: !!address }
  });

  // Filter out users we've already staked to (from blockchain)
  const users = useMemo(() => {
    if (!stakedAddresses || stakedAddresses.length === 0) return allUsers;
    
    return allUsers.filter(u => 
      !stakedAddresses.includes(u.wallet_address.toLowerCase())
    );
  }, [allUsers, stakedAddresses]);

  const currentUser = users[currentIndex];

  // Check if user needs to approve USDC
  const needsApproval = allowance ? BigInt(allowance) < STAKE_AMOUNT : true;

  const handleSwipe = async (direction) => {
    if (!currentUser) return;

    if (direction === 'right') {
      // User wants to connect
      try {
        setIsStaking(true);

        // Step 1: Check if USDC approval is needed
        if (needsApproval) {
          toast.loading('Step 1/2: Approving USDC spending...', { duration: Infinity });
          
          try {
            const approvalResult = await approveUSDC();
            
            if (!approvalResult) {
              toast.dismiss();
              toast.error('USDC approval failed');
              setIsStaking(false);
              return;
            }
            
            toast.dismiss();
            toast.success('✅ USDC approved! Now staking...', { duration: 2000 });
            
            // Refresh allowance
            await refetchAllowance();
          } catch (approvalError) {
            toast.dismiss();
            
            if (approvalError.message?.includes('rejected')) {
              toast.error('Approval rejected');
            } else {
              toast.error(approvalError.message || 'Approval failed');
            }
            
            setIsStaking(false);
            return;
          }
        }

        // Step 2: Stake to connect (AUTO-PROCEEDS after approval)
        const stepMessage = needsApproval ? 'Step 2/2: Staking 1 USDC...' : 'Staking 1 USDC...';
        toast.loading(stepMessage, { duration: Infinity });
        
        try {
          const result = await stakeToConnect(currentUser.wallet_address);
          toast.dismiss();
          
          if (result) {
            toast.success('✅ Stake successful! Request sent.', { duration: 3000 });
            
            // Move to next user immediately
            setCurrentIndex((prev) => prev + 1);
            
            // Refresh user list to exclude the staked user
            setTimeout(() => {
              refetchUsers();
            }, 1000);
          } else {
            toast.error('Failed to stake');
          }
        } catch (stakeError) {
          toast.dismiss();
          
          if (stakeError.message?.includes('rejected')) {
            toast.error('Stake rejected');
          } else if (stakeError.message?.includes('insufficient')) {
            toast.error('Insufficient USDC or ETH for gas');
          } else {
            toast.error(stakeError.message || 'Failed to stake');
          }
        }
      } catch (error) {
        console.error('Unexpected error:', error);
        toast.dismiss();
        toast.error('An unexpected error occurred');
      } finally {
        setIsStaking(false);
      }
    } else {
      // User skipped
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleButtonSwipe = (direction) => {
    handleSwipe(direction);
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

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="spinner w-12 h-12"></div>
        </div>
      </Layout>
    );
  }

  if (!currentUser) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="p-8 text-center space-y-4">
            <h2 className="text-2xl font-bold">No more users to discover</h2>
            <p className="text-grey">Check back later for new connections!</p>
            <Button onClick={() => setCurrentIndex(0)}>
              Start Over
            </Button>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Loading Overlay */}
        {isStaking && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
            <Card className="p-8 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
              <p className="text-lg font-semibold">Processing transaction...</p>
              <p className="text-sm text-gray-400 mt-2">Please wait for confirmation</p>
            </Card>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text">Discover</h1>
            <p className="text-grey">Find your next connection</p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="secondary"
              icon={<Search className="w-5 h-5" />}
              className="p-3"
            >
              Search
            </Button>
            <Button
              variant="secondary"
              icon={<SlidersHorizontal className="w-5 h-5" />}
              onClick={() => setShowFilters(!showFilters)}
              className="p-3"
            >
              Filters
            </Button>
          </div>
        </div>


        {/* Filters Panel */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="p-6">
              <h3 className="font-bold mb-4">Filters</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-grey mb-2">Role</label>
                  <div className="flex gap-2">
                    {['founder', 'builder', 'investor'].map((role) => (
                      <button
                        key={role}
                        onClick={() => setFilters({ ...filters, role: role })}
                        className={`px-4 py-2 rounded-lg capitalize transition-all ${
                          filters.role === role
                            ? 'bg-primary text-white'
                            : 'glass-button'
                        }`}
                      >
                        {role}
                      </button>
                    ))}
                    <button
                      onClick={() => setFilters({ ...filters, role: null })}
                      className="px-4 py-2 rounded-lg glass-button"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Swipe Card Stack */}
        <div className="relative flex justify-center items-center min-h-[600px]">
          <SwipeCard user={currentUser} onSwipe={handleSwipe} />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-6 pb-8">
          {/* Pass Button */}
          <motion.button
            onClick={() => handleButtonSwipe('left')}
            disabled={isStaking}
            className="w-16 h-16 rounded-full glass-card flex items-center justify-center hover:bg-red-500/20 hover:border-red-500 transition-all disabled:opacity-50"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <X className="w-8 h-8 text-red-500" />
          </motion.button>

          {/* View Profile Button */}
          <motion.button
            onClick={() => currentUser && navigate(`/profile/${currentUser.wallet_address}`)}
            disabled={isStaking || !currentUser}
            className="w-16 h-16 rounded-full glass-card flex items-center justify-center hover:bg-primary/20 hover:border-primary transition-all disabled:opacity-50"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <User className="w-8 h-8 text-primary" />
          </motion.button>

          {/* Like/Stake Button */}
          <motion.button
            onClick={() => handleButtonSwipe('right')}
            disabled={isStaking}
            className="w-20 h-20 rounded-full glass-card flex items-center justify-center hover:bg-green-500/20 hover:border-green-500 transition-all disabled:opacity-50"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Heart className="w-10 h-10 text-green-500" fill="currentColor" />
          </motion.button>
        </div>

        {/* Info: APT balance check handled automatically by blockchain */}
      </div>
    </Layout>
  );
};

export default Dashboard;
