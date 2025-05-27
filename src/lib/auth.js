import supabase from './supabase';

/**
 * function to get the access token from Supabase session
 * This will first try localStorage for faster access and fallback to Supabase API
 */
async function getAuthToken() {
  console.log('getAuthToken - Starting token retrieval');
  let accessToken = null;
  
  try {
    // First try to get from localStorage directly if available in browser context
    if (typeof window !== 'undefined' && window.localStorage) {
      console.log('getAuthToken - Trying localStorage approach');
      const supabaseKey = Object.keys(localStorage).find(key => key.startsWith('sb-'));
      
      if (supabaseKey) {
        try {
          const storedAuth = JSON.parse(localStorage.getItem(supabaseKey));
          if (storedAuth && storedAuth.access_token) {
            console.log('getAuthToken - Found token in localStorage');
            accessToken = storedAuth.access_token;
          }
        } catch (e) {
          console.error('getAuthToken - Error parsing localStorage auth:', e);
        }
      }
    }
    
    // If localStorage approach didn't work, try the Supabase API with timeout
    if (!accessToken) {
      console.log('getAuthToken - Falling back to supabase.auth.getSession()');
      const sessionPromise = supabase.auth.getSession();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Supabase session retrieval timed out after 5s')), 5000)
      );
      
      const session = await Promise.race([sessionPromise, timeoutPromise]);
      console.log('getAuthToken - Session promise resolved');
      
      const token = session?.data;
      accessToken = token?.session?.access_token;
    }
    
    if (!accessToken) {
      console.error('getAuthToken - No valid access token found');
      throw new Error('Authentication required. Please login again.');
    }
    
    console.log('getAuthToken - Successfully retrieved access token');
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
    console.log(data);
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
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    console.error('Error signing out:', error.message);
    throw error;
  }
}

/**
 * Get current session
 * This will first try localStorage for faster access and fallback to Supabase API
 */
export async function getSession() {
  console.log('getSession - Starting session retrieval');
  let session = null;
  
  try {
    // First try to get from localStorage directly if available in browser context
    if (typeof window !== 'undefined' && window.localStorage) {
      console.log('getSession - Trying localStorage approach');
      const supabaseKey = Object.keys(localStorage).find(key => key.startsWith('sb-'));
      
      if (supabaseKey) {
        try {
          const storedAuth = JSON.parse(localStorage.getItem(supabaseKey));
          if (storedAuth && storedAuth.access_token && storedAuth.refresh_token) {
            console.log('getSession - Found complete session in localStorage');
            
            // Check if token is still valid (not expired)
            const expiresAt = storedAuth.expires_at;
            const currentTime = Math.floor(Date.now() / 1000);
            
            if (expiresAt && currentTime < expiresAt) {
              console.log('getSession - Token is still valid');
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
            } else {
              console.log('getSession - Token expired, will fallback to API');
            }
          }
        } catch (e) {
          console.error('getSession - Error parsing localStorage auth:', e);
        }
      }
    }
    
    // If localStorage approach didn't work or token expired, try the Supabase API with timeout
    if (!session) {
      console.log('getSession - Falling back to supabase.auth.getSession()');
      const sessionPromise = supabase.auth.getSession();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Supabase session retrieval timed out after 5s')), 5000)
      );
      
      const result = await Promise.race([sessionPromise, timeoutPromise]);
      console.log('getSession - Session promise resolved');
      
      if (result?.data?.session) {
        session = result.data;
        console.log('getSession - Successfully retrieved session from API');
      } else {
        console.log('getSession - No active session found');
        return null;
      }
    }
    
    console.log('getSession - Successfully retrieved session');
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
      console.log('getCurrentUser - Returning user from session');
      return sessionData.user;
    }
    
    // Fallback to getUser API if user data not in session
    console.log('getCurrentUser - Falling back to supabase.auth.getUser()');
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