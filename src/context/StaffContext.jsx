'use client';

import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import useSWR from 'swr';
import { 
  fetchStaff, 
  fetchStaffById, 
  createStaff, 
  updateStaff, 
  deleteStaff,
  uploadStaffPhoto 
} from '@/lib/api/staffAPI';

const StaffContext = createContext({
  // Staff list state
  staff: [],
  staffLoading: false,
  staffError: null,
  staffMeta: null,
  
  // Selected staff state
  selectedStaff: null,
  selectedStaffLoading: false,
  selectedStaffError: null,
  
  // Pagination state
  currentPage: 1,
  itemsPerPage: 10,
  searchQuery: '',
  sortBy: 'name',
  sortOrder: 'asc',
  
  // Dashboard ready state
  isDashboardReady: false,
  
  // Actions
  setSelectedStaff: () => {},
  refreshStaff: () => {},
  refreshSelectedStaff: () => {},
  setCurrentPage: () => {},
  setSearchQuery: () => {},
  setSortBy: () => {},
  setSortOrder: () => {},
  setItemsPerPage: () => {},
  setIsDashboardReady: () => {},
  createStaffMember: () => {},
  updateStaffMember: () => {},
  deleteStaffMember: () => {},
  uploadStaffMemberPhoto: () => {},
});

// SWR fetcher function
const fetcher = async (url, params) => {
  if (url === 'staff-list') {
    return await fetchStaff(params);
  }
  if (url.startsWith('staff-detail-')) {
    const staffId = url.replace('staff-detail-', '');
    return await fetchStaffById(staffId);
  }
  throw new Error('Unknown fetcher URL');
};

export function StaffProvider({ children }) {
  // State for pagination and filters
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedStaffId, setSelectedStaffId] = useState(null);
  const [isDashboardReady, setIsDashboardReady] = useState(false);

  // Memoized query parameters for staff list
  const staffQueryParams = useMemo(() => ({
    page: currentPage,
    limit: itemsPerPage,
    search: searchQuery,
    sortBy,
    sortOrder,
  }), [currentPage, itemsPerPage, searchQuery, sortBy, sortOrder]);

  // SWR for staff list with conditional fetching
  const {
    data: staffData,
    error: staffError,
    isLoading: staffLoading,
    mutate: refreshStaff
  } = useSWR(
    isDashboardReady ? ['staff-list', staffQueryParams] : null,
    ([url, params]) => fetcher(url, params),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
      errorRetryCount: 3,
      errorRetryInterval: 1000,
    }
  );

  // SWR for selected staff detail
  const {
    data: selectedStaff,
    error: selectedStaffError,
    isLoading: selectedStaffLoading,
    mutate: refreshSelectedStaff
  } = useSWR(
    selectedStaffId && isDashboardReady ? `staff-detail-${selectedStaffId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
      errorRetryCount: 3,
      errorRetryInterval: 1000,
    }
  );

  // Extract staff list and meta from response
  const staff = useMemo(() => staffData?.data || [], [staffData]);
  const staffMeta = useMemo(() => staffData?.meta || null, [staffData]);

  // Action to set selected staff
  const setSelectedStaff = useCallback((staffId) => {
    setSelectedStaffId(staffId);
  }, []);

  // Action to create staff member
  const createStaffMember = useCallback(async (staffData) => {
    try {
      const result = await createStaff(staffData);
      
      // Refresh the staff list
      await refreshStaff();
      
      return { success: true, data: result };
    } catch (error) {
      console.error('Failed to create staff member:', error);
      return { success: false, error: error.message };
    }
  }, [refreshStaff]);

  // Action to update staff member
  const updateStaffMember = useCallback(async (staffId, staffData) => {
    try {
      const result = await updateStaff(staffId, staffData);
      
      // Refresh both the staff list and selected staff if it's the same
      await refreshStaff();
      if (selectedStaffId === staffId) {
        await refreshSelectedStaff();
      }
      
      return { success: true, data: result };
    } catch (error) {
      console.error('Failed to update staff member:', error);
      return { success: false, error: error.message };
    }
  }, [refreshStaff, refreshSelectedStaff, selectedStaffId]);

  // Action to delete staff member
  const deleteStaffMember = useCallback(async (staffId) => {
    try {
      await deleteStaff(staffId);
      
      // Refresh the staff list
      await refreshStaff();
      
      // Clear selected staff if it was deleted
      if (selectedStaffId === staffId) {
        setSelectedStaffId(null);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Failed to delete staff member:', error);
      return { success: false, error: error.message };
    }
  }, [refreshStaff, selectedStaffId]);

  // Action to upload staff photo
  const uploadStaffMemberPhoto = useCallback(async (file, staffId) => {
    try {
      const result = await uploadStaffPhoto(file, staffId);
      
      // Refresh both the staff list and selected staff if it's the same
      await refreshStaff();
      if (selectedStaffId === staffId) {
        await refreshSelectedStaff();
      }
      
      return { success: true, data: result };
    } catch (error) {
      console.error('Failed to upload staff photo:', error);
      return { success: false, error: error.message };
    }
  }, [refreshStaff, refreshSelectedStaff, selectedStaffId]);

  // Search with debouncing effect
  const debouncedSetSearchQuery = useCallback((query) => {
    setCurrentPage(1); // Reset to first page when searching
    setSearchQuery(query);
  }, []);

  // Sort handlers
  const handleSortChange = useCallback((field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setCurrentPage(1); // Reset to first page when sorting
  }, [sortBy, sortOrder]);

  // Page change handler
  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  // Items per page change handler
  const handleItemsPerPageChange = useCallback((limit) => {
    setItemsPerPage(limit);
    setCurrentPage(1); // Reset to first page when changing page size
  }, []);

  const contextValue = useMemo(() => ({
    // Staff list state
    staff,
    staffLoading,
    staffError,
    staffMeta,
    
    // Selected staff state
    selectedStaff,
    selectedStaffLoading,
    selectedStaffError,
    
    // Pagination state
    currentPage,
    itemsPerPage,
    searchQuery,
    sortBy,
    sortOrder,
    
    // Dashboard ready state
    isDashboardReady,
    
    // Actions
    setSelectedStaff,
    refreshStaff,
    refreshSelectedStaff,
    setCurrentPage: handlePageChange,
    setSearchQuery: debouncedSetSearchQuery,
    setSortBy,
    setSortOrder,
    setItemsPerPage: handleItemsPerPageChange,
    setIsDashboardReady,
    createStaffMember,
    updateStaffMember,
    deleteStaffMember,
    uploadStaffMemberPhoto,
    handleSortChange,
  }), [
    staff,
    staffLoading,
    staffError,
    staffMeta,
    selectedStaff,
    selectedStaffLoading,
    selectedStaffError,
    currentPage,
    itemsPerPage,
    searchQuery,
    sortBy,
    sortOrder,
    isDashboardReady,
    setSelectedStaff,
    refreshStaff,
    refreshSelectedStaff,
    handlePageChange,
    debouncedSetSearchQuery,
    handleItemsPerPageChange,
    createStaffMember,
    updateStaffMember,
    deleteStaffMember,
    uploadStaffMemberPhoto,
    handleSortChange,
  ]);

  return (
    <StaffContext.Provider value={contextValue}>
      {children}
    </StaffContext.Provider>
  );
}

// Custom hook to use staff context
export function useStaff() {
  const context = useContext(StaffContext);
  if (!context) {
    throw new Error('useStaff must be used within a StaffProvider');
  }
  return context;
}
