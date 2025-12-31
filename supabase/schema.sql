-- =====================================================
-- Noreva User Database Schema
-- Run this SQL in Supabase SQL Editor
-- =====================================================

-- 1. Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  x_handle TEXT,
  website TEXT,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create index for fast wallet lookups
CREATE INDEX IF NOT EXISTS idx_users_wallet ON users(wallet_address);

-- 3. Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Create trigger for auto-updating updated_at
DROP TRIGGER IF EXISTS users_updated_at ON users;
CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 5. Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS Policies

-- Policy: Anyone can read user profiles (public profiles)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON users;
CREATE POLICY "Public profiles are viewable by everyone"
  ON users FOR SELECT
  USING (true);

-- Policy: Users can insert their own profile (via service role only in our setup)
DROP POLICY IF EXISTS "Service role can insert users" ON users;
CREATE POLICY "Service role can insert users"
  ON users FOR INSERT
  WITH CHECK (true);

-- Policy: Users can update their own profile (via service role only in our setup)
DROP POLICY IF EXISTS "Service role can update users" ON users;
CREATE POLICY "Service role can update users"
  ON users FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- Verification: Check that everything was created
-- =====================================================
-- You can run these queries to verify:
-- SELECT * FROM users LIMIT 1;
-- SELECT * FROM pg_policies WHERE tablename = 'users';

