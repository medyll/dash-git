import { getToken } from '$lib/core/auth_engine.svelte';

const GITHUB_GRAPHQL_URL = 'https://api.github.com/graphql';
const MAX_RETRIES = 2;
const INITIAL_BACKOFF_MS = 1000;

// Mock mode for development
const MOCK_MODE = import.meta.env.VITE_MOCK_MODE === 'true';

interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{
    message: string;
    locations?: Array<{ line: number; column: number }>;
    path?: string[];
  }>;
}

interface RateLimitInfo {
  remaining: number;
  limit: number;
  resetAt: number;
}

interface PendingRequest {
  promise: Promise<unknown>;
  resolve: (value: unknown) => void;
  reject: (reason: unknown) => void;
}

// In-flight request cache for deduplication
const pendingRequests = new Map<string, PendingRequest>();

/**
 * Mock data for development without GitHub authentication
 */
const MOCK_VIEWER_DATA = {
  viewer: {
    login: 'dev-user',
    avatarUrl: 'https://github.com/placeholder.png',
    repositories: {
      totalCount: 3,
      pageInfo: { hasNextPage: false, endCursor: null },
      nodes: [
        {
          id: 'repo-1',
          name: 'my-awesome-project',
          nameWithOwner: 'dev-user/my-awesome-project',
          url: 'https://github.com/dev-user/my-awesome-project',
          updatedAt: new Date().toISOString(),
          primaryLanguage: { name: 'TypeScript', color: '#3178c6' },
          pullRequests: { totalCount: 5 },
          ciState: 'success' as const
        },
        {
          id: 'repo-2',
          name: 'web-app',
          nameWithOwner: 'dev-user/web-app',
          url: 'https://github.com/dev-user/web-app',
          updatedAt: new Date(Date.now() - 86400000).toISOString(),
          primaryLanguage: { name: 'JavaScript', color: '#f1e05a' },
          pullRequests: { totalCount: 2 },
          ciState: 'pending' as const
        },
        {
          id: 'repo-3',
          name: 'api-service',
          nameWithOwner: 'my-org/api-service',
          url: 'https://github.com/my-org/api-service',
          updatedAt: new Date(Date.now() - 172800000).toISOString(),
          primaryLanguage: { name: 'Python', color: '#3572A5' },
          pullRequests: { totalCount: 12 },
          ciState: 'failure' as const
        }
      ]
    },
    organizations: {
      nodes: [
        { login: 'my-org', name: 'My Organization', avatarUrl: 'https://github.com/org-placeholder.png', url: 'https://github.com/my-org' }
      ]
    }
  }
};

/**
 * Create a cache key from query and variables
 */
function createCacheKey(query: string, variables?: Record<string, unknown>): string {
  return JSON.stringify({ query, variables });
}

/**
 * Check if status code is retryable
 */
function isRetryableStatus(status: number): boolean {
  return status === 502 || status === 503 || status === 504;
}

/**
 * Parse rate limit headers from response
 */
function parseRateLimit(headers: Headers): RateLimitInfo | null {
  const remaining = headers.get('X-RateLimit-Remaining');
  const limit = headers.get('X-RateLimit-Limit');
  const reset = headers.get('X-RateLimit-Reset');

  if (remaining === null || limit === null || reset === null) {
    return null;
  }

  return {
    remaining: parseInt(remaining, 10),
    limit: parseInt(limit, 10),
    resetAt: parseInt(reset, 10) * 1000
  };
}

/**
 * Sleep for a given duration
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Execute a GraphQL query with retry logic
 */
async function executeQuery<T>(
  query: string,
  variables?: Record<string, unknown>,
  attempt = 0
): Promise<{ data: T; rateLimit: RateLimitInfo | null }> {
  // Return mock data in development mode
  if (MOCK_MODE) {
    await sleep(500); // Simulate network delay
    return { data: MOCK_VIEWER_DATA as unknown as T, rateLimit: null };
  }

  const token = getToken();

  if (!token) {
    throw new Error('Authentication required. Please log in.');
  }

  const response = await fetch(GITHUB_GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github.v3+json'
    },
    body: JSON.stringify({ query, variables })
  });

  const rateLimit = parseRateLimit(response.headers);

  // Check for rate limit exceeded
  if (rateLimit && rateLimit.remaining === 0) {
    const waitTime = rateLimit.resetAt - Date.now();
    throw new Error(`Rate limit exceeded. Try again in ${Math.ceil(waitTime / 1000 / 60)} minutes.`);
  }

  if (isRetryableStatus(response.status) && attempt < MAX_RETRIES) {
    const backoff = INITIAL_BACKOFF_MS * Math.pow(2, attempt);
    console.log(`Retryable error ${response.status}, retrying in ${backoff}ms (attempt ${attempt + 1}/${MAX_RETRIES})`);
    await sleep(backoff);
    return executeQuery<T>(query, variables, attempt + 1);
  }

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
  }

  const result: GraphQLResponse<T> = await response.json();

  if (result.errors && result.errors.length > 0) {
    const errorMessages = result.errors.map(e => e.message).join(', ');
    throw new Error(`GraphQL errors: ${errorMessages}`);
  }

  if (!result.data) {
    throw new Error('No data returned from GitHub API');
  }

  return { data: result.data, rateLimit };
}

/**
 * Execute a GraphQL query with automatic auth, retry, and deduplication
 * 
 * @param query - GraphQL query document
 * @param variables - Query variables
 * @returns Promise resolving to typed response data
 * 
 * @example
 * ```ts
 * const { data, rateLimit } = await query<{ viewer: { login: string } }>(
 *   gql`query { viewer { login } }`
 * );
 * console.log(data.viewer.login);
 * ```
 */
export async function query<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<{ data: T; rateLimit: RateLimitInfo | null }> {
  const cacheKey = createCacheKey(query, variables);

  // Check for pending identical request
  const pending = pendingRequests.get(cacheKey);
  if (pending) {
    return pending.promise as Promise<{ data: T; rateLimit: RateLimitInfo | null }>;
  }

  // Create new promise and store it
  const promise = new Promise<{ data: T; rateLimit: RateLimitInfo | null }>(
    async (resolve, reject) => {
      try {
        const result = await executeQuery<T>(query, variables);
        resolve(result);
      } catch (error) {
        reject(error);
      } finally {
        pendingRequests.delete(cacheKey);
      }
    }
  );

  // Store pending request
  pendingRequests.set(cacheKey, {
    promise,
    resolve: (value) => {},
    reject: () => {}
  });

  return promise;
}

/**
 * Clear all pending requests (useful on logout)
 */
export function clearPendingRequests(): void {
  for (const pending of pendingRequests.values()) {
    pending.reject(new Error('Request cancelled'));
  }
  pendingRequests.clear();
}

/**
 * Get number of pending requests (for debugging)
 */
export function getPendingRequestCount(): number {
  return pendingRequests.size;
}
