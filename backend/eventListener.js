/**
 * Habit Platform - Blockchain Event Listener
 * 
 * This script listens to smart contract events and syncs them with Supabase
 * Run this as a separate Node.js process or deploy as a serverless function
 * 
 * Events monitored:
 * - Matched: Create chat room in Supabase when two users match
 * - Staked: Update stake status in Supabase
 * - Refunded: Update stake status to refunded
 * - Released: Update stake status to released
 */

import { createPublicClient, http, parseAbiItem } from 'viem';
import { baseSepolia } from 'viem/chains';
import { createClient } from '@supabase/supabase-js';

// Configuration
const CONFIG = {
  RPC_URL: process.env.BASE_SEPOLIA_RPC || 'https://sepolia.base.org',
  CONTRACT_ADDRESS: process.env.CONTRACT_ADDRESS,
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY, // Use service role key for backend
  POLL_INTERVAL: 12000, // 12 seconds (Base block time)
};

// Initialize Supabase client with service role key
const supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_SERVICE_KEY);

// Initialize Viem public client
const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(CONFIG.RPC_URL),
});

// Contract ABI events
const EVENTS = {
  Matched: parseAbiItem('event Matched(address indexed userA, address indexed userB, uint256 timestamp)'),
  Staked: parseAbiItem('event Staked(address indexed from, address indexed to, uint256 amount, uint256 timestamp)'),
  Refunded: parseAbiItem('event Refunded(address indexed from, address indexed to, uint256 amount)'),
  Released: parseAbiItem('event Released(address indexed userA, address indexed userB, uint256 amount)'),
};

/**
 * Handle Matched event - Create chat room in Supabase
 */
async function handleMatchedEvent(log) {
  const { userA, userB, timestamp } = log.args;
  
  console.log(`🎉 Match detected: ${userA} <-> ${userB}`);

  try {
    // Sort addresses to maintain consistency
    const [addr1, addr2] = [userA, userB].sort();
    const chatRoomId = `${addr1.toLowerCase()}_${addr2.toLowerCase()}`;

    // Check if match already exists
    const { data: existingMatch } = await supabase
      .from('matches')
      .select('id')
      .eq('user_a', addr1.toLowerCase())
      .eq('user_b', addr2.toLowerCase())
      .single();

    if (existingMatch) {
      console.log('Match already exists in database');
      return;
    }

    // Create match in Supabase
    const { error } = await supabase
      .from('matches')
      .insert({
        user_a: addr1.toLowerCase(),
        user_b: addr2.toLowerCase(),
        matched_at: new Date(Number(timestamp) * 1000).toISOString(),
        chat_room_id: chatRoomId,
      });

    if (error) throw error;

    console.log(`✅ Match created in Supabase: ${chatRoomId}`);

    // Update stake statuses to matched
    await supabase
      .from('stakes')
      .update({ status: 'matched' })
      .eq('staker', userA.toLowerCase())
      .eq('target', userB.toLowerCase());

    await supabase
      .from('stakes')
      .update({ status: 'matched' })
      .eq('staker', userB.toLowerCase())
      .eq('target', userA.toLowerCase());

  } catch (error) {
    console.error('Error handling Matched event:', error);
  }
}

/**
 * Handle Staked event - Record stake in Supabase
 */
async function handleStakedEvent(log) {
  const { from, to, amount, timestamp } = log.args;
  
  console.log(`💰 Stake detected: ${from} -> ${to} (${amount})`);

  try {
    // Upsert stake in Supabase
    const { error } = await supabase
      .from('stakes')
      .upsert({
        staker: from.toLowerCase(),
        target: to.toLowerCase(),
        amount: (Number(amount) / 1e6).toString(), // Convert from wei to USDC
        status: 'pending',
        tx_hash: log.transactionHash,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'staker,target'
      });

    if (error) throw error;

    console.log(`✅ Stake recorded in Supabase`);

  } catch (error) {
    console.error('Error handling Staked event:', error);
  }
}

/**
 * Handle Refunded event - Update stake status
 */
async function handleRefundedEvent(log) {
  const { from, to, amount } = log.args;
  
  console.log(`↩️ Refund detected: ${from} -> ${to}`);

  try {
    const { error } = await supabase
      .from('stakes')
      .update({ 
        status: 'refunded',
        updated_at: new Date().toISOString(),
      })
      .eq('staker', from.toLowerCase())
      .eq('target', to.toLowerCase());

    if (error) throw error;

    console.log(`✅ Stake marked as refunded`);

  } catch (error) {
    console.error('Error handling Refunded event:', error);
  }
}

/**
 * Handle Released event - Update stake status
 */
async function handleReleasedEvent(log) {
  const { userA, userB, amount } = log.args;
  
  console.log(`🔓 Release detected: ${userA} <-> ${userB}`);

  try {
    // Update both stakes
    await supabase
      .from('stakes')
      .update({ 
        status: 'released',
        updated_at: new Date().toISOString(),
      })
      .eq('staker', userA.toLowerCase())
      .eq('target', userB.toLowerCase());

    await supabase
      .from('stakes')
      .update({ 
        status: 'released',
        updated_at: new Date().toISOString(),
      })
      .eq('staker', userB.toLowerCase())
      .eq('target', userA.toLowerCase());

    console.log(`✅ Stakes marked as released`);

  } catch (error) {
    console.error('Error handling Released event:', error);
  }
}

/**
 * Main event listener function
 */
async function startEventListener() {
  console.log('🚀 Starting Habit Platform Event Listener...');
  console.log(`📡 Monitoring contract: ${CONFIG.CONTRACT_ADDRESS}`);
  console.log(`🔗 Network: Base Sepolia`);
  console.log(`⏱️  Poll interval: ${CONFIG.POLL_INTERVAL}ms`);

  let lastProcessedBlock = await publicClient.getBlockNumber();
  console.log(`📦 Starting from block: ${lastProcessedBlock}`);

  // Poll for new events
  setInterval(async () => {
    try {
      const currentBlock = await publicClient.getBlockNumber();

      if (currentBlock <= lastProcessedBlock) {
        return; // No new blocks
      }

      console.log(`🔍 Checking blocks ${lastProcessedBlock + 1n} to ${currentBlock}`);

      // Fetch Matched events
      const matchedLogs = await publicClient.getLogs({
        address: CONFIG.CONTRACT_ADDRESS,
        event: EVENTS.Matched,
        fromBlock: lastProcessedBlock + 1n,
        toBlock: currentBlock,
      });

      // Fetch Staked events
      const stakedLogs = await publicClient.getLogs({
        address: CONFIG.CONTRACT_ADDRESS,
        event: EVENTS.Staked,
        fromBlock: lastProcessedBlock + 1n,
        toBlock: currentBlock,
      });

      // Fetch Refunded events
      const refundedLogs = await publicClient.getLogs({
        address: CONFIG.CONTRACT_ADDRESS,
        event: EVENTS.Refunded,
        fromBlock: lastProcessedBlock + 1n,
        toBlock: currentBlock,
      });

      // Fetch Released events
      const releasedLogs = await publicClient.getLogs({
        address: CONFIG.CONTRACT_ADDRESS,
        event: EVENTS.Released,
        fromBlock: lastProcessedBlock + 1n,
        toBlock: currentBlock,
      });

      // Process events
      for (const log of stakedLogs) {
        await handleStakedEvent(log);
      }

      for (const log of matchedLogs) {
        await handleMatchedEvent(log);
      }

      for (const log of refundedLogs) {
        await handleRefundedEvent(log);
      }

      for (const log of releasedLogs) {
        await handleReleasedEvent(log);
      }

      lastProcessedBlock = currentBlock;

    } catch (error) {
      console.error('❌ Error in event listener:', error);
    }
  }, CONFIG.POLL_INTERVAL);
}

/**
 * Handle graceful shutdown
 */
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down event listener...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Shutting down event listener...');
  process.exit(0);
});

// Start the listener
startEventListener().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

export { startEventListener };
