import { createClient } from '@supabase/supabase-js';
import { browser } from '$app/environment';

// Supabase configuration
const SUPABASE_URL = 'https://wntrxumurijasfstiohn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndudHJ4dW11cmlqYXNmc3Rpb2huIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyNTQ5NzQsImV4cCI6MjA5MDgzMDk3NH0.w8ZMaLDpNVWuvdWKrp1cY0okKBWf3HOTUyABmuNrmwY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: browser ? localStorage : undefined,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: browser
  }
});

/**
 * Reactive auth state object
 * Import this directly in components for reactivity
 */
export const authState = $state({
  session: null as any,
  user: null as any,
  isLoading: true,
  error: null as string | null
});

/**
 * Initialize auth state
 */
export async function initAuth() {
  if (!browser) {
    authState.isLoading = false;
    return;
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    authState.session = session;
    authState.user = session?.user || null;
  } catch (err) {
    console.error('Auth init error:', err);
  } finally {
    authState.isLoading = false;
  }

  supabase.auth.onAuthStateChange((_event, newSession) => {
    authState.session = newSession;
    authState.user = newSession?.user || null;
    authState.isLoading = false;
  });
}

/**
 * Sign in with GitHub OAuth
 */
export async function signInWithGitHub() {
  authState.error = null;
  
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: 'http://localhost:5123',
      scopes: 'repo read:user'
    }
  });

  if (error) {
    authState.error = error.message;
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Sign out
 */
export async function signOut() {
  authState.error = null;
  
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    authState.error = error.message;
    return { success: false, error: error.message };
  }

  authState.session = null;
  authState.user = null;
  return { success: true };
}

/**
 * Get auth token for API calls
 */
export function getAuthToken(): string | null {
  return authState.session?.access_token || null;
}

/**
 * Get reactive auth state
 */
export function getAuthState() {
  return authState;
}

// Initialize on module load
if (browser) {
  initAuth();
}
