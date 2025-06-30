"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getDetails } from '../lib/api/patientAPI';

const DetailsContext = createContext();

export function useDetails() {
  const context = useContext(DetailsContext);
  if (!context) {
    throw new Error('useDetails must be used within a AppointmentDetailsProvider');
  }
  return context;
}

export default function AppointmentDetailsProvider({ children, subdomain }) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchDetails = async (subdomainParam = subdomain) => {
    if (!subdomainParam) {
      setError(new Error('Subdomain is required to fetch details'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const detailsData = await getDetails(subdomainParam);
      setDetails(detailsData);
      setRetryCount(0); // Reset retry count on success
    } catch (err) {
      console.error('Error fetching details:', err);
      setError(err);
      
      // Enhance error handling for common scenarios
      if (err.status === 404) {
        setError(new Error('Hospital configuration not found. Please check the subdomain.'));
      } else if (err.status === 500) {
        setError(new Error('Server error. Please try again later.'));
      } else if (err.message?.includes('Network') || err.message?.includes('timeout')) {
        setError(new Error('Network error. Please check your connection and try again.'));
      }
    } finally {
      setLoading(false);
    }
  };

  const retry = () => {
    if (retryCount < 3) {
      setRetryCount(prev => prev + 1);
      fetchDetails();
    }
  };

  const refreshDetails = () => {
    setRetryCount(0);
    fetchDetails();
  };

  // Fetch details when subdomain changes or component mounts
  useEffect(() => {
    if (subdomain) {
      fetchDetails();
    }
  }, [subdomain]);

  const contextValue = {
    // Data
    details,
    loading,
    error,
    retryCount,
    
    // Actions
    fetchDetails,
    retry,
    refreshDetails,
    
    // Helper getters for common appointment creation data
    get doctors() {
      return details?.data.doctors || [];
    },
    
    get hospitalInfo() {
      return details?.data.hospital || null;
    },
    

    
    // Status checks
    get isReady() {
      return !loading && !error && details !== null;
    },
    
    get canRetry() {
      return !loading && error && retryCount < 3;
    },
    
    get hasData() {
      return details !== null;
    }
  };

  return (
    <DetailsContext.Provider value={contextValue}>
      {children}
    </DetailsContext.Provider>
  );
}