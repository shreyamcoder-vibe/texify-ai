// Guest-mode auth shim. All visitors are treated as a logged-in guest user.
// No Supabase session is required. Login/Signup flows are bypassed for demo.

interface GuestProfile {
  id: string;
  user_id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  is_pro: boolean;
  daily_credits_used: number;
  credits_reset_at: string;
}

const GUEST_USER = {
  id: "guest_user",
  email: "guest@texify.app",
  user_metadata: { full_name: "Guest" },
} as any;

const GUEST_PROFILE: GuestProfile = {
  id: "guest_user",
  user_id: "guest_user",
  email: "guest@texify.app",
  full_name: "Guest",
  avatar_url: null,
  is_pro: false,
  daily_credits_used: 0,
  credits_reset_at: new Date().toISOString(),
};

export function useAuth() {
  const noop = async () => ({ error: null as any });
  return {
    user: GUEST_USER,
    session: null,
    profile: GUEST_PROFILE,
    loading: false,
    signUp: noop,
    signIn: noop,
    signInWithGoogle: noop,
    signOut: noop,
    refreshProfile: () => {},
    isGuest: true,
  };
}
