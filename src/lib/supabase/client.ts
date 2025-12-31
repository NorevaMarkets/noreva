import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Supabase client for browser-side operations
 * Uses the anon key which respects Row Level Security
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Create a Supabase client with wallet context for RLS
 */
export function createClientWithWallet(walletAddress: string) {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        "x-wallet-address": walletAddress,
      },
    },
  });
}

