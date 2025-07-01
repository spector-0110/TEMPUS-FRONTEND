'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthProvider';
import { useHospital } from './HospitalProvider';
import { toast } from 'sonner';
import { DateTime } from 'luxon';
import {
  getAllStaff,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff,
  getStaffPayments,
  createStaffPayment,
  updateStaffPayment,
  deleteStaffPayment,
  markAttendance,
  getStaffAttendance,
  getAttendanceSummary
} from '@/lib/api/staffAPI';

const StaffContext = createContext({
  // Staff list state
  staffList: [],
  staffLoading: false,
  staffError: null,
  
  // Selected staff state
  selectedStaff: null,
  selectedStaffLoading: false,
  selectedStaffError: null,
  
  // Actions
  fetchStaffList: () => {},
  fetchStaffById: () => {},
  createNewStaff: () => {},
  updateExistingStaff: () => {},
  deleteStaffMember: () => {},
  setSelectedStaff: () => {},
  refreshStaffList: () => {},
  
  // Payments
  staffPayments: [],
  paymentsLoading: false,
  paymentsError: null,
  fetchStaffPayments: () => {},
  addStaffPayment: () => {},
  updateExistingPayment: () => {},
  removePayment: () => {},
  
  // Attendance
  staffAttendance: [],
  attendanceLoading: false,
  attendanceError: null,
  attendanceSummary: null,
  fetchStaffAttendance: () => {},
  markStaffAttendance: () => {},
  getAttendanceOverview: () => {},
  
  // Status
  isReady: false,
  isDashboardReady: false,
  setDashboardReady: () => {}
});

export function StaffProvider({ children }) {
  const { user, loading: authLoading } = useAuth();
  const { hospitalDetails, loading: hospitalLoading } = useHospital();
  
  // Main staff list state
  const [staffList, setStaffList] = useState([]);
  const [staffLoading, setStaffLoading] = useState(false);
  const [staffError, setStaffError] = useState(null);
  
  // Selected staff state
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [selectedStaffLoading, setSelectedStaffLoading] = useState(false);
  const [selectedStaffError, setSelectedStaffError] = useState(null);
  
  // Payments state
  const [staffPayments, setStaffPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [paymentsError, setPaymentsError] = useState(null);
  
  // Attendance state
  const [staffAttendance, setStaffAttendance] = useState([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceError, setAttendanceError] = useState(null);
  const [attendanceSummary, setAttendanceSummary] = useState(null);
  
  // Dashboard ready state
  const [isDashboardReady, setIsDashboardReady] = useState(false);
  
  // Refs for cleanup
  const abortControllerRef = useRef(null);
  const initialFetchDone = useRef(false);
  
  // Computed state
  const isReady = !authLoading && !hospitalLoading && user && hospitalDetails && isDashboardReady;
  
  // Fetch staff list without pagination
  const fetchStaffList = useCallback(async () => {
    if (!isReady) return;
    
    // Cancel previous request if any
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    
    try {
      setStaffLoading(true);
      setStaffError(null);
      
      // Get today's date in IST (only the date part YYYY-MM-DD)
      const today = DateTime.now().setZone('Asia/Kolkata').toFormat('yyyy-MM-dd');
      
      const response = await getAllStaff({
        date: today
      }, {
        signal: abortControllerRef.current.signal
      });
      
      if (response.success) {
        const newStaff = response.data.staff || [];
        setStaffList(newStaff);
        setStaffError(null);
      } else {
        throw new Error(response.message || 'Failed to fetch staff');
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error fetching staff list:', error);
        setStaffError(error.message || 'Failed to load staff');
        toast.error('Failed to load staff list');
      }
    } finally {
      setStaffLoading(false);
    }
  }, [isReady]);
  
  // Fetch individual staff by ID
  const fetchStaffById = useCallback(async (staffId) => {
    if (!isReady || !staffId) return null;
    
    try {
      setSelectedStaffLoading(true);
      setSelectedStaffError(null);
      
      const response = await getStaffById(staffId);
      
      if (response.success) {
        setSelectedStaff(response.data);
        setSelectedStaffError(null);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch staff details');
      }
    } catch (error) {
      console.error('Error fetching staff by ID:', error);
      setSelectedStaffError(error.message || 'Failed to load staff details');
      toast.error('Failed to load staff details');
      return null;
    } finally {
      setSelectedStaffLoading(false);
    }
  }, [isReady]);
  
  // Create new staff
  const createNewStaff = useCallback(async (staffData) => {
    if (!isReady) return null;
    
    try {
      const response = await createStaff(staffData);
      
      if (response.success) {
        // Refresh staff list
        refreshStaffList();
        toast.success('Staff member created successfully');
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to create staff');
      }
    } catch (error) {
      console.error('Error creating staff:', error);
      toast.error(error.message || 'Failed to create staff member');
      throw error;
    }
  }, [isReady]);
  
  // Update existing staff
  const updateExistingStaff = useCallback(async (staffId, updates) => {
    if (!isReady || !staffId) return null;
    
    try {
      const response = await updateStaff(staffId, updates);
      
      if (response.success) {
        // Update staff in list
        setStaffList(prev => prev.map(staff => 
          staff.id === staffId ? { ...staff, ...updates } : staff
        ));
        
        // Update selected staff if it's the same
        if (selectedStaff?.id === staffId) {
          setSelectedStaff(prev => ({ ...prev, ...updates }));
        }
        
        toast.success('Staff member updated successfully');
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to update staff');
      }
    } catch (error) {
      console.error('Error updating staff:', error);
      toast.error(error.message || 'Failed to update staff member');
      throw error;
    }
  }, [isReady, selectedStaff]);
  
  // Delete staff member
  const deleteStaffMember = useCallback(async (staffId) => {
    if (!isReady || !staffId) return false;
    
    try {
      const response = await deleteStaff(staffId);
      
      if (response.success) {
        // Remove from list
        setStaffList(prev => prev.filter(staff => staff.id !== staffId));
        
        // Clear selected if it's the deleted staff
        if (selectedStaff?.id === staffId) {
          setSelectedStaff(null);
        }
        
        toast.success('Staff member deleted successfully');
        return true;
      } else {
        throw new Error(response.message || 'Failed to delete staff');
      }
    } catch (error) {
      console.error('Error deleting staff:', error);
      toast.error(error.message || 'Failed to delete staff member');
      return false;
    }
  }, [isReady, selectedStaff]);
  

  // Refresh staff list
  const refreshStaffList = useCallback(() => {
    fetchStaffList(1, true);
  }, [fetchStaffList]);
  
  // Payments functions
  const fetchStaffPayments = useCallback(async (staffId, queryParams = {}) => {
    if (!isReady || !staffId) return;
    
    try {
      setPaymentsLoading(true);
      setPaymentsError(null);
      
      const response = await getStaffPayments(staffId, queryParams);
      
      if (response.success) {
        setStaffPayments(response.data.payments || []);
        setPaymentsError(null);
      } else {
        throw new Error(response.message || 'Failed to fetch payments');
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      setPaymentsError(error.message || 'Failed to load payments');
      toast.error('Failed to load payments');
    } finally {
      setPaymentsLoading(false);
    }
  }, [isReady]);
  
  const addStaffPayment = useCallback(async (staffId, paymentData) => {
    if (!isReady || !staffId) return null;
    
    try {
      const response = await createStaffPayment(staffId, paymentData);
      
      if (response.success) {
        // Refresh payments
        fetchStaffPayments(staffId);
        toast.success('Payment added successfully');
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to add payment');
      }
    } catch (error) {
      console.error('Error adding payment:', error);
      toast.error(error.message || 'Failed to add payment');
      throw error;
    }
  }, [isReady, fetchStaffPayments]);
  
  const updateExistingPayment = useCallback(async (paymentId, updates) => {
    if (!isReady || !paymentId) return null;
    
    try {
      const response = await updateStaffPayment(paymentId, updates);
      
      if (response.success) {
        // Update payments in state
        setStaffPayments(prev => prev.map(payment => 
          payment.id === paymentId ? { ...payment, ...updates } : payment
        ));
        
        toast.success('Payment updated successfully');
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to update payment');
      }
    } catch (error) {
      console.error('Error updating payment:', error);
      toast.error(error.message || 'Failed to update payment');
      throw error;
    }
  }, [isReady]);
  
  const removePayment = useCallback(async (paymentId) => {
    if (!isReady || !paymentId) return false;
    
    try {
      const response = await deleteStaffPayment(paymentId);
      
      if (response.success) {
        // Remove from state
        setStaffPayments(prev => prev.filter(payment => payment.id !== paymentId));
        toast.success('Payment deleted successfully');
        return true;
      } else {
        throw new Error(response.message || 'Failed to delete payment');
      }
    } catch (error) {
      console.error('Error deleting payment:', error);
      toast.error(error.message || 'Failed to delete payment');
      return false;
    }
  }, [isReady]);
  
  // Attendance functions
  const fetchStaffAttendance = useCallback(async (staffId, queryParams = {}) => {
    if (!isReady || !staffId) return;
    
    try {
      setAttendanceLoading(true);
      setAttendanceError(null);
      
      const response = await getStaffAttendance(staffId, queryParams);
      
      if (response.success) {
        setStaffAttendance(response.data || []);
        setAttendanceError(null);
      } else {
        throw new Error(response.message || 'Failed to fetch attendance');
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
      setAttendanceError(error.message || 'Failed to load attendance');
      toast.error('Failed to load attendance');
    } finally {
      setAttendanceLoading(false);
    }
  }, [isReady]);
  
  const markStaffAttendance = useCallback(async (attendanceData) => {
    if (!isReady) return null;
    
    try {
      const response = await markAttendance(attendanceData);
      
      if (response.success) {
        // Refresh attendance if viewing the same staff
        if (selectedStaff?.id === attendanceData.staffId) {
          fetchStaffAttendance(attendanceData.staffId);
        }
        
        toast.success('Attendance marked successfully');
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to mark attendance');
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
      toast.error(error.message || 'Failed to mark attendance');
      throw error;
    }
  }, [isReady, selectedStaff, fetchStaffAttendance]);
  
  const getAttendanceOverview = useCallback(async (queryParams = {}) => {
    if (!isReady) return;
    
    try {
      const response = await getAttendanceSummary(queryParams);
      
      if (response.success) {
        setAttendanceSummary(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch attendance summary');
      }
    } catch (error) {
      console.error('Error fetching attendance summary:', error);
      toast.error('Failed to load attendance summary');
    }
  }, [isReady]);
  
  // Effect to fetch staff when ready
  useEffect(() => {
    if (isReady && !initialFetchDone.current) {
      initialFetchDone.current = true;
      fetchStaffList();
    }
  }, [isReady, fetchStaffList]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);
  
  const contextValue = {
    // Staff list state
    staffList,
    staffLoading,
    staffError,
    
    // Selected staff state
    selectedStaff,
    selectedStaffLoading,
    selectedStaffError,
        
    // Actions
    fetchStaffList,
    fetchStaffById,
    createNewStaff,
    updateExistingStaff,
    deleteStaffMember,
    setSelectedStaff,
    refreshStaffList,
    
    // Payments
    staffPayments,
    paymentsLoading,
    paymentsError,
    fetchStaffPayments,
    addStaffPayment,
    updateExistingPayment,
    removePayment,
    
    // Attendance
    staffAttendance,
    attendanceLoading,
    attendanceError,
    attendanceSummary,
    fetchStaffAttendance,
    markStaffAttendance,
    getAttendanceOverview,
    
    // Status
    isReady,
    isDashboardReady,
    setDashboardReady: setIsDashboardReady
  };
  
  return (
    <StaffContext.Provider value={contextValue}>
      {children}
    </StaffContext.Provider>
  );
}

export const useStaff = () => {
  const context = useContext(StaffContext);
  if (!context) {
    throw new Error('useStaff must be used within a StaffProvider');
  }
  return context;
};
