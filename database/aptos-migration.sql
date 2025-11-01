-- =====================================================
-- APTOS MIGRATION SCRIPT
-- Run this in your Supabase SQL Editor
-- =====================================================

-- Step 1: Add foreign keys to matches table
ALTER TABLE matches 
ADD CONSTRAINT fk_matches_user_a 
FOREIGN KEY (user_a) REFERENCES users(wallet_address) ON DELETE CASCADE;

ALTER TABLE matches 
ADD CONSTRAINT fk_matches_user_b 
FOREIGN KEY (user_b) REFERENCES users(wallet_address) ON DELETE CASCADE;

-- Step 2: Extend wallet_address column to support Aptos addresses (66 chars with 0x)
-- Aptos addresses are 64 hex characters + "0x" prefix = 66 total
-- Note: This will only work if your current data is empty or compatible

-- Step 3: Update comments
COMMENT ON COLUMN users.wallet_address IS 'Aptos wallet address (32 bytes, 66 chars with 0x prefix)';
COMMENT ON COLUMN stakes.staker IS 'Aptos wallet address of person staking';
COMMENT ON COLUMN stakes.target IS 'Aptos wallet address of person being staked to';
COMMENT ON COLUMN matches.user_a IS 'First user Aptos wallet address';
COMMENT ON COLUMN matches.user_b IS 'Second user Aptos wallet address';

-- Step 4: Add validation for Aptos address format
-- Ensure addresses start with 0x and are 66 characters long
ALTER TABLE users 
ADD CONSTRAINT check_wallet_format 
CHECK (wallet_address ~ '^0x[a-fA-F0-9]{64}$');

-- Step 5: Create helper function to normalize Aptos addresses
CREATE OR REPLACE FUNCTION normalize_aptos_address(addr TEXT)
RETURNS TEXT AS $$
BEGIN
    -- Remove 0x prefix if exists, pad to 64 chars, add 0x back
    RETURN '0x' || LPAD(REPLACE(LOWER(addr), '0x', ''), 64, '0');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Step 6: Create index on normalized addresses for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_wallet_normalized 
ON users(LOWER(wallet_address));

-- =====================================================
-- VERIFICATION
-- =====================================================
-- Run this to check if foreign keys were created:
-- SELECT conname, conrelid::regclass, confrelid::regclass
-- FROM pg_constraint
-- WHERE contype = 'f' AND conrelid = 'matches'::regclass;

-- =====================================================
-- ROLLBACK (if needed)
-- =====================================================
-- ALTER TABLE matches DROP CONSTRAINT IF EXISTS fk_matches_user_a;
-- ALTER TABLE matches DROP CONSTRAINT IF EXISTS fk_matches_user_b;
-- ALTER TABLE users DROP CONSTRAINT IF EXISTS check_wallet_format;
-- DROP FUNCTION IF EXISTS normalize_aptos_address;
