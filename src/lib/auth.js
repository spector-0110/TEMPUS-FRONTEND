import supabase from './supabase';

/**
 * function to get the access token from Supabase session
 * This will first try localStorage for faster access and fallback to Supabase API
 */
async function getAuthToken() {  let accessToken = null;
  
  try {
    // First try to get from localStorage directly if available in browser context
    if (typeof window !== 'undefined' && window.localStorage) {
      const supabaseKey = Object.keys(localStorage).find(key => key.startsWith('sb-'));
      
      if (supabaseKey) {
        try {
          const storedAuth = JSON.parse(localStorage.getItem(supabaseKey));
          if (storedAuth && storedAuth.access_token) {
            accessToken = storedAuth.access_token;
          }
        } catch (e) {
          console.error('getAuthToken - Error parsing localStorage auth:', e);
        }
      }
    }
    
    // If localStorage approach didn't work, try the Supabase API with timeout
    if (!accessToken) {
      const sessionPromise = supabase.auth.getSession();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Supabase session retrieval timed out after 5s')), 5000)
      );
      
      const session = await Promise.race([sessionPromise, timeoutPromise]);
      
      const token = session?.data;
      accessToken = token?.session?.access_token;
    }
    
    if (!accessToken) {
      console.error('getAuthToken - No valid access token found');
      throw new Error('Authentication required. Please login again.');
    }
    
    return accessToken;
  } catch (error) {
    console.error('getAuthToken - Failed to retrieve auth token:', error);
    throw new Error(`Authentication error: ${error.message}`);
  }
}

/**
 * Sign in with Google
 */
export async function signInWithGoogle() {
  try {

    const origin = typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_SITE_URL;
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${origin}/dashboard`,
      }
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error signing in with Google:', error.message);
    throw error;
  }
}

/**
 * Sign up with Google
 */
export async function signUpWithGoogle() {
  // For OAuth providers like Google, signIn and signUp are the same operation
  return signInWithGoogle();
}

/**
 * Sign in with email and password
 */
export async function signInWithEmail(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error signing in:', error.message);
    throw error;
  }
}

/**
 * Sign up with email and password
 */
export async function signUpWithEmail(email, password) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error signing up:', error.message);
    throw error;
  }
}

/**
 * Reset password for email
 */
export async function resetPassword(email) {
  try {
    // Get origin safely
    const origin = typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_SITE_URL;
    
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/auth/reset-password`,
    });
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error resetting password:', error.message);
    throw error;
  }
}

/**
 * Sign out current user
 */
export async function signOut() {
  try {
    console.log('Signing out user...');
    
    // First, sign out from Supabase
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Supabase signOut error:', error.message);
      // Don't throw here, continue with cleanup even if Supabase fails
    }
    
    // Clear all authentication caches using the centralized function
    // clearAllAuthCache();

    
    console.log('Sign out completed successfully');
  } catch (error) {
    console.error('Error signing out:', error.message);
    // Even on error, try to clear caches
    try {
      // clearAllAuthCache();
    } catch (cacheError) {
      console.error('Error clearing caches during failed signout:', cacheError);
    }
    throw error;
  }
}

/**
 * Get current session
 * This will first try localStorage for faster access and fallback to Supabase API
 */
export async function getSession() {
  let session = null;
  
  try {
    // First try to get from localStorage directly if available in browser context
    if (typeof window !== 'undefined' && window.localStorage) {
      const supabaseKey = Object.keys(localStorage).find(key => key.startsWith('sb-'));
      
      if (supabaseKey) {
        try {
          const storedAuth = JSON.parse(localStorage.getItem(supabaseKey));
          if (storedAuth && storedAuth.access_token && storedAuth.refresh_token) {
            
            // Check if token is still valid (not expired)
            const expiresAt = storedAuth.expires_at;
            const currentTime = Math.floor(Date.now() / 1000);
            
            if (expiresAt && currentTime < expiresAt) {
              session = {
                session: {
                  access_token: storedAuth.access_token,
                  refresh_token: storedAuth.refresh_token,
                  expires_at: storedAuth.expires_at,
                  expires_in: storedAuth.expires_in,
                  token_type: storedAuth.token_type || 'bearer',
                  user: storedAuth.user
                },
                user: storedAuth.user
              };
            }
          }
        } catch (e) {
          console.error('getSession - Error parsing localStorage auth:', e);
        }
      }
    }
    
    // If localStorage approach didn't work or token expired, try the Supabase API with timeout
    if (!session) {
      const sessionPromise = supabase.auth.getSession();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Supabase session retrieval timed out after 5s')), 5000)
      );
      
      const result = await Promise.race([sessionPromise, timeoutPromise]);
      
      if (result?.data?.session) {
        session = result.data;
      } else {
        return null;
      }
    }
    
    return session;
  } catch (error) {
    console.error('getSession - Failed to retrieve session:', error);
    return null;
  }
}

/**
 * Get current user
 */
export async function getCurrentUser() {
  try {
    const sessionData = await getSession();
    if (!sessionData?.session) return null;
    
    // If we have user data in the session, return it directly
    if (sessionData.user) {
      return sessionData.user;
    }
    
    // Fallback to getUser API if user data not in session
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    
    return data.user;
  } catch (error) {
    console.error('Error getting user:', error.message);
    return null;
  }
}

/**
 * Check if user exists
 */
export async function checkUserExists(email) {
  try {
    const { data, error } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        shouldCreateUser: false // Only send OTP if user exists
      }
    });
    
    // If there's no error, user exists
    // If error code is 400, user doesn't exist
    // Any other error means we couldn't determine
    if (error) {
      if (error.status === 400) {
        return false;
      }
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error checking user existence:', error.message);
    // If we can't check, assume user might exist to be safe
    return null;
  }
}

/**
 * Update user's password
 */
export async function updatePassword(newPassword) {
  try {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating password:', error.message);
    throw error;
  }
}