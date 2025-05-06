import supabase from './supabase';

// Base URL for your custom backend
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const INDIA_POST_API = 'https://api.postalpincode.in/pincode';

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
    console.log('Response from form fields API:', response.body);
    
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
 * Fetches hospital details if they exist
 * Throws error if hospital doesn't exist
 */
export async function fetchHospitalDetails() {
  try {
    const session = await supabase.auth.getSession();
    const { data: token } = session;

    const response = await fetch(`${BASE_URL}/hospitals/details`, {
      headers: {
        'Authorization': `Bearer ${token?.session?.access_token || ''}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Hospital details not found. Please complete your registration.');
      }
      throw new Error('Failed to fetch hospital details');
    }
    
    return await response.json();
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
    // Get authentication token
    const session = await supabase.auth.getSession();
    const { data: token } = session;
    
    if (!token?.session?.access_token) {
      console.error('No auth token available');
      throw new Error('Authentication required. Please login again.');
    }
    
    console.log('Preparing to send form data:', {
      url: `${BASE_URL}/hospitals/initial-details`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token.session.access_token}`,
        'Content-Type': 'application/json'
      }
    });
    
    // Send form data
    const response = await fetch(`${BASE_URL}/hospitals/initial-details`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token.session.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });
    
    // Check for error responses
    if (!response.ok) {
      let errorMessage = 'Failed to submit form';
      console.error('Response not OK:', {
        status: response.status,
        statusText: response.statusText
      });
      
      try {
        const errorData = await response.json();
        console.error('Server error response:', errorData);
        errorMessage = errorData.message || errorMessage;
      } catch (parseError) {
        console.error('Could not parse error response:', parseError);
      }
      
      throw new Error(errorMessage);
    }
    
    // Parse success response
    const result = await response.json();
    console.log('Form submission successful:', result);
    return result;
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
    const response = await fetch('https://cdn-api.co-vin.in/api/v2/admin/location/states');
    if (!response.ok) throw new Error('Failed to fetch states');
    const data = await response.json();
    return {
      states: data.states.map(state => ({
        id: state.state_id.toString(),
        name: state.state_name
      }))
    };
  } catch (error) {
    console.error('Error fetching states:', error);
    throw error;
  }
}

export async function fetchLocationsByDistrict(stateId) {
  try {
    const response = await fetch(`https://cdn-api.co-vin.in/api/v2/admin/location/districts/${stateId}`);
    if (!response.ok) throw new Error('Failed to fetch districts');
    const data = await response.json();
    return {
      districts: data.districts.map(district => ({
        id: district.district_id.toString(),
        name: district.district_name
      }))
    };
  } catch (error) {
    console.error('Error fetching districts:', error);
    throw error;
  }
}

export async function fetchLocationByPincode(pincode) {
  try {
    const response = await fetch(`${INDIA_POST_API}/${pincode}`);
    if (!response.ok) throw new Error('Failed to fetch location by pincode');
    
    const data = await response.json();
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