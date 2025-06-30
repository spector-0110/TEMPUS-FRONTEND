'use client';

import { checkServerStatus } from './api/api';

// Cache management for server status to prevent excessive checks
const SERVER_STATUS_CACHE_KEY = 'tiqora_server_status';
const SERVER_STATUS_CACHE_DURATION = 60 * 1000; // 1 minute cache duration

/**
 * Checks server status with caching to prevent redundant API calls
 * @returns {Promise<{ status: string, isOnline: boolean }>} Server status information
 */
export async function checkServerStatusWithCache() {
  // Try to get from cache first
  const cachedStatus = getServerStatusFromCache();
  if (cachedStatus) {
    return cachedStatus;
  }

  try {
    // If not in cache, make the actual API call
    const result = await checkServerStatus();
    
    // Cache the successful response
    setServerStatusCache({
      status: 'online',
      isOnline: true,
      timestamp: Date.now()
    });
    
    return { status: 'online', isOnline: true };
  } catch (error) {
    console.error('Server status check failed:', error);
    
    // Cache the failed status too, but with a shorter expiration
    setServerStatusCache({
      status: 'offline',
      isOnline: false,
      timestamp: Date.now(),
      error: error.message
    }, 30 * 1000); // Cache offline status for only 30 seconds
    
    return { status: 'offline', isOnline: false, error };
  }
}

/**
 * Get server status from cache if available and not expired
 * @returns {Object|null} Cached server status or null if not available
 */
function getServerStatusFromCache() {
  if (typeof window === 'undefined') {
    return null; // No caching in SSR context
  }
  
  try {
    const cached = localStorage.getItem(SERVER_STATUS_CACHE_KEY);
    if (!cached) return null;
    
    const status = JSON.parse(cached);
    const now = Date.now();
    
    // Check if the cache is still valid
    if (now - status.timestamp < (status.cacheDuration || SERVER_STATUS_CACHE_DURATION)) {
      return {
        status: status.status,
        isOnline: status.isOnline,
        cached: true,
        timestamp: status.timestamp
      };
    }
    
    // Clear expired cache
    localStorage.removeItem(SERVER_STATUS_CACHE_KEY);
    return null;
  } catch (error) {
    console.error('Error reading server status cache:', error);
    return null;
  }
}

/**
 * Cache the server status result
 * @param {Object} status - The status object to cache 
 * @param {number} [duration] - Optional custom cache duration
 */
function setServerStatusCache(status, duration) {
  if (typeof window === 'undefined') {
    return; // No caching in SSR context
  }
  
  try {
    const cacheData = {
      ...status,
      cacheDuration: duration || SERVER_STATUS_CACHE_DURATION
    };
    localStorage.setItem(SERVER_STATUS_CACHE_KEY, JSON.stringify(cacheData));
  } catch (error) {
    console.error('Error caching server status:', error);
  }
}
