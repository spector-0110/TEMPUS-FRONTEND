import supabase from './supabase';

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
 */
export async function getSession() {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting session:', error.message);
    return null;
  }
}

/**
 * Get current user
 */
export async function getCurrentUser() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;
    
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