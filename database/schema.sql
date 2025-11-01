-- Habit Platform - Supabase Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- USERS TABLE
-- Stores user profiles and information
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    wallet_address TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('founder', 'builder', 'investor')),
    name TEXT NOT NULL,
    bio TEXT,
    image_url TEXT, -- IPFS CID or URL
    profile_ipfs_cid TEXT, -- Full profile JSON CID
    
    -- Builder specific
    skills TEXT[], -- Array of skills
    experience_level TEXT CHECK (experience_level IN ('beginner', 'intermediate', 'expert') OR experience_level IS NULL),
    
    -- Founder specific
    project_name TEXT,
    project_description TEXT,
    needs TEXT[], -- Array of needs (developers, designers, funding, etc.)
    
    -- Investor specific
    fund_name TEXT,
    investment_focus TEXT,
    portfolio_link TEXT,
    
    -- Social links
    twitter_handle TEXT,
    linkedin_link TEXT,
    github_link TEXT,
    farcaster_handle TEXT,
    website TEXT,
    
    -- Habit info
    daily_habit TEXT,
    purpose TEXT,
    
    -- Reputation
    reputation_score INTEGER DEFAULT 50,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_users_wallet ON users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_reputation ON users(reputation_score DESC);

-- =====================================================
-- STAKES TABLE
-- Tracks on-chain staking activity
-- =====================================================
CREATE TABLE IF NOT EXISTS stakes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    staker TEXT NOT NULL, -- Wallet address of person staking
    target TEXT NOT NULL, -- Wallet address of person being staked to
    amount NUMERIC NOT NULL DEFAULT 1, -- Amount in USDC (1 USDC)
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'matched', 'refunded', 'released')),
    tx_hash TEXT, -- Transaction hash on blockchain
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    
    UNIQUE(staker, target)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_stakes_staker ON stakes(staker);
CREATE INDEX IF NOT EXISTS idx_stakes_target ON stakes(target);
CREATE INDEX IF NOT EXISTS idx_stakes_status ON stakes(status);

-- =====================================================
-- MATCHES TABLE
-- Stores matched user pairs
-- =====================================================
CREATE TABLE IF NOT EXISTS matches (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_a TEXT NOT NULL, -- First user wallet address
    user_b TEXT NOT NULL, -- Second user wallet address
    matched_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    chat_room_id TEXT NOT NULL, -- Unique chat room identifier
    
    CONSTRAINT matches_unique UNIQUE(user_a, user_b),
    CONSTRAINT matches_check CHECK (user_a < user_b) -- Ensure consistent ordering
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_matches_user_a ON matches(user_a);
CREATE INDEX IF NOT EXISTS idx_matches_user_b ON matches(user_b);
CREATE INDEX IF NOT EXISTS idx_matches_chat_room ON matches(chat_room_id);

-- =====================================================
-- CHATS TABLE
-- Stores chat messages between matched users
-- =====================================================
CREATE TABLE IF NOT EXISTS chats (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    room_id TEXT NOT NULL, -- Chat room identifier
    sender_wallet TEXT NOT NULL, -- Sender wallet address
    message TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_chats_room ON chats(room_id);
CREATE INDEX IF NOT EXISTS idx_chats_timestamp ON chats(timestamp DESC);

-- =====================================================
-- REPUTATIONS TABLE
-- Stores OpenRank reputation data
-- =====================================================
CREATE TABLE IF NOT EXISTS reputations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    wallet TEXT UNIQUE NOT NULL,
    openrank_data JSONB, -- Raw OpenRank API response
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Index
CREATE INDEX IF NOT EXISTS idx_reputations_wallet ON reputations(wallet);
CREATE INDEX IF NOT EXISTS idx_reputations_updated ON reputations(last_updated DESC);

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stakes_updated_at BEFORE UPDATE ON stakes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Enable RLS for all tables
-- =====================================================

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE stakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE reputations ENABLE ROW LEVEL SECURITY;

-- Users table policies
-- Anyone can read user profiles
CREATE POLICY "Users are viewable by everyone"
    ON users FOR SELECT
    USING (true);

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile"
    ON users FOR INSERT
    WITH CHECK (true);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
    ON users FOR UPDATE
    USING (true);

-- Stakes table policies
CREATE POLICY "Stakes are viewable by everyone"
    ON stakes FOR SELECT
    USING (true);

CREATE POLICY "Anyone can insert stakes"
    ON stakes FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Anyone can update stakes"
    ON stakes FOR UPDATE
    USING (true);

-- Matches table policies
CREATE POLICY "Matches are viewable by participants"
    ON matches FOR SELECT
    USING (true);

CREATE POLICY "Anyone can insert matches"
    ON matches FOR INSERT
    WITH CHECK (true);

-- Chats table policies
CREATE POLICY "Chat messages are viewable by everyone"
    ON chats FOR SELECT
    USING (true);

CREATE POLICY "Anyone can insert chat messages"
    ON chats FOR INSERT
    WITH CHECK (true);

-- Reputations table policies
CREATE POLICY "Reputations are viewable by everyone"
    ON reputations FOR SELECT
    USING (true);

CREATE POLICY "Anyone can insert reputations"
    ON reputations FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Anyone can update reputations"
    ON reputations FOR UPDATE
    USING (true);

-- =====================================================
-- REALTIME SUBSCRIPTIONS
-- Enable realtime for chat and matches
-- =====================================================

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE chats;
ALTER PUBLICATION supabase_realtime ADD TABLE matches;

-- =====================================================
-- INITIAL DATA (Optional)
-- Add some test data if needed
-- =====================================================

-- Example: Insert a test user
-- INSERT INTO users (wallet_address, role, name, bio, reputation_score)
-- VALUES ('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb', 'builder', 'Test User', 'I am a test builder', 75);

-- =====================================================
-- VIEWS (Optional)
-- Create useful views for common queries
-- =====================================================

-- View for user with match count
CREATE OR REPLACE VIEW users_with_stats AS
SELECT 
    u.*,
    COUNT(DISTINCT m.id) as match_count
FROM users u
LEFT JOIN matches m ON (u.wallet_address = m.user_a OR u.wallet_address = m.user_b)
GROUP BY u.id;

-- View for pending stakes (waiting for mutual stake)
CREATE OR REPLACE VIEW pending_stakes AS
SELECT * FROM stakes
WHERE status = 'pending'
ORDER BY created_at DESC;

-- =====================================================
-- COMMENTS
-- Add helpful comments to tables and columns
-- =====================================================

COMMENT ON TABLE users IS 'Stores user profile information and preferences';
COMMENT ON TABLE stakes IS 'Tracks on-chain staking activity between users';
COMMENT ON TABLE matches IS 'Stores matched user pairs after mutual staking';
COMMENT ON TABLE chats IS 'Stores real-time chat messages between matched users';
COMMENT ON TABLE reputations IS 'Stores OpenRank reputation data for users';

COMMENT ON COLUMN users.wallet_address IS 'Ethereum wallet address (primary identifier)';
COMMENT ON COLUMN users.reputation_score IS 'Computed reputation score from OpenRank (0-100)';
COMMENT ON COLUMN stakes.status IS 'Current status: pending, matched, refunded, or released';
COMMENT ON COLUMN matches.chat_room_id IS 'Unique identifier for the chat room between matched users';

-- =====================================================
-- CLEANUP (if needed)
-- Run these commands to drop tables and start fresh
-- =====================================================

-- Uncomment to drop all tables (WARNING: This deletes all data!)
-- DROP TABLE IF EXISTS chats CASCADE;
-- DROP TABLE IF EXISTS matches CASCADE;
-- DROP TABLE IF EXISTS stakes CASCADE;
-- DROP TABLE IF EXISTS reputations CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;

-- =====================================================
-- COMPLETE!
-- Your Habit Platform database is ready to use
-- =====================================================
