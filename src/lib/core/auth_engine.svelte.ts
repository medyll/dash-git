import { browser } from '$app/environment';

interface AuthToken {
  access_token: string;
  token_type: string;
  scope?: string;
  expires_at?: number;
}

interface DeviceCode {
  device_code: string;
  user_code: string;
  verification_uri: string;
  expires_in: number;
  interval: number;
}

const CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID || '';
const STORAGE_KEY = 'dash-git-auth-token';
const MOCK_MODE = import.meta.env.VITE_MOCK_MODE === 'true';

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
    // Auto-authenticate in mock mode
    if (MOCK_MODE) {
      authToken = {
        access_token: 'mock-token-for-development',
        token_type: 'Bearer',
        scope: 'repo'
      };
      isAuthenticated = true;
      return;
    }

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
 * Start GitHub Device Flow authentication
 */
export async function login(): Promise<{ success: boolean; error?: string; verification_uri?: string; user_code?: string }> {
  if (!CLIENT_ID) {
    authError = 'GitHub Client ID not configured';
    return { success: false, error: authError };
  }

  isAuthenticating = true;
  authError = null;

  try {
    // Step 1: Request device code
    const deviceCodeResponse = await fetch('https://github.com/login/device/code', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ client_id: CLIENT_ID })
    });

    if (!deviceCodeResponse.ok) {
      throw new Error('Failed to get device code');
    }

    const deviceCode: DeviceCode = await deviceCodeResponse.json();

    // Return verification info for UI to display
    // User must visit URL and enter code
    isAuthenticating = false;

    // Step 2: Start polling for token
    pollForToken(deviceCode).catch(console.error);

    return {
      success: true,
      verification_uri: deviceCode.verification_uri,
      user_code: deviceCode.user_code
    };
  } catch (error) {
    isAuthenticating = false;
    authError = error instanceof Error ? error.message : 'Authentication failed';
    return { success: false, error: authError };
  }
}

/**
 * Poll GitHub for token after user authorizes
 */
async function pollForToken(deviceCode: DeviceCode): Promise<void> {
  const startTime = Date.now();
  const expiresAt = startTime + (deviceCode.expires_in * 1000);

  const poll = async (): Promise<void> => {
    if (Date.now() > expiresAt) {
      authError = 'Authorization code expired';
      isAuthenticating = false;
      return;
    }

    try {
      const response = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          client_id: CLIENT_ID,
          device_code: deviceCode.device_code,
          grant_type: 'urn:ietf:params:oauth:grant-type:device_code'
        })
      });

      const data = await response.json();

      if (data.error) {
        if (data.error === 'authorization_pending') {
          // User hasn't authorized yet - continue polling
          setTimeout(poll, deviceCode.interval * 1000);
          return;
        } else if (data.error === 'expired_token') {
          authError = 'Authorization code expired';
          isAuthenticating = false;
          return;
        } else if (data.error === 'access_denied') {
          authError = 'Access denied by user';
          isAuthenticating = false;
          return;
        } else {
          throw new Error(data.error_description || data.error);
        }
      }

      // Success! Store token
      authToken = {
        access_token: data.access_token,
        token_type: data.token_type,
        scope: data.scope,
        expires_at: data.expires_in ? Date.now() + (data.expires_in * 1000) : undefined
      };

      isAuthenticated = true;
      isAuthenticating = false;

      // Persist to localStorage
      if (browser) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(authToken));
      }

      console.log('Authentication successful');
    } catch (error) {
      authError = error instanceof Error ? error.message : 'Token exchange failed';
      isAuthenticating = false;
    }
  };

  poll();
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
