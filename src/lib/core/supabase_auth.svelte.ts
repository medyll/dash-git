import { createClient } from '@supabase/supabase-js';
import { browser } from '$app/environment';
import { writable, type Writable } from 'svelte/store';

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

// Auth state using Svelte stores for proper reactivity
interface AuthState {
  session: any;
  user: any;
  isLoading: boolean;
  error: string | null;
}

export const authState: Writable<AuthState> = writable<AuthState>({
  session: null,
  user: null,
  isLoading: true,
  error: null
});

/**
 * Initialize auth state
 */
export async function initAuth() {
  if (!browser) {
    authState.update(s => ({ ...s, isLoading: false }));
    return;
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    authState.update(s => ({
      ...s,
      session,
      user: session?.user || null,
      isLoading: false
    }));
  } catch (err) {
    console.error('Auth init error:', err);
    authState.update(s => ({ ...s, isLoading: false }));
  }

  supabase.auth.onAuthStateChange((_event, newSession) => {
    authState.update(s => ({
      ...s,
      session: newSession,
      user: newSession?.user || null,
      isLoading: false
    }));
  });
}

/**
 * Sign in with GitHub OAuth
 */
export async function signInWithGitHub() {
  authState.update(s => ({ ...s, error: null }));
  
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: 'http://localhost:5123',
      scopes: 'repo read:user'
    }
  });

  if (error) {
    authState.update(s => ({ ...s, error: error.message }));
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Sign out
 */
export async function signOut() {
  authState.update(s => ({ ...s, error: null }));
  
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    authState.update(s => ({ ...s, error: error.message }));
    return { success: false, error: error.message };
  }

  authState.update(s => ({ ...s, session: null, user: null }));
  return { success: true };
}

/**
 * Get auth token for API calls (synchronous, uses get() for current value)
 */
export function getAuthToken(): string | null {
  let token: string | null = null;
  const unsubscribe = authState.subscribe(s => {
    token = s.session?.access_token || null;
  });
  unsubscribe();
  return token;
}

// Initialize on module load
if (browser) {
  initAuth();
}
