import { createClient } from "@supabase/supabase-js";
import type { User } from "@/types/database";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Supabase client for server-side operations
 * Uses the service role key which bypasses Row Level Security
 * ONLY use this in API routes, never expose to client!
 */
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

/**
 * Get a user by wallet address (server-side)
 */
export async function getUserByWallet(walletAddress: string): Promise<User | null> {
  const { data, error } = await supabaseAdmin
    .from("users")
    .select("*")
    .eq("wallet_address", walletAddress)
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 = not found, which is ok
    throw error;
  }

  return data as User | null;
}

/**
 * Create a new user with wallet address (server-side)
 */
export async function createUser(walletAddress: string): Promise<User> {
  const { data, error } = await supabaseAdmin
    .from("users")
    .insert({ wallet_address: walletAddress })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as User;
}

/**
 * Get or create user by wallet address
 */
export async function getOrCreateUser(walletAddress: string): Promise<User> {
  let user = await getUserByWallet(walletAddress);

  if (!user) {
    user = await createUser(walletAddress);
  }

  return user;
}

/**
 * Update user profile (server-side with wallet verification)
 */
export async function updateUserProfile(
  walletAddress: string,
  updates: Partial<{
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    x_handle: string | null;
    website: string | null;
    bio: string | null;
    avatar_url: string | null;
  }>
): Promise<User> {
  const { data, error } = await supabaseAdmin
    .from("users")
    .update(updates)
    .eq("wallet_address", walletAddress)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as User;
}

