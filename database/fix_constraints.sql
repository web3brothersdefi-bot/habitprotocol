-- ============================================================
-- FIX: Update database constraints to allow NULL values
-- Run this in Supabase SQL Editor if you already created tables
-- ============================================================

-- Drop old constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_experience_level_check;

-- Add new constraint that allows NULL
ALTER TABLE users ADD CONSTRAINT users_experience_level_check 
  CHECK (experience_level IN ('beginner', 'intermediate', 'expert') OR experience_level IS NULL);

-- Verify the fix
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;
