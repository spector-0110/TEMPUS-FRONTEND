import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Client storage configuration
const CLIENT_STORAGE_KEY = 'supabase_client_cache';
const CLIENT_CACHE_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds

// In-memory client cache
let cachedClient = null;
let clientCacheTimestamp = null;
let refreshTimer = null;

/**
 * Creates a new Supabase client with optimized configuration
 */
function createSupabaseClient() {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    },
    // Configure storage options with more generous timeouts
    global: {
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      fetch: (...args) => {
        return fetch(...args);
      },
    },
  });
}

/**
 * Checks if the cached client is still valid (within 30 minutes)
 */
function isCacheValid() {
  if (!clientCacheTimestamp) return false;
  const now = Date.now();
  return (now - clientCacheTimestamp) < CLIENT_CACHE_DURATION;
}

/**
 * Stores client metadata in localStorage for persistence across browser sessions
 */
function storeClientMetadata() {
  if (typeof window !== 'undefined') {
    try {
      const metadata = {
        timestamp: Date.now(),
        url: supabaseUrl,
        // Don't store the actual client or sensitive keys, just metadata
      };
      localStorage.setItem(CLIENT_STORAGE_KEY, JSON.stringify(metadata));
    } catch (error) {
      console.warn('Failed to store client metadata:', error);
    }
  }
}

/**
 * Retrieves client metadata from localStorage
 */
function getStoredClientMetadata() {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(CLIENT_STORAGE_KEY);
      if (stored) {
        const metadata = JSON.parse(stored);
        // Check if stored metadata is still valid
        const now = Date.now();
        if ((now - metadata.timestamp) < CLIENT_CACHE_DURATION && metadata.url === supabaseUrl) {
          return metadata;
        }
        // Remove expired metadata
        localStorage.removeItem(CLIENT_STORAGE_KEY);
      }
    } catch (error) {
      console.warn('Failed to retrieve client metadata:', error);
      localStorage.removeItem(CLIENT_STORAGE_KEY);
    }
  }
  return null;
}

/**
 * Clears the client cache and resets timers
 */
function clearClientCache() {
  cachedClient = null;
  clientCacheTimestamp = null;
  
  if (refreshTimer) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }
  
  if (typeof window !== 'undefined') {
    localStorage.removeItem(CLIENT_STORAGE_KEY);
  }
}

/**
 * Sets up auto-refresh timer for the client
 */
function setupAutoRefresh() {
  // Clear any existing timer
  if (refreshTimer) {
    clearTimeout(refreshTimer);
  }
  
  // Set up new timer to refresh the client after 30 minutes
  refreshTimer = setTimeout(() => {
    console.log('Auto-refreshing Supabase client...');
    clearClientCache();
    // The next call to getSupabaseClient() will create a fresh client
  }, CLIENT_CACHE_DURATION);
}

/**
 * Gets or creates a cached Supabase client with 30-minute caching and auto-refresh
 * @returns {Object} Supabase client instance
 */
export function getSupabaseClient() {
  // Check if we have a valid cached client
  if (cachedClient && isCacheValid()) {
    return cachedClient;
  }
  
  // Check if we have valid metadata from a previous session
  const storedMetadata = getStoredClientMetadata();
  if (storedMetadata && !cachedClient) {
    // We have valid metadata, but no in-memory cache (likely a new page load)
    console.log('Restoring Supabase client from valid session...');
  }
  
  // Create a new client
  console.log('Creating new Supabase client...');
  cachedClient = createSupabaseClient();
  clientCacheTimestamp = Date.now();
  
  // Store metadata for persistence
  storeClientMetadata();
  
  // Setup auto-refresh
  setupAutoRefresh();
  
  return cachedClient;
}

/**
 * Manually refreshes the Supabase client (useful for force refresh)
 * @returns {Object} New Supabase client instance
 */
export function refreshSupabaseClient() {
  console.log('Manually refreshing Supabase client...');
  clearClientCache();
  return getSupabaseClient();
}

/**
 * Gets the remaining cache time in milliseconds
 * @returns {number} Remaining cache time or 0 if not cached
 */
export function getRemainingCacheTime() {
  if (!clientCacheTimestamp) return 0;
  const elapsed = Date.now() - clientCacheTimestamp;
  const remaining = CLIENT_CACHE_DURATION - elapsed;
  return Math.max(0, remaining);
}

/**
 * Gets cache status information
 * @returns {Object} Cache status object
 */
export function getCacheStatus() {
  return {
    isCached: !!cachedClient,
    isValid: isCacheValid(),
    remainingTime: getRemainingCacheTime(),
    cacheTimestamp: clientCacheTimestamp,
    cacheDuration: CLIENT_CACHE_DURATION
  };
}

// Create the default client using the cached method
const supabase = getSupabaseClient();

// Clean up on page unload (browser environment only)
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    if (refreshTimer) {
      clearTimeout(refreshTimer);
    }
  });
}

export default supabase;