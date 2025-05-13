'use client';

import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useAuth } from './AuthProvider';
import { fetchHospitalDetails, updateHospitalDetailsAPI } from '@/lib/api';

const HospitalContext = createContext({
  hospitalDetails: null,
  loading: true,
  error: null,
  isProfileComplete: false,
  updateHospitalDetails: () => {},
  refresh: () => {},
});

export function HospitalProvider({ children }) {
  const { user, loading: authLoading } = useAuth();

  const [hospitalDetails, setHospitalDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isProfileComplete, setIsProfileComplete] = useState(false);

  // Stable, memoized fetch function
  const fetchAndUpdateDetails = useCallback(async () => {
    if (!navigator.onLine) {
      alert("You're offline. Connect to the internet to refresh.");
      return;
    }

    setLoading(true);
    try {
      const details = await fetchHospitalDetails();
      setHospitalDetails(details);
      localStorage.setItem('hospitalDetails', JSON.stringify(details));
      setIsProfileComplete(true);
      setError(null);
    } catch (err) {
      console.error('Hospital details fetch error:', err);
      setHospitalDetails(null);
      setError(err);
      setIsProfileComplete(false);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load from localStorage only once if auth is not loading
  useEffect(() => {
    const saved = localStorage.getItem('hospitalDetails');
    if (saved && !authLoading && user) {
      setHospitalDetails(JSON.parse(saved));
      setIsProfileComplete(true);
      setLoading(false); // Show cached data immediately
    }
  }, [authLoading, user]);

  //  Fetch fresh data when user is authenticated
  useEffect(() => {
    if (!authLoading && user) {
      fetchAndUpdateDetails();
    }
  }, [authLoading, user, fetchAndUpdateDetails]);

  //  Update hospital details in both state and localStorage
  const updateHospitalDetails = async (newDetails) => {
    try {
      // Update hospitalDetails with the new details
      const updatedDetails = {
        ...hospitalDetails,
        ...newDetails
      };
      
      setHospitalDetails(updatedDetails);
      localStorage.setItem('hospitalDetails', JSON.stringify(updatedDetails));
      setIsProfileComplete(true);
    } catch (err) {
      console.error('Error updating hospital details:', err);
      throw err;
    }
  };

  const value = {
    hospitalDetails,
    loading,
    error,
    isProfileComplete,
    updateHospitalDetails,
    refresh: fetchAndUpdateDetails,
  };

  return (
    <HospitalContext.Provider value={value}>
      {children}
    </HospitalContext.Provider>
  );
}

export const useHospital = () => {
  const context = useContext(HospitalContext);
  if (!context) {
    throw new Error('useHospital must be used within a HospitalProvider');
  }
  return context;
};