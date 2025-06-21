import { createClient } from "@/utils/supabase/client";

/**
 * Central authentication library for handling all auth operations
 */
export class AuthService {
  constructor() {
    this.supabase = createClient();
  }

  /**
   * Sign in with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<{user: object, error: object}>}
   */
  async signIn(email, password) {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      return { user: data.user, error: null };
    } catch (error) {
      return { 
        user: null, 
        error: error instanceof Error ? error.message : "An error occurred" 
      };
    }
  }

  /**
   * Sign up with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {object} options - Additional options like emailRedirectTo
   * @returns {Promise<{user: object, error: object}>}
   */
  async signUp(email, password, options = {}) {
    try {
      const { data, error } = await this.supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          ...options,
        },
      });
      
      if (error) throw error;
      
      return { user: data.user, error: null };
    } catch (error) {
      return { 
        user: null, 
        error: error instanceof Error ? error.message : "An error occurred" 
      };
    }
  }

  /**
   * Send password reset email
   * @param {string} email - User email
   * @param {object} options - Additional options like redirectTo
   * @returns {Promise<{success: boolean, error: object}>}
   */
  async resetPassword(email, options = {}) {
    try {
      const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
        ...options,
      });
      
      if (error) throw error;
      
      return { success: true, error: null };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "An error occurred" 
      };
    }
  }

  /**
   * Update user password
   * @param {string} password - New password
   * @returns {Promise<{user: object, error: object}>}
   */
  async updatePassword(password) {
    try {
      const { data, error } = await this.supabase.auth.updateUser({
        password,
      });
      
      if (error) throw error;
      
      return { user: data.user, error: null };
    } catch (error) {
      return { 
        user: null, 
        error: error instanceof Error ? error.message : "An error occurred" 
      };
    }
  }

  /**
   * Sign out current user
   * @returns {Promise<{error: object}>}
   */
  async signOut() {
    try {
      const { error } = await this.supabase.auth.signOut();
      
      if (error) throw error;

      // Remove hospital form data from localStorage
      localStorage.removeItem('hospitalFormData');
      
      return { error: null };
    } catch (error) {
      return { 
        error: error instanceof Error ? error.message : "An error occurred" 
      };
    }
  }

  /**
   * Get current user session
   * @returns {Promise<{user: object, session: object, error: object}>}
   */
  async getSession() {
    try {
      const { data: { session }, error } = await this.supabase.auth.getSession();
      
      if (error) throw error;
      
      return { 
        user: session?.user || null, 
        session, 
        error: null 
      };
    } catch (error) {
      return { 
        user: null, 
        session: null, 
        error: error instanceof Error ? error.message : "An error occurred" 
      };
    }
  }

  /**
   * Get current user
   * @returns {Promise<{user: object, error: object}>}
   */
  async getUser() {
    try {
      const { data: { user }, error } = await this.supabase.auth.getUser();
      
      if (error) throw error;
      
      return { user, error: null };
    } catch (error) {
      return { 
        user: null, 
        error: error instanceof Error ? error.message : "An error occurred" 
      };
    }
  }

  /**
   * Listen to auth state changes
   * @param {function} callback - Callback function to handle auth state changes
   * @returns {object} Subscription object
   */
  onAuthStateChange(callback) {
    return this.supabase.auth.onAuthStateChange(callback);
  }

  /**
   * Sign in with OAuth provider
   * @param {string} provider - OAuth provider (google, github, etc.)
   * @param {object} options - Additional options
   * @returns {Promise<{error: object}>}
   */
  async signInWithOAuth(provider, options = {}) {
    try {
      const { error } = await this.supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
          ...options,
        },
      });
      
      if (error) throw error;
      
      return { error: null };
    } catch (error) {
      console.error('OAuth sign-in error:', error);
      return { 
        error: error instanceof Error ? error.message : "An error occurred during sign-in" 
      };
    }
  }

  /**
   * Refresh the current session
   * @returns {Promise<{session: object, user: object, error: object}>}
   */
  async refreshSession() {
    try {
      const { data, error } = await this.supabase.auth.refreshSession();
      
      if (error) throw error;
      
      return { 
        session: data.session, 
        user: data.user, 
        error: null 
      };
    } catch (error) {
      return { 
        session: null, 
        user: null, 
        error: error instanceof Error ? error.message : "An error occurred" 
      };
    }
  }

  /**
   * Force refresh user session - useful after OAuth callbacks
   * @returns {Promise<{user: object, session: object, error: object}>}
   */
  async forceRefreshSession() {
    try {
      // First try to refresh the session
      await this.supabase.auth.refreshSession();
      
      // Then get the updated session
      const { data: { session }, error } = await this.supabase.auth.getSession();
      
      if (error) throw error;
      
      return { 
        user: session?.user || null, 
        session, 
        error: null 
      };
    } catch (error) {
      return { 
        user: null, 
        session: null, 
        error: error instanceof Error ? error.message : "An error occurred" 
      };
    }
  }
}

// Create and export a singleton instance
export const authService = new AuthService();

// Export individual functions for convenience
export const {
  signIn,
  signUp,
  resetPassword,
  updatePassword,
  signOut,
  getSession,
  getUser,
  onAuthStateChange,
  signInWithOAuth,
  refreshSession,
  forceRefreshSession,
} = authService;

// Custom hook for React components (optional)
export function useAuth() {
  return authService;
}

// Validation helpers
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  return password.length >= 6;
};

export const validatePasswordMatch = (password, confirmPassword) => {
  return password === confirmPassword;
};

// Common auth error messages
export const AUTH_ERRORS = {
  INVALID_EMAIL: "Please enter a valid email address",
  WEAK_PASSWORD: "Password must be at least 6 characters long",
  PASSWORDS_DONT_MATCH: "Passwords do not match",
  INVALID_CREDENTIALS: "Invalid email or password",
  USER_NOT_FOUND: "User not found",
  EMAIL_ALREADY_EXISTS: "An account with this email already exists",
  NETWORK_ERROR: "Network error. Please check your connection",
  UNKNOWN_ERROR: "An unexpected error occurred",
};
