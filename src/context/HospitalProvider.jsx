'use client';

import { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthProvider';
import { fetchHospitalDetails, updateHospitalDetailsAPI,getHospitalDashboard } from '@/lib/api';

const HospitalContext = createContext({
  hospitalDetails: null,
  hospitalDashboardDetails: null,
  loading: true,
  error: null,
  isProfileComplete: false,
  updateHospitalDetails: () => {},
  getHospitalDashboardDetails: () => {},
  refresh: () => {},
  backgroundRefresh: () => {}, // Background refresh without loading state changes
  debouncedRefresh: () => {}, // Refresh with delayed loading state
});

export function HospitalProvider({ children }) {
  const { user, loading: authLoading } = useAuth();

  const [hospitalDetails, setHospitalDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [hospitalDashboardDetails, setHospitalDashboardDetails] = useState(null);
  const initialFetchDone = useRef(false);

  const fetchAndUpdateDetails = useCallback(async () => {
    if (!navigator.onLine) {
      alert("You're offline. Connect to the internet to refresh.");
      return;
    }

    setLoading(true);
    try {
      const dashboardDetails = await getHospitalDashboard(); // Fetch dashboard details
      setHospitalDashboardDetails(dashboardDetails);
      setHospitalDetails(dashboardDetails.hospitalInfo);
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

  // Background refresh that doesn't change loading state
  const backgroundRefresh = useCallback(async () => {
    if (!navigator.onLine) {
      console.log("You're offline. Cannot refresh data.");
      return;
    }

    try {
      const dashboardDetails = await getHospitalDashboard();
      setHospitalDashboardDetails(dashboardDetails);
      setHospitalDetails(dashboardDetails.hospitalInfo);
      setIsProfileComplete(true);
      setError(null);
    } catch (err) {
      console.error('Background refresh error:', err);
      // Don't update UI on error during background refresh
    }
  }, []);

  // Refresh with delayed loading state to prevent flicker
  const debouncedRefresh = useCallback(async (minLoadingTime = 300) => {
    if (!navigator.onLine) {
      alert("You're offline. Connect to the internet to refresh.");
      return;
    }

    let loadingTimer = null;
    const startTime = Date.now();
    
    // Only show loading indicator if fetch takes longer than minLoadingTime
    loadingTimer = setTimeout(() => {
      setLoading(true);
    }, minLoadingTime);
    
    try {
      const dashboardDetails = await getHospitalDashboard();
      
      // Calculate total elapsed time
      const elapsed = Date.now() - startTime;
      
      // If we finished faster than minimum loading time, wait before updating UI
      if (elapsed < minLoadingTime) {
        await new Promise(resolve => setTimeout(resolve, minLoadingTime - elapsed));
      }
      
      setHospitalDashboardDetails(dashboardDetails);
      setHospitalDetails(dashboardDetails.hospitalInfo);
      setIsProfileComplete(true);
      setError(null);
    } catch (err) {
      console.error('Hospital details fetch error:', err);
      setHospitalDetails(null);
      setError(err);
      setIsProfileComplete(false);
    } finally {
      clearTimeout(loadingTimer);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    
    if (!authLoading) {
      if (user && !initialFetchDone.current) {
        initialFetchDone.current = true;
        fetchAndUpdateDetails();
      } else if (!user) {
        // No user, reset states
        setLoading(false);
      }
    }

    // return () => {
    //   // Cleanup function to reset initial fetch state
    //   initialFetchDone.current = false;
    // }
  }, [authLoading, user, fetchAndUpdateDetails]);

  //  Update hospital details function
  const updateHospitalDetails = async (newDetails) => {
    try {
      // Update hospitalDetails with the new details
      const updatedDetails = {
        ...hospitalDetails,
        ...newDetails
      };
      setHospitalDetails(updatedDetails);
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
    hospitalDashboardDetails,
    refresh: fetchAndUpdateDetails,
    backgroundRefresh,
    debouncedRefresh,
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