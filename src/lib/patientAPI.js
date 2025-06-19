import { ServerConnectionError } from './errors';
import CryptoJS from 'crypto-js';

const API_TIMEOUT = 10000; // 10 seconds timeout
const BASE_URL =  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"; ;
const SECRET = process.env.NEXT_PUBLIC_API_SECRET || process.env.API_SECRET;


export function generateSignature(timestampMs, secret) {
  // payload = JSON(body) + timestampMs
  return CryptoJS.HmacSHA256(timestampMs,secret).toString();
}

/**
 * Generate authenticated headers for API requests
 * @returns {Object} Headers object with authentication
 */
export function getHeaders() {
  
  const timestampMs = Date.now().toString(); // UTC ms, no timezone
  const signature = generateSignature(timestampMs, SECRET);
  
  return {
    'Content-Type': 'application/json',
    'x-timestamp': timestampMs,
    'x-signature': signature,
  };
}

/**
 * Common error handler for API responses
 */
async function handleApiResponse(response, errorMessage = 'Request failed') {
  if (!response.ok) {
    try {
      const errorData = await response.json();
      // Create a custom error object with all the details from the backend
      const apiError = new Error(errorData.error || errorMessage);
      console.error('handleApiResponse - Full error data:', errorData);
      apiError.status = response.status;
      apiError.data = errorData; // Store the complete error data from the backend
      apiError.message = errorData.error || errorMessage;

      console.error('handleApiResponse - Error response:', apiError.message);

      throw apiError;
    } catch (parseError) {
      console.error('Could not parse error response:', parseError);
      // If we can't parse the response, throw a basic error with the status
      const basicError = new Error(errorMessage);
      basicError.status = response.status;
      basicError.statusText = response.statusText;
      throw basicError;
    }
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
 * This implementation is the same but will be replaced by the cached version from serverStatus.js
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
 * Track appointment using public token (no authentication required)
 */
export async function trackAppointment(token) {
  try {
    const response = await fetchWithTimeout(`${BASE_URL}/appointments/track/${token}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    });

    const result = await handleApiResponse(response, 'Failed to fetch appointment details');
    return result;
  } catch (error) {
    console.error('trackAppointment - Error tracking appointment:', error);
    
    // Enhanced error handling for tracking
    if (error.status === 404) {
      const enhancedError = new Error('Appointment not found. The tracking link may have expired or the appointment may not exist.');
      enhancedError.status = 404;
      enhancedError.type = 'not-found';
      throw enhancedError;
    } else if (error.status === 400) {
      const enhancedError = new Error('Invalid tracking link. Please check the URL and try again.');
      enhancedError.status = 400;
      enhancedError.type = 'invalid-token';
      throw enhancedError;
    } else if (error.status === 410) {
      const enhancedError = new Error('This tracking link has expired. Please contact the hospital for a new link.');
      enhancedError.status = 410;
      enhancedError.type = 'expired';
      throw enhancedError;
    } else if (error.message?.includes('NetworkError') || error.message?.includes('Failed to fetch')) {
      const enhancedError = new Error('Unable to connect to the server. Please check your internet connection and try again.');
      enhancedError.status = 0;
      enhancedError.type = 'network';
      throw enhancedError;
    }
    
    throw error;
  }
}


/**
 * Create a new appointment (hospital internal)
 */
export async function createAppointment(appointmentData) {
  try {
    const response = await fetchWithTimeout(`${BASE_URL}/appointments`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(appointmentData),
      cache: 'no-store'
    });

    const result = await handleApiResponse(response, 'Failed to create appointment');
    return result;
  } catch (error) {
    console.error('createAppointment - Error creating appointment:', {
      message: error.message,
      status: error.status,
      data: error.data,
      error
    });
    throw error;
  }
}

/**
 * Create a new appointment (hospital internal)
 */
export async function getDetails(subdomain) {
  try {
    const response = await fetchWithTimeout(`${BASE_URL}/appointments/details/${subdomain}`, {
      method: 'GET',
      headers: getHeaders(),
      cache: 'no-store'
    });

    const result = await handleApiResponse(response, 'Failed to get details');
    return result;
  } catch (error) {
    console.error('createAppointment - Error getting appointment creation details:', {
      message: error.message,
      status: error.status,
      data: error.data,
      error
    });
    throw error;
  }
}

/**
 * cancel a  appointment 
 */
export async function cancelAppointment(id) {
  try {
    const response = await fetchWithTimeout(`${BASE_URL}/appointments/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
      cache: 'no-store'
    });

    const result = await handleApiResponse(response, 'Failed to delete appointment');
    return result;
  } catch (error) {
    console.error('cancelAppointment - Error deleting appointment:', {
      message: error.message,
      status: error.status,
      data: error.data,
      error
    });
    throw error;
  }
}