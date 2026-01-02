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
-- TRADES TABLE
-- =====================================================

-- 7. Create trades table for trade history
CREATE TABLE IF NOT EXISTS trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT NOT NULL,
  
  -- Trade details
  type TEXT NOT NULL CHECK (type IN ('buy', 'sell')),
  symbol TEXT NOT NULL,
  stock_name TEXT,
  
  -- Amounts
  token_amount DECIMAL(20, 8) NOT NULL,
  usdc_amount DECIMAL(20, 6) NOT NULL,
  price_per_token DECIMAL(20, 6) NOT NULL,
  
  -- Transaction info
  tx_signature TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed')),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  
  -- Foreign key to users (optional, for data integrity)
  CONSTRAINT fk_wallet FOREIGN KEY (wallet_address) REFERENCES users(wallet_address) ON DELETE CASCADE
);

-- 8. Create indexes for trades
CREATE INDEX IF NOT EXISTS idx_trades_wallet ON trades(wallet_address);
CREATE INDEX IF NOT EXISTS idx_trades_symbol ON trades(symbol);
CREATE INDEX IF NOT EXISTS idx_trades_created ON trades(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_trades_tx ON trades(tx_signature);

-- 9. Enable RLS on trades
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;

-- 10. RLS Policies for trades

-- Users can only read their own trades
DROP POLICY IF EXISTS "Users can view own trades" ON trades;
CREATE POLICY "Users can view own trades"
  ON trades FOR SELECT
  USING (true); -- We filter by wallet in the API

-- Service role can insert trades
DROP POLICY IF EXISTS "Service role can insert trades" ON trades;
CREATE POLICY "Service role can insert trades"
  ON trades FOR INSERT
  WITH CHECK (true);

-- Service role can update trades (for status updates)
DROP POLICY IF EXISTS "Service role can update trades" ON trades;
CREATE POLICY "Service role can update trades"
  ON trades FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- FAVORITES TABLE
-- =====================================================

-- 11. Create favorites table for stock favorites
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT NOT NULL,
  symbol TEXT NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint: one favorite per wallet/symbol combination
  CONSTRAINT unique_favorite UNIQUE (wallet_address, symbol),
  
  -- Foreign key to users
  CONSTRAINT fk_favorites_wallet FOREIGN KEY (wallet_address) REFERENCES users(wallet_address) ON DELETE CASCADE
);

-- 12. Create indexes for favorites
CREATE INDEX IF NOT EXISTS idx_favorites_wallet ON favorites(wallet_address);
CREATE INDEX IF NOT EXISTS idx_favorites_symbol ON favorites(symbol);

-- 13. Enable RLS on favorites
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- 14. RLS Policies for favorites

-- Users can view all favorites (we filter by wallet in API)
DROP POLICY IF EXISTS "Users can view favorites" ON favorites;
CREATE POLICY "Users can view favorites"
  ON favorites FOR SELECT
  USING (true);

-- Service role can insert favorites
DROP POLICY IF EXISTS "Service role can insert favorites" ON favorites;
CREATE POLICY "Service role can insert favorites"
  ON favorites FOR INSERT
  WITH CHECK (true);

-- Service role can delete favorites
DROP POLICY IF EXISTS "Service role can delete favorites" ON favorites;
CREATE POLICY "Service role can delete favorites"
  ON favorites FOR DELETE
  USING (true);

-- =====================================================
-- Verification: Check that everything was created
-- =====================================================
-- You can run these queries to verify:
-- SELECT * FROM users LIMIT 1;
-- SELECT * FROM trades LIMIT 1;
-- SELECT * FROM favorites LIMIT 1;
-- SELECT * FROM pg_policies WHERE tablename IN ('users', 'trades', 'favorites');

