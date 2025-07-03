import { ServerConnectionError } from '../errors';
import { createClient } from "@/utils/supabase/client";

// Constants for API configuration
const API_TIMEOUT = 25000; // 25 seconds timeout
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

/**
 * function to get the access token from Supabase session
 */
async function getAuthToken() {
  let accessToken = null;

  try {
    if (!accessToken) {
      const supabase = createClient();
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
 * Common error handler for API responses
 */
async function handleApiResponse(response, errorMessage = 'Request failed') {
  if (!response.ok) {
    let errorData;

    try {
      errorData = await response.json();
    } catch (parseError) {
      console.error('Could not parse error response:', parseError);
      const basicError = new Error(errorMessage);
      basicError.status = response.status;
      basicError.statusText = response.statusText;
      throw basicError;
    }

    const apiError = new Error(errorData.error || errorMessage);
    apiError.status = response.status;
    apiError.data = errorData;

    console.error('handleApiResponse - Error response:', apiError.message);
    throw apiError;
  }
  return response.json();
}

/**
 * Wrapper function to add timeout to fetch requests
 */
async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeout = options.timeout || API_TIMEOUT;
  delete options.timeout; // Remove timeout from options to avoid fetch API errors

  const id = setTimeout(() => {
    controller.abort();
  }, timeout);

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
 * Get all staff members with filtering and pagination
 */
export async function getAllStaff(queryParams = {}, options = {}) {
  try {
    const accessToken = await getAuthToken();

    const searchParams = new URLSearchParams();
    
    // Add date parameter if provided
    if (queryParams.date) {
      searchParams.append('date', queryParams.date);
    }
    
    const url = `${BASE_URL}/staff${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    
    const response = await fetchWithTimeout(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
    });
    
    return handleApiResponse(response, 'Failed to fetch staff list');
  } catch (error) {
    console.error('getAllStaff - Error:', error);
    throw error;
  }
}

/**
 * Get staff member by ID
 */
export async function getStaffById(staffId) {
  try {
    const accessToken = await getAuthToken();

    const response = await fetchWithTimeout(`${BASE_URL}/staff/${staffId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
    });
    
    return handleApiResponse(response, 'Failed to fetch staff details');
  } catch (error) {
    console.error('getStaffById - Error:', error);
    throw error;
  }
}

/**
 * Create new staff member
 */
export async function createStaff(staffData) {
  try {
    const accessToken = await getAuthToken();

    const response = await fetchWithTimeout(`${BASE_URL}/staff`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(staffData),
    });
    
    return handleApiResponse(response, 'Failed to create staff member');
  } catch (error) {
    console.error('createStaff - Error:', error);
    throw error;
  }
}

/**
 * Update existing staff member
 */
export async function updateStaff(staffId, updates) {
  try {
    const accessToken = await getAuthToken();

    const response = await fetchWithTimeout(`${BASE_URL}/staff/${staffId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates),
    });
    
    return handleApiResponse(response, 'Failed to update staff member');
  } catch (error) {
    console.error('updateStaff - Error:', error);
    throw error;
  }
}

/**
 * Delete staff member (if this endpoint exists)
 */
export async function deleteStaff(staffId) {
  try {
    const accessToken = await getAuthToken();

    const response = await fetchWithTimeout(`${BASE_URL}/staff/${staffId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
    });
    
    return handleApiResponse(response, 'Failed to delete staff member');
  } catch (error) {
    console.error('deleteStaff - Error:', error);
    throw error;
  }
}

/**
 * Get staff payments with filtering
 */
export async function getStaffPayments(staffId, queryParams = {}) {
  try {
    const accessToken = await getAuthToken();

    const searchParams = new URLSearchParams();
    
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value);
      }
    });
    
    const url = `${BASE_URL}/staff/${staffId}/payments${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    
    const response = await fetchWithTimeout(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
    });
    
    return handleApiResponse(response, 'Failed to fetch staff payments');
  } catch (error) {
    console.error('getStaffPayments - Error:', error);
    throw error;
  }
}

/**
 * Create staff payment
 */
export async function createStaffPayment(staffId, paymentData) {
  try {
    const accessToken = await getAuthToken();

    const response = await fetchWithTimeout(`${BASE_URL}/staff/${staffId}/payments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(paymentData),
    });
    
    return handleApiResponse(response, 'Failed to create staff payment');
  } catch (error) {
    console.error('createStaffPayment - Error:', error);
    throw error;
  }
}

/**
 * Update staff payment
 */
export async function updateStaffPayment(paymentId, updates) {
  try {
    const accessToken = await getAuthToken();

    const response = await fetchWithTimeout(`${BASE_URL}/staff/payments/${paymentId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates),
    });
    
    return handleApiResponse(response, 'Failed to update staff payment');
  } catch (error) {
    console.error('updateStaffPayment - Error:', error);
    throw error;
  }
}

/**
 * Delete staff payment
 */
export async function deleteStaffPayment(paymentId) {
  try {
    const accessToken = await getAuthToken();

    const response = await fetchWithTimeout(`${BASE_URL}/staff/payments/${paymentId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
    });
    
    return handleApiResponse(response, 'Failed to delete staff payment');
  } catch (error) {
    console.error('deleteStaffPayment - Error:', error);
    throw error;
  }
}

/**
 * Mark/Update staff attendance
 */
export async function markAttendance(attendanceData) {
  try {
    const accessToken = await getAuthToken();

    const response = await fetchWithTimeout(`${BASE_URL}/staff/attendance`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(attendanceData),
    });
    
    return handleApiResponse(response, 'Failed to mark attendance');
  } catch (error) {
    console.error('markAttendance - Error:', error);
    throw error;
  }
}

/**
 * Get staff attendance with filtering
 */
export async function getStaffAttendance(staffId, queryParams = {}) {
  try {
    const accessToken = await getAuthToken();

    const searchParams = new URLSearchParams();
    
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value);
      }
    });
    
    const url = `${BASE_URL}/staff/${staffId}/attendance${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    
    const response = await fetchWithTimeout(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
    });
    
    return handleApiResponse(response, 'Failed to fetch staff attendance');
  } catch (error) {
    console.error('getStaffAttendance - Error:', error);
    throw error;
  }
}

/**
 * Get attendance summary for all staff
 */
export async function getAttendanceSummary(queryParams = {}) {
  try {
    const accessToken = await getAuthToken();

    const searchParams = new URLSearchParams();
    
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value);
      }
    });
    
    const url = `${BASE_URL}/staff/attendance/summary${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    
    const response = await fetchWithTimeout(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
    });
    
    return handleApiResponse(response, 'Failed to fetch attendance summary');
  } catch (error) {
    console.error('getAttendanceSummary - Error:', error);
    throw error;
  }
}

// Staff constants for frontend use
export const STAFF_CONSTANTS = {
  ROLES: {
    STAFF_NURSE: 'Staff_Nurse',
    OPD_ASSISTANT: 'OPD_Assistant',
    RECEPTIONIST: 'Receptionist',
    OPD_MANAGER: 'OPD_Manager',
    HELPER: 'Helper',
    DOCTOR: 'Doctor'
  },
  
  SALARY_TYPES: {
    MONTHLY: 'monthly',
    DAILY: 'daily'
  },
  
  PAYMENT_TYPES: {
    SALARY: 'salary',
    ADVANCE: 'advance',
    BONUS: 'bonus',
    LOAN: 'loan'
  },
  
  PAYMENT_MODES: {
    CASH: 'cash',
    BANK_TRANSFER: 'bank_transfer',
    UPI: 'upi',
    CARD: 'card',
    CHEQUE: 'cheque',
    NET_BANKING: 'net_banking',
    OTHER: 'other'
  },
  
  ATTENDANCE_STATUS: {
    PRESENT: 'present',
    ABSENT: 'absent',
    PAID_LEAVE: 'paid_leave',
    HALF_DAY: 'half_day',
    WEEK_HOLIDAY: 'week_holiday'
  }
};

// Helper functions for UI display
export const getDisplayName = {
  role: (role) => {
    const roleMap = {
      'Staff_Nurse': 'Staff Nurse',
      'OPD_Assistant': 'OPD Assistant',
      'Receptionist': 'Receptionist',
      'OPD_Manager': 'OPD Manager',
      'Helper': 'Helper',
      'Doctor': 'Doctor'
    };
    return roleMap[role] || role;
  },
  
  salaryType: (type) => {
    const typeMap = {
      'monthly': 'Monthly',
      'daily': 'Daily'
    };
    return typeMap[type] || type;
  },
  
  paymentType: (type) => {
    const typeMap = {
      'salary': 'Salary',
      'advance': 'Advance',
      'bonus': 'Bonus',
      'loan': 'Loan'
    };
    return typeMap[type] || type;
  },
  
  paymentMode: (mode) => {
    const modeMap = {
      'cash': 'Cash',
      'bank_transfer': 'Bank Transfer',
      'upi': 'UPI',
      'card': 'Card',
      'cheque': 'Cheque',
      'net_banking': 'Net Banking',
      'other': 'Other'
    };
    return modeMap[mode] || mode;
  },
  
  attendanceStatus: (status) => {
    const statusMap = {
      'present': 'Present',
      'absent': 'Absent',
      'paid_leave': 'Paid Leave',
      'half_day': 'Half Day',
      'week_holiday': 'Week Holiday'
    };
    return statusMap[status] || status;
  }
};
