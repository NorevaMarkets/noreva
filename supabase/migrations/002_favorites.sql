-- =====================================================
-- Favorites Table Migration
-- Run this SQL in Supabase SQL Editor
-- =====================================================

-- Create favorites table for stock favorites
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

-- Create indexes for favorites
CREATE INDEX IF NOT EXISTS idx_favorites_wallet ON favorites(wallet_address);
CREATE INDEX IF NOT EXISTS idx_favorites_symbol ON favorites(symbol);

-- Enable RLS on favorites
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- RLS Policies for favorites

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

-- Verification
-- SELECT * FROM favorites LIMIT 1;
-- SELECT * FROM pg_policies WHERE tablename = 'favorites';

