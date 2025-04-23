import supabase from './supabase';

// Base URL for your custom backend
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

/**
 * Fetches form fields from Redis through backend API
 */
export async function fetchHospitalFormFields() {
  try {
    const session = await supabase.auth.getSession();
    const { data: token } = session;
    
    const response = await fetch(`${BASE_URL}/hospitals/form-config`, {
      headers: {
        'Authorization': `Bearer ${token?.session?.access_token || ''}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch form fields');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching form fields:', error);
    throw error;
  }
}

/**
 * Fetches subscription plans available to users
 */
export async function fetchSubscriptionPlans() {
  try {
    const response = await fetch(`${BASE_URL}/subscriptions/plans`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch subscription plans');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    throw error;
  }
}

/**
 * Submits form data with subscription plan choice to backend
 */
export async function submitFormWithSubscription(formData, subscriptionPlanId) {
  try {
    const session = await supabase.auth.getSession();
    const { data: token } = session;
    
    const response = await fetch(`${BASE_URL}/submit`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token?.session?.access_token || ''}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        formData,
        subscriptionPlanId
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to submit form');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error submitting form data:', error);
    throw error;
  }
}