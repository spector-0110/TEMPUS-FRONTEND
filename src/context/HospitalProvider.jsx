'use client';

import { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { fetchHospitalDetails } from '@/lib/api';

const HospitalContext = createContext();

export function HospitalProvider({ children }) {
  const { user, loading: authLoading } = useAuth();
  const [hospitalDetails, setHospitalDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  
  // Extracted common fetch logic into a reusable function
  const fetchAndUpdateDetails = async () => {
    setLoading(true);
    try {
      const details = await fetchHospitalDetails();
      setHospitalDetails(details);
      setIsProfileComplete(true);
      setError(null);
    } catch (err) {
      console.log('Hospital details fetch error:', err);
      setHospitalDetails(null);
      setError(err);
      setIsProfileComplete(false);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (!user) {
      setHospitalDetails(null);
      setLoading(false);
      setIsProfileComplete(false);
      return;
    }
    
    if (!authLoading) {
      fetchAndUpdateDetails();
    }
  }, [user, authLoading]);
  
  // Method to update hospital details after form submission
  const updateHospitalDetails = (newDetails) => {
    setHospitalDetails(newDetails);
    setIsProfileComplete(true);
  };
  
  const value = {
    hospitalDetails,
    loading,
    error,
    isProfileComplete,
    updateHospitalDetails,
    refresh: fetchAndUpdateDetails // Using the same function directly
  };
  
  return (
    <HospitalContext.Provider value={value}>
      {children}
    </HospitalContext.Provider>
  );
}

export const useHospital = () => useContext(HospitalContext);