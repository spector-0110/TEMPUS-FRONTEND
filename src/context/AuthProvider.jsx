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
            console.log('Auth state changed:', event);
            
            if (event === 'SIGNED_OUT') {
              console.log('User signed out, clearing state');
              setUser(null);
              // Use a timeout to ensure state is updated before navigation
              setTimeout(() => {
                router.push('/');
              }, 1000);
              return;
            }
            
            if (session) {
              console.log('Session available, updating user');
              const { data } = await supabase.auth.getUser();
              setUser(data?.user || null);
            } else {
              console.log('No session, clearing user');
              setUser(null);
            }
          }
        );
        
        return () => {
          console.log('Unsubscribing from auth changes');
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
        console.log('Signing out user');
        
        // Call Supabase signOut first to ensure server-side session is cleared
        await supabaseSignOut();
        
        // Then clear local state
        setUser(null);
        
        // // Navigate to home page
        // router.push('/');
        
        return true;
      } catch (error) {
        console.error('Error in context signOut:', error);
        
        // Even if there's an error, try to clean up the local state
        try {
          // Force a refresh of the user state
          const currentUser = await getCurrentUser();
          setUser(currentUser); 
        } catch (secondError) {
          // If even this fails, force null state
          console.error('Failed to refresh user state:', secondError);
          setUser(null);
        }
        
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