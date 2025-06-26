"use client";

import { useEffect } from 'react';
import { authService } from '@/lib/auth';
import { useTheme } from 'next-themes';

/**
 * Component to ensure auth session is properly refreshed after OAuth redirects
 * and to maintain cursor functionality during theme changes
 * Place this on pages that users are redirected to after OAuth (like dashboard)
 */
export function AuthRefresh() {
  const { theme, resolvedTheme } = useTheme();

  useEffect(() => {
    const refreshAuthIfNeeded = async () => {
      // Check if we just came from an OAuth redirect
      const urlParams = new URLSearchParams(window.location.search);
      const fromOAuth = urlParams.has('code') || window.location.pathname === '/dashboard' && document.referrer.includes('/auth/callback');
      
      if (fromOAuth) {
        try {
          // Force refresh the session to ensure it's properly loaded
          await authService.forceRefreshSession();
        } catch (error) {
          console.error('Error refreshing auth session:', error);
        }
      }
    };

    // Small delay to ensure auth callback has completed
    const timer = setTimeout(refreshAuthIfNeeded, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Cursor preservation during theme changes
  useEffect(() => {
    const preserveCursor = () => {
      if (typeof document !== 'undefined') {
        // Ensure cursor remains functional during and after theme changes
        document.body.style.cursor = 'auto';
        document.body.style.pointerEvents = 'auto';
        document.documentElement.style.cursor = 'auto';
        document.documentElement.style.pointerEvents = 'auto';
      }
    };

    preserveCursor();
    
    // Also run after a small delay to catch any delayed theme changes
    const timer = setTimeout(preserveCursor, 150);
    
    return () => clearTimeout(timer);
  }, [theme, resolvedTheme]);

  return null; // This component doesn't render anything
}
