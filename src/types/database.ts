/**
 * Database types for Supabase
 * These types match the database schema
 */

export interface Database {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: UserInsert;
        Update: UserUpdate;
      };
    };
  };
}

export interface User {
  id: string;
  wallet_address: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  x_handle: string | null;
  website: string | null;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserInsert {
  wallet_address: string;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  x_handle?: string | null;
  website?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
}

export interface UserUpdate {
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  x_handle?: string | null;
  website?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  xHandle: string;
  website: string;
  bio: string;
  avatarUrl: string;
}

/**
 * Convert database user to frontend profile format
 */
export function toUserProfile(user: User): UserProfile {
  return {
    firstName: user.first_name || "",
    lastName: user.last_name || "",
    email: user.email || "",
    xHandle: user.x_handle || "",
    website: user.website || "",
    bio: user.bio || "",
    avatarUrl: user.avatar_url || "",
  };
}

/**
 * Convert frontend profile to database update format
 */
export function toUserUpdate(profile: Partial<UserProfile>): UserUpdate {
  const update: UserUpdate = {};

  if (profile.firstName !== undefined) update.first_name = profile.firstName || null;
  if (profile.lastName !== undefined) update.last_name = profile.lastName || null;
  if (profile.email !== undefined) update.email = profile.email || null;
  if (profile.xHandle !== undefined) update.x_handle = profile.xHandle || null;
  if (profile.website !== undefined) update.website = profile.website || null;
  if (profile.bio !== undefined) update.bio = profile.bio || null;
  if (profile.avatarUrl !== undefined) update.avatar_url = profile.avatarUrl || null;

  return update;
}

