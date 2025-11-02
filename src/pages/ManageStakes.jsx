import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { motion } from 'framer-motion';
import { RefreshCw, Trash2, AlertCircle, CheckCircle, Clock, ExternalLink } from 'lucide-react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import { useRefundStake, useReleaseStake } from '../hooks/useBaseContract';
import { supabase, TABLES } from '../config/supabase';
import { formatAddress } from '../utils/helpers';
import { toast } from 'react-hot-toast';

const ManageStakes = () => {
  const { address, isConnected } = useAccount();
  const [stakes, setStakes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refunding, setRefunding] = useState(null);
  const [releasing, setReleasing] = useState(null);
  const { refundStake: refundStakeContract } = useRefundStake();
  const { releaseStake: releaseStakeContract } = useReleaseStake();

  const fetchMyStakes = async () => {
    if (!address) return;
    
    setLoading(true);
    try {
      // Fetch stakes from Supabase
      const { data, error } = await supabase
        .from(TABLES.STAKES)
        .select(`
          *,
          target_user:target_address (
            name,
            wallet_address,
            image_url,
            role
          )
        `)
        .eq('staker_address', address.toLowerCase())
        .in('status', ['pending', 'matched'])
        .order('created_at', { ascending: false });

      if (error) throw error;

      setStakes(data || []);
      
      if (!data || data.length === 0) {
        console.log('No active stakes found');
      }
    } catch (error) {
      console.error('Error fetching stakes:', error);
      toast.error('Failed to fetch stakes');
    } finally {
      setLoading(false);
    }
  };

  const handleRefund = async (stake) => {
    if (!address) return;

    // Check if 2 days have passed
    const stakeDate = new Date(stake.created_at);
    const twoDays = 2 * 24 * 60 * 60 * 1000; // 2 days in ms
    const elapsed = Date.now() - stakeDate.getTime();
    
    if (elapsed < twoDays) {
      const hoursLeft = Math.ceil((twoDays - elapsed) / (60 * 60 * 1000));
      toast.error(`Cannot refund yet. Wait ${hoursLeft} more hours.`);
      return;
    }

    setRefunding(stake.target_address);
    try {
      toast.loading('Requesting refund...');
      
      const result = await refundStakeContract(stake.target_address);
      
      if (result) {
        toast.dismiss();
        toast.success('💰 Refund successful!');
        
        // Update stake status in Supabase
        await supabase
          .from(TABLES.STAKES)
          .update({ status: 'refunded' })
          .eq('staker_address', address.toLowerCase())
          .eq('target_address', stake.target_address.toLowerCase());
        
        // Refresh stakes list
        setTimeout(() => fetchMyStakes(), 2000);
      } else {
        toast.dismiss();
        toast.error('Refund failed');
      }
    } catch (error) {
      console.error('Error refunding:', error);
      toast.dismiss();
      toast.error(error.message || 'Failed to refund stake');
    } finally {
      setRefunding(null);
    }
  };

  const handleRelease = async (stake) => {
    if (!address) return;

    // Check if 7 days have passed since match
    if (!stake.matched_at) {
      toast.error('Stake not matched yet');
      return;
    }
    
    const matchDate = new Date(stake.matched_at);
    const sevenDays = 7 * 24 * 60 * 60 * 1000; // 7 days in ms
    const elapsed = Date.now() - matchDate.getTime();
    
    if (elapsed < sevenDays) {
      const daysLeft = Math.ceil((sevenDays - elapsed) / (24 * 60 * 60 * 1000));
      toast.error(`Cannot release yet. Wait ${daysLeft} more days.`);
      return;
    }

    setReleasing(stake.target_address);
    try {
      toast.loading('Releasing stake...');
      
      const result = await releaseStakeContract(stake.target_address);
      
      if (result) {
        toast.dismiss();
        toast.success('🎉 Stake released! 99% returned.');
        
        // Update stake status in Supabase
        await supabase
          .from(TABLES.STAKES)
          .update({ status: 'released' })
          .eq('staker_address', address.toLowerCase())
          .eq('target_address', stake.target_address.toLowerCase());
        
        // Refresh stakes list
        setTimeout(() => fetchMyStakes(), 2000);
      } else {
        toast.dismiss();
        toast.error('Release failed');
      }
    } catch (error) {
      console.error('Error releasing:', error);
      toast.dismiss();
      toast.error(error.message || 'Failed to release stake');
    } finally {
      setReleasing(null);
    }
  };

  useEffect(() => {
    if (address) {
      fetchMyStakes();
    }
  }, [address]);

  if (!address) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="p-8 text-center">
            <AlertCircle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Wallet Not Connected</h2>
            <p className="text-gray-400">Please connect your wallet to manage stakes</p>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                Manage Stakes
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                View and refund your on-chain stakes
              </p>
            </div>
            <Button
              onClick={fetchMyStakes}
              disabled={loading}
              variant="secondary"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </motion.div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-4 bg-blue-500/10 border-blue-500/30">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-blue-400 mb-1">Why This Page?</h3>
                <p className="text-sm text-gray-400">
                  If you get "E_STAKE_ALREADY_EXISTS" errors, you have old test stakes on-chain. 
                  Refund them here (after 2 days) to stake again freely.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Stakes List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {loading ? (
            <Card className="p-12 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
              <p className="text-gray-400">Checking blockchain for stakes...</p>
            </Card>
          ) : stakes.length === 0 ? (
            <Card className="p-12 text-center">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">All Clear!</h3>
              <p className="text-gray-400 mb-4">
                No pending stakes found on-chain. You can stake freely on the Dashboard.
              </p>
              <Button onClick={() => window.location.href = '/dashboard'}>
                Go to Dashboard
              </Button>
            </Card>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">
                  Active Stakes ({stakes.length})
                </h2>
              </div>

              <div className="space-y-4">
                {stakes.map((stake, index) => {
                  const stakeDate = new Date(stake.created_at);
                  const canRefund = stake.status === 'pending' && (Date.now() - stakeDate.getTime()) >= (2 * 24 * 60 * 60 * 1000);
                  const canRelease = stake.status === 'matched' && stake.matched_at && (Date.now() - new Date(stake.matched_at).getTime()) >= (7 * 24 * 60 * 60 * 1000);
                  
                  return (
                    <Card key={stake.id || index} className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-3">
                            {stake.status === 'matched' ? (
                              <CheckCircle className="w-5 h-5 text-green-400" />
                            ) : (
                              <Clock className="w-5 h-5 text-yellow-400" />
                            )}
                            <h3 className="font-bold text-white">
                              {stake.status === 'matched' ? 'Matched Stake' : 'Pending Stake'}
                            </h3>
                          </div>
                          
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="text-gray-500">To: </span>
                              {stake.target_user?.name ? (
                                <span className="font-semibold">{stake.target_user.name}</span>
                              ) : (
                                <span className="font-mono text-xs">{formatAddress(stake.target_address)}</span>
                              )}
                            </div>
                            
                            <div>
                              <span className="text-gray-500">Amount: </span>
                              <span className="text-primary font-semibold">1 USDC</span>
                            </div>
                            
                            <div>
                              <span className="text-gray-500">Status: </span>
                              {stake.status === 'pending' && <span className="text-yellow-400">⏳ Pending</span>}
                              {stake.status === 'matched' && <span className="text-green-400">✅ Matched</span>}
                            </div>
                            
                            <div>
                              <span className="text-gray-500">Created: </span>
                              <span className="text-gray-400">{stakeDate.toLocaleDateString()}</span>
                            </div>
                            
                            {stake.matched_at && (
                              <div>
                                <span className="text-gray-500">Matched: </span>
                                <span className="text-gray-400">{new Date(stake.matched_at).toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          {/* Refund Button (for pending stakes after 2 days) */}
                          {stake.status === 'pending' && (
                            <Button
                              onClick={() => handleRefund(stake)}
                              disabled={!canRefund || refunding === stake.target_address}
                              className={`${
                                canRefund 
                                  ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border-red-500/30' 
                                  : 'opacity-50 cursor-not-allowed'
                              }`}
                              title={!canRefund ? 'Wait 2 days before refunding' : 'Refund stake'}
                            >
                              {refunding === stake.target_address ? (
                                <>
                                  <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin mr-2" />
                                  Refunding...
                                </>
                              ) : (
                                <>
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  {canRefund ? 'Refund' : 'Wait 2 days'}
                                </>
                              )}
                            </Button>
                          )}
                          
                          {/* Release Button (for matched stakes after 7 days) */}
                          {stake.status === 'matched' && (
                            <Button
                              onClick={() => handleRelease(stake)}
                              disabled={!canRelease || releasing === stake.target_address}
                              className={`${
                                canRelease 
                                  ? 'bg-green-500/20 hover:bg-green-500/30 text-green-400 border-green-500/30' 
                                  : 'opacity-50 cursor-not-allowed'
                              }`}
                              title={!canRelease ? 'Wait 7 days after match' : 'Release stake'}
                            >
                              {releasing === stake.target_address ? (
                                <>
                                  <div className="w-4 h-4 border-2 border-green-400/30 border-t-green-400 rounded-full animate-spin mr-2" />
                                  Releasing...
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  {canRelease ? 'Release' : 'Wait 7 days'}
                                </>
                              )}
                            </Button>
                          )}
                          
                          {/* View on BaseScan */}
                          {stake.transaction_hash && (
                            <Button
                              onClick={() => window.open(`https://sepolia.basescan.org/tx/${stake.transaction_hash}`, '_blank')}
                              variant="secondary"
                              className="text-xs"
                            >
                              <ExternalLink className="w-3 h-3 mr-1" />
                              View TX
                            </Button>
                          )}
                        </div>
                      </div>
                  </Card>
                  );
                })}
              </div>
            </>
          )}
        </motion.div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-4 bg-gray-800/50">
            <h3 className="font-semibold text-white mb-2">Instructions:</h3>
            <ul className="space-y-1 text-sm text-gray-400">
              <li>• Stakes can be refunded after 2 days (172,800 seconds)</li>
              <li>• Click "Refund" to get your 0.1 APT back</li>
              <li>• After refunding, you can stake on that user again</li>
              <li>• Use "Clear All" to refund all stale stakes at once</li>
            </ul>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
};

export default ManageStakes;
