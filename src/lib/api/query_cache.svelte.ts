// Default TTLs in milliseconds
const DEFAULT_TTL = 60_000; // 60 seconds
const MAX_CACHE_ENTRIES = 200;

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  pendingRefresh: Promise<T> | null;
  key: string;
}

// LRU cache using Map (insertion order preserved)
const cache = new Map<string, CacheEntry<unknown>>();

/**
 * Evict oldest entries if cache exceeds max size
 */
function evictOldest(): void {
  while (cache.size >= MAX_CACHE_ENTRIES) {
    const oldestKey = cache.keys().next().value;
    if (oldestKey) {
      cache.delete(oldestKey);
    }
  }
}

/**
 * Check if cache entry is stale
 */
function isStale(entry: CacheEntry<unknown>): boolean {
  return Date.now() - entry.timestamp > entry.ttl;
}

/**
 * Get or create cached data with stale-while-revalidate pattern
 * 
 * @param key - Unique cache key (e.g., 'repo:owner/name/tree:main')
 * @param fetcher - Async function to fetch fresh data
 * @param ttl - Time-to-live in ms (default: 60s)
 * @returns Reactive cache state with data, isStale flag, and refresh function
 * 
 * @example
 * ```ts
 * const treeCache = cached('repo:myrepo/tree:main', () => fetchTree(), 60_000);
 * $effect(() => {
 *   console.log('Tree updated:', $state.snapshot(treeCache.data));
 * });
 * ```
 */
export function cached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = DEFAULT_TTL
): {
  data: T | undefined;
  isStale: boolean;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
} {
  // Get or create entry
  let entry = cache.get(key) as CacheEntry<T> | undefined;

  if (!entry) {
    // Create new entry
    entry = {
      data: undefined as unknown as T,
      timestamp: 0,
      ttl,
      pendingRefresh: null,
      key
    };
    evictOldest();
    cache.set(key, entry);
  }

  // Reactive state using Svelte 5 runes
  let data = $state<T | undefined>(entry.data);
  let isStaleState = $state(false);
  let isLoading = $state(false);
  let error = $state<Error | null>(null);

  // Update stale state
  function updateStaleState() {
    isStaleState = entry!.timestamp > 0 && isStale(entry!);
  }

  // Initialize from cache
  if (entry.data !== undefined) {
    data = entry.data;
    updateStaleState();
  }

  // Trigger background refresh if stale and no pending refresh
  async function maybeRefresh(): Promise<void> {
    if (isStale(entry!) && !entry!.pendingRefresh) {
      await refresh();
    }
  }

  // Refresh data
  async function refresh(): Promise<void> {
    if (entry!.pendingRefresh) {
      return entry!.pendingRefresh;
    }

    isLoading = true;
    error = null;

    entry!.pendingRefresh = (async () => {
      try {
        const freshData = await fetcher();
        entry!.data = freshData;
        entry!.timestamp = Date.now();
        data = freshData;
        updateStaleState();
        return freshData;
      } catch (err) {
        error = err instanceof Error ? err : new Error('Fetch failed');
        throw err;
      } finally {
        isLoading = false;
        entry!.pendingRefresh = null;
      }
    })();

    return entry!.pendingRefresh;
  }

  // Initial fetch if no data
  if (entry.data === undefined) {
    refresh().catch(console.error);
  } else {
    // Background refresh if stale
    maybeRefresh().catch(console.error);
  }

  return {
    get data() { return data; },
    get isStale() { return isStaleState; },
    get isLoading() { return isLoading; },
    get error() { return error; },
    refresh
  };
}

/**
 * Invalidate cache entries matching a pattern
 * @param pattern - String or RegExp to match keys
 */
export function invalidate(pattern: string | RegExp): void {
  const matcher = pattern instanceof RegExp ? pattern : (key: string) => key.startsWith(pattern);
  
  for (const key of cache.keys()) {
    if (typeof matcher === 'string' ? key.startsWith(pattern as string) : matcher.test(key)) {
      const entry = cache.get(key);
      if (entry) {
        entry.timestamp = 0; // Mark as stale
      }
    }
  }
}

/**
 * Clear entire cache
 */
export function clearCache(): void {
  cache.clear();
}

/**
 * Remove specific entry from cache
 */
export function remove(key: string): void {
  cache.delete(key);
}

/**
 * Get cache statistics (for debugging)
 */
export function getCacheStats(): { size: number; staleCount: number; maxSize: number } {
  let staleCount = 0;
  for (const entry of cache.values()) {
    if (entry.timestamp > 0 && isStale(entry)) {
      staleCount++;
    }
  }
  return {
    size: cache.size,
    staleCount,
    maxSize: MAX_CACHE_ENTRIES
  };
}

/**
 * Prefetch data into cache without returning reactive state
 */
export async function prefetch<T>(key: string, fetcher: () => Promise<T>, ttl?: number): Promise<void> {
  const result = cached(key, fetcher, ttl);
  if (result.isLoading) {
    await result.refresh();
  }
}
