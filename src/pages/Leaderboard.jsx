import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award, TrendingUp } from 'lucide-react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import { supabase, TABLES } from '../config/supabase';
import { useAuthStore } from '../store/useStore';
import { getRoleBadgeClass, getRoleIcon, getIPFSUrl, formatAddress, normalizeAptosAddress } from '../utils/helpers';

const Leaderboard = () => {
  const { address, isConnected } = useAccount();
  const { user } = useAuthStore();
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchLeaderboard();
  }, [filter]);

  const fetchLeaderboard = async () => {
    try {
      let query = supabase
        .from(TABLES.USERS)
        .select('*')
        .order('reputation_score', { ascending: false })
        .limit(50);

      if (filter !== 'all') {
        query = query.eq('role', filter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setLeaders(data || []);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-300" />;
    if (rank === 3) return <Award className="w-6 h-6 text-orange-400" />;
    return <span className="text-grey font-bold">#{rank}</span>;
  };

  const getRankBgColor = (rank) => {
    if (rank === 1) return 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30';
    if (rank === 2) return 'from-gray-400/20 to-gray-500/20 border-gray-400/30';
    if (rank === 3) return 'from-orange-500/20 to-orange-600/20 border-orange-500/30';
    return '';
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
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold gradient-text flex items-center justify-center gap-3">
            <Trophy className="w-10 h-10 text-primary" />
            Leaderboard
          </h1>
          <p className="text-grey">Top builders, founders, and investors</p>
        </div>

        {/* Filters */}
        <Card className="p-6">
          <div className="flex flex-wrap gap-3 justify-center">
            {['all', 'founder', 'builder', 'investor'].map((roleFilter) => (
              <button
                key={roleFilter}
                onClick={() => setFilter(roleFilter)}
                className={`px-6 py-2 rounded-xl capitalize font-semibold transition-all ${
                  filter === roleFilter
                    ? 'bg-primary text-white'
                    : 'glass-button'
                }`}
              >
                {roleFilter}
              </button>
            ))}
          </div>
        </Card>

        {/* Leaderboard List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="spinner w-12 h-12"></div>
          </div>
        ) : leaders.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-grey">No users found</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {leaders.map((leader, index) => {
              const rank = index + 1;
              const isCurrentUser = normalizeAptosAddress(leader.wallet_address) === normalizeAptosAddress(address);

              return (
                <motion.div
                  key={leader.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card
                    className={`p-6 ${
                      rank <= 3 ? `bg-gradient-to-r ${getRankBgColor(rank)}` : ''
                    } ${
                      isCurrentUser ? 'border-2 border-primary' : ''
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Rank */}
                      <div className="w-12 flex items-center justify-center">
                        {getRankIcon(rank)}
                      </div>

                      {/* Avatar */}
                      <div className="avatar w-12 h-12">
                        {leader.image_url ? (
                          <img
                            src={getIPFSUrl(leader.image_url)}
                            alt={leader.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-xl">
                            {getRoleIcon(leader.role)}
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-lg truncate">
                            {leader.name}
                            {isCurrentUser && (
                              <span className="ml-2 text-sm text-primary">(You)</span>
                            )}
                          </h3>
                          <span className={`badge ${getRoleBadgeClass(leader.role)} text-xs`}>
                            {getRoleIcon(leader.role)} {leader.role}
                          </span>
                        </div>
                        <p className="text-sm text-grey truncate">
                          {formatAddress(leader.wallet_address)}
                        </p>
                      </div>

                      {/* Reputation Score */}
                      <div className="text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <TrendingUp className="w-5 h-5 text-green-400" />
                          <span className="text-2xl font-bold text-green-400">
                            {leader.reputation_score || 50}
                          </span>
                        </div>
                        <p className="text-xs text-grey">Reputation</p>
                      </div>
                    </div>

                    {/* Bio (for top 3) */}
                    {rank <= 3 && leader.bio && (
                      <div className="mt-4 pt-4 border-t border-white/10">
                        <p className="text-sm text-grey line-clamp-2">{leader.bio}</p>
                      </div>
                    )}
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Your Rank */}
        {!loading && leaders.length > 0 && (
          <Card className="p-6 bg-primary/10 border-primary/30">
            <div className="text-center space-y-2">
              <p className="text-sm text-grey">Your Current Rank</p>
              <p className="text-3xl font-bold">
                #{leaders.findIndex((l) => normalizeAptosAddress(l.wallet_address) === normalizeAptosAddress(address)) + 1}
              </p>
              <p className="text-sm text-grey">
                Keep building and networking to climb the leaderboard! 🚀
              </p>
            </div>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Leaderboard;
