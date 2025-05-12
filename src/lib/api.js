import supabase from './supabase';
import { ServerConnectionError } from './errors';

// Constants for API configuration
const API_TIMEOUT = 8000; // 5 seconds timeout
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
const INDIA_POST_API = 'https://api.postalpincode.in/pincode';

/**
 * Common error handler for API responses
 */
async function handleApiResponse(response, errorMessage = 'Request failed') {
  if (!response.ok) {
    let message = errorMessage;
    try {
      const errorData = await response.json();
      message = errorData.message || errorMessage;
    } catch (parseError) {
      console.error('Could not parse error response:', parseError);
    }
    throw new Error(message);
  }
  return response.json();
}

/**
 * Wrapper function to add timeout to fetch requests
 */
async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), API_TIMEOUT);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    if (error.name === 'AbortError') {
      throw new ServerConnectionError('Request timed out');
    }
    throw error;
  }
}

export async function checkServerStatus() {
  try {
    const response = await fetchWithTimeout(`${BASE_URL}`);
    const res= await handleApiResponse(response, 'Server is not responding');
    return res;
  } catch (error) {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new ServerConnectionError('Backend server is not running');
    }
    if (error instanceof ServerConnectionError) {
      throw error;
    }
    throw new ServerConnectionError('Unable to connect to the backend server');
  }
}

/**
 * Fetches form fields from Redis through backend API
 */
export async function fetchHospitalFormFields() {
  try {
    const session = await supabase.auth.getSession();
    const { data: token } = session;
    
    const response = await fetchWithTimeout(`${BASE_URL}/hospitals/form-config`, {
      headers: {
        'Authorization': `Bearer ${token?.session?.access_token || ''}`,
        'Content-Type': 'application/json'
      }
    });
    return await handleApiResponse(response, 'Error fetching form fields');
  } catch (error) {
    console.error('Error fetching form fields:', error);
    throw error;
  }
}

/**
 * Fetches hospital details if they exist
 * Throws error if hospital doesn't exist
 */
export async function fetchHospitalDetails() {
  try {
    const session = await supabase.auth.getSession();
    const { data: token } = session;

    const response = await fetchWithTimeout(`${BASE_URL}/hospitals/details`, {
      headers: {
        'Authorization': `Bearer ${token?.session?.access_token || ''}`,
        'Content-Type': 'application/json'
      }
    });
    
    return handleApiResponse(response, 'Failed to fetch hospital details');
  } catch (error) {
    console.error('Error fetching hospital details:', error);
    throw error;
  }
}

/**
 * Submits hospital registration form data to backend
 */
export async function submitHospitalDetails(formData) {
  try {
    const session = await supabase.auth.getSession();
    const { data: token } = session;
    
    if (!token?.session?.access_token) {
      throw new Error('Authentication required. Please login again.');
    }
    
    const response = await fetchWithTimeout(`${BASE_URL}/hospitals/initial-details`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token.session.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });
    
    return handleApiResponse(response, 'Failed to submit hospital details');
  } catch (error) {
    console.error('Error submitting form data:', {
      message: error.message,
      error
    });
    throw error;
  }
}

export async function fetchLocationsByState() {
  try {
    const response = await fetchWithTimeout('https://cdn-api.co-vin.in/api/v2/admin/location/states');
    return await handleApiResponse(response, 'Failed to fetch states');
  } catch (error) {
    console.error('Error fetching states:', error);
    throw error;
  }
}

export async function fetchLocationsByDistrict(stateId) {
  try {
    const response = await fetchWithTimeout(`https://cdn-api.co-vin.in/api/v2/admin/location/districts/${stateId}`);
    return await handleApiResponse(response, 'Failed to fetch districts');
  } catch (error) {
    console.error('Error fetching districts:', error);
    throw error;
  }
}

export async function fetchLocationByPincode(pincode) {
  try {
    const response = await fetchWithTimeout(`${INDIA_POST_API}/${pincode}`);
    const data = await handleApiResponse(response, 'Failed to fetch location by pincode');
    
    if (data[0].Status === 'Success') {
      const postOffice = data[0].PostOffice[0];
      return {
        state: postOffice.State,
        district: postOffice.District,
        city: postOffice.Block || postOffice.Division,
        area: postOffice.Name
      };
    }
    throw new Error('Invalid pincode');
  } catch (error) {
    console.error('Error fetching location by pincode:', error);
    throw error;
  }
}

// Cache for storing location data to improve performance
const locationCache = {
  states: null,
  districts: {},
  pincodes: {}
};

// Wrapper functions with caching
export async function getCachedLocationsByState() {
  if (locationCache.states) return locationCache.states;
  const data = await fetchLocationsByState();
  locationCache.states = data;
  return data;
}

export async function getCachedLocationsByDistrict(stateId) {
  if (locationCache.districts[stateId]) return locationCache.districts[stateId];
  const data = await fetchLocationsByDistrict(stateId);
  locationCache.districts[stateId] = data;
  return data;
}

export async function getCachedLocationByPincode(pincode) {
  if (locationCache.pincodes[pincode]) return locationCache.pincodes[pincode];
  const data = await fetchLocationByPincode(pincode);
  locationCache.pincodes[pincode] = data;
  return data;
}