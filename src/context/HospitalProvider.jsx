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
  
  useEffect(() => {
    const fetchDetails = async () => {
      if (!user) {
        setHospitalDetails(null);
        setLoading(false);
        setIsProfileComplete(false);
        return;
      }
      
      try {
        setLoading(true);
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

    if (!authLoading) {
      fetchDetails();
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
    refresh: () => {
      setLoading(true);
      // Using the same function that runs on mount
      fetchHospitalDetails()
        .then((details) => {
          setHospitalDetails(details);
          setIsProfileComplete(true);
          setError(null);
        })
        .catch((err) => {
          setError(err);
          setHospitalDetails(null);
          setIsProfileComplete(false);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };
  
  return (
    <HospitalContext.Provider value={value}>
      {children}
    </HospitalContext.Provider>
  );
}

export const useHospital = () => useContext(HospitalContext);