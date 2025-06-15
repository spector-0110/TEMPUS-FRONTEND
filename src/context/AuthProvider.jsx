'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabase';
import { getCurrentUser, signOut as supabaseSignOut } from '@/lib/auth';

// Create the auth context
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      try {
        // Check for current user
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        
        // Subscribe to auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log('Auth state change:', event, !!session);
            
            if (event === 'SIGNED_OUT') {
              console.log('User signed out, clearing state...');
              setUser(null);
              // Navigate immediately without timeout
              router.push('/');
              return;
            }
            
            if (session) {
              const { data } = await supabase.auth.getUser();
              setUser(data?.user || null);
            } else {
              setUser(null);
            }
          }
        );
        
        return () => {
          subscription?.unsubscribe();
        };
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };
    
    initAuth();
  }, [router]);

  // Auth context value
  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    signOut: async () => {
      try {
        console.log('Starting signOut process...');
        
        // Call Supabase signOut first to ensure server-side session is cleared
        await supabaseSignOut();
        
        // Immediately clear local state
        setUser(null);
        
        // Clear any additional auth-related localStorage items
        if (typeof window !== 'undefined') {
          try {
            // Clear any remaining auth cache
            localStorage.removeItem('supabase_client_cache');
          } catch (e) {
            console.warn('Error clearing additional cache:', e);
          }
        }
        
        console.log('SignOut completed, redirecting...');
        
        // Navigate to home page immediately (no timeout)
        router.push('/');
        
        return true;
      } catch (error) {
        console.error('Error in context signOut:', error);
        
        // Even if there's an error, try to clean up the local state
        setUser(null);
        
        // Still try to navigate away from protected routes
        router.push('/');
        
        throw error;
      }
    },
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}