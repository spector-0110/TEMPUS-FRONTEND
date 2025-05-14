import supabase from './supabase';
import { ServerConnectionError } from './errors';

// Constants for API configuration
const API_TIMEOUT = 5000; // 5 seconds timeout
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
const INDIA_POST_API = 'https://api.postalpincode.in/pincode';

/**
 * Robust function to get the access token from Supabase session
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
  const id = setTimeout(() => {
    controller.abort();
  }, API_TIMEOUT);
  
  try {
    const startTime = Date.now();
    
    // Combine user signal with our timeout signal if provided
    let signal = controller.signal;
    if (options.signal) {
      // We need to create a new AbortController that aborts if either signal aborts
      const userController = { signal: options.signal };
      signal = AbortSignal.any([controller.signal, userController.signal]);
    }
    
    const response = await fetch(url, {
      ...options,
      signal
    });
    
    // const endTime = Date.now();
    // const responseTime = endTime - startTime;
    // console.log(`fetchWithTimeout [${requestId}] - Response received in ${responseTime}ms with status: ${response.status}`);
    
    // if (responseTime > API_TIMEOUT * 0.8) {
    //   // Log warning for slow responses that are close to timeout
    //   console.warn(`fetchWithTimeout [${requestId}] - Response was slow (${responseTime}ms), close to timeout threshold`);
    // }
    
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);    
    // Provide more detailed error information
    if (error.name === 'AbortError') {
      throw new ServerConnectionError(`Request to ${url} timed out after ${API_TIMEOUT}ms`);
    } else if (error.message === 'Failed to fetch') {
      throw new ServerConnectionError(`Network error: Unable to connect to ${url}. Please check your connection.`);
    } else if (error.message?.includes('NetworkError')) {
      throw new ServerConnectionError(`Network error while connecting to ${url}: ${error.message}`);
    }
    
    throw error;
  }
}

/**
 * Checks if the backend server is running
 */
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
    const accessToken = await getAuthToken();
    
    const response = await fetchWithTimeout(`${BASE_URL}/hospitals/form-config`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
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
    const accessToken = await getAuthToken();

    const response = await fetchWithTimeout(`${BASE_URL}/hospitals/details`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
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
    const accessToken = await getAuthToken();
    
    const response = await fetchWithTimeout(`${BASE_URL}/hospitals/initial-details`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
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

/**
 * Get OTP for hospital details update
 */
export async function getOTPforHospitalDetailsUpdate(formData) {
  try {
    const accessToken = await getAuthToken();
    
    const response = await fetchWithTimeout(`${BASE_URL}/hospitals/request-edit-verification`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
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

/**
 * Verify OTP for hospital details update
 */
export async function verifyOTPforHospitalDeatailsUpdate(formData) {
  try {
    const accessToken = await getAuthToken();
    
    const response = await fetchWithTimeout(`${BASE_URL}/hospitals/verify-edit-otp`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
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

/**
 * Updates hospital details - used by edit form
 */
export async function updateHospitalDetailsAPI(updateData) {
  try {

    const accessToken = await getAuthToken();
    const response = await fetchWithTimeout(`${BASE_URL}/hospitals/update`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData),
        // Ensure we're not caching responses
        cache: 'no-store'
      });

    const result = await handleApiResponse(response, 'Failed to update hospital details');

    return result;
  } catch (error) {
    console.error('updateHospitalDetailsAPI - Error updating hospital details:', error);
    throw error;
  }
}

/**
 * Get hospital dashboard - used to populate data
 */
export async function getHospitalDashboard(updateData) {
  try {

    const accessToken = await getAuthToken();
    const response = await fetchWithTimeout(`${BASE_URL}/hospitals/dashboard`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData),
        // Ensure we're not caching responses
        cache: 'no-store'
      });

    const result = await handleApiResponse(response, 'Failed to fetch hospital dashboard details');

    return result;
  } catch (error) {
    console.error('getHospitalDashboard- Error fetching hospital dashboard:', error);
    throw error;
  }
}

/**
 * update doctor details
 */
export async function updateDoctorDetails(updateData) {
  try {

    const accessToken = await getAuthToken();
    const response = await fetchWithTimeout(`${BASE_URL}/doctors/update-doctor`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData),
        // Ensure we're not caching responses
        cache: 'no-store'
      });

    const result = await handleApiResponse(response, 'Failed to update doctor details');

    return result;
  } catch (error) {
    console.error('updateDoctorDetails- Error updating doctor details:', error);
    throw error;
  }
}

/**
 * update doctor schedule
 */
export async function updateDoctorSchedule(updateData) {
  try {

    const accessToken = await getAuthToken();
    const response = await fetchWithTimeout(`${BASE_URL}/doctors/schedules`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData),
        // Ensure we're not caching responses
        cache: 'no-store'
      });

    const result = await handleApiResponse(response, 'Failed to update doctor schedule details');

    return result;
  } catch (error) {
    console.error('updateDoctorSchedule- Error updating doctor schedule:', error);
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