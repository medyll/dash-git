import { browser } from '$app/environment';

interface AuthToken {
  access_token: string;
  token_type: string;
  scope?: string;
}

const STORAGE_KEY = 'dash-git-auth-token';

// Mock mode disabled - use real GitHub API
const MOCK_MODE = false;

// Reactive state
let authToken: AuthToken | null = null;
let isAuthenticated = $state(false);
let isAuthenticating = $state(false);
let authError: string | null = null;

/**
 * Initialize auth state from localStorage on browser
 */
export function initAuth() {
  if (browser) {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        authToken = JSON.parse(stored);
        isAuthenticated = !!authToken?.access_token;
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }
}

/**
 * Authenticate with Personal Access Token
 */
export async function loginWithToken(token: string): Promise<{ success: boolean; error?: string }> {
  isAuthenticating = true;
  authError = null;

  try {
    // Verify token by fetching user info
    const response = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Invalid token. Please check your Personal Access Token.');
      }
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const user = await response.json();

    // Store token
    authToken = {
      access_token: token,
      token_type: 'Bearer',
      scope: 'repo'
    };

    isAuthenticated = true;
    isAuthenticating = false;

    // Persist to localStorage
    if (browser) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(authToken));
    }

    console.log('Authentication successful for user:', user.login);
    return { success: true };
  } catch (error) {
    isAuthenticating = false;
    authError = error instanceof Error ? error.message : 'Authentication failed';
    return { success: false, error: authError };
  }
}

/**
 * Logout - clear token from memory and storage
 */
export function logout(): void {
  authToken = null;
  isAuthenticated = false;
  authError = null;

  if (browser) {
    localStorage.removeItem(STORAGE_KEY);
  }
}

/**
 * Get current auth token
 */
export function getToken(): string | null {
  return authToken?.access_token || null;
}

/**
 * Get reactive auth state
 */
export function getAuthState() {
  return {
    get isAuthenticated() { return isAuthenticated; },
    get isAuthenticating() { return isAuthenticating; },
    get error() { return authError; },
    get token() { return authToken; }
  };
}

// Initialize on module load
initAuth();
