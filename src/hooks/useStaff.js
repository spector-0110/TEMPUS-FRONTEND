'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';
import { useStaff as useStaffContext } from '@/context/StaffContext';
import { toast } from 'sonner';
import { useIsMobile } from './use-mobile';

/**
 * Enhanced staff hook that provides convenient access to staff context
 * with additional computed properties and helper functions
 */
export function useStaff() {
  const context = useStaffContext();
  const isMobile = useIsMobile();
  
  if (!context) {
    throw new Error('useStaff must be used within a StaffProvider');
  }
  
  // Computed properties for better UX
  const computedStats = useMemo(() => {
    const { staffList = [] } = context;

    // Only compute if staffList is not empty
    if (staffList.length === 0) return {
      total: 0,
      active: 0,
      inactive: 0,
      roleCount: 0,
      roleDistribution: {},
      totalMonthlySalary: 0,
      averageSalary: 0,
      roles: []
    };
    
    const activeStaff = staffList.filter(staff => staff.isActive);
    const inactiveStaff = staffList.filter(staff => !staff.isActive);
    const roles = [...new Set(staffList.map(staff => staff.staffRole))].filter(Boolean);
    
    // Role distribution
    const roleDistribution = roles.reduce((acc, role) => {
      acc[role] = staffList.filter(staff => staff.staffRole === role).length;
      return acc;
    }, {});
    
    // Salary analytics
    const totalMonthlySalary = staffList
      .filter(staff => staff.salaryType === 'monthly' && staff.isActive)
      .reduce((sum, staff) => sum + (parseFloat(staff.salaryAmount || 0)), 0);
    
    const averageSalary = activeStaff.length > 0 
      ? activeStaff.reduce((sum, staff) => sum + (parseFloat(staff.salaryAmount || 0)), 0) / activeStaff.length 
      : 0;

    return {
      total: staffList.length,
      active: activeStaff.length,
      inactive: inactiveStaff.length,
      roleCount: roles.length,
      roleDistribution,
      totalMonthlySalary,
      averageSalary,
      roles
    };
  }, [context.staffList]);

  // Staff management helpers
  const staffHelpers = useMemo(() => ({
    activateStaff: async (staffId) => {
      try {
        await context.updateExistingStaff(staffId, { isActive: true });
        toast.success('Staff member activated');
      } catch (error) {
        toast.error('Failed to activate staff member');
      }
    },
    
    deactivateStaff: async (staffId) => {
      try {
        await context.updateExistingStaff(staffId, { isActive: false });
        toast.success('Staff member deactivated');
      } catch (error) {
        toast.error('Failed to deactivate staff member');
      }
    },
    
    getStaffByRole: (role) => {
      return context.staffList.filter(staff => staff.staffRole === role);
    },
    
    getActiveStaff: () => {
      return context.staffList.filter(staff => staff.isActive);
    },
    
    getInactiveStaff: () => {
      return context.staffList.filter(staff => !staff.isActive);
    }
  }), [context]);


  return {
    ...context,
    computedStats,
    isEmpty: context.staffList.length === 0,
    hasError: !!context.staffError,
    isLoading: context.staffLoading,
    isMobile
  };
}

/**
 * Hook for staff form management
 */
export function useStaffForm(initialStaff = null, mode = 'create') {
  const { createNewStaff, updateExistingStaff } = useStaff();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  
  const submitStaff = useCallback(async (formData) => {
    setIsSubmitting(true);
    setFormErrors({});
    
    try {
      // Transform form data
      const transformedData = {
        ...formData,
        age: parseInt(formData.age),
        salaryAmount: parseFloat(formData.salaryAmount),
        salaryCreditCycle: parseInt(formData.salaryCreditCycle)
      };
      
      let result;
      if (mode === 'edit' && initialStaff) {
        result = await updateExistingStaff(initialStaff.id, transformedData);
      } else {
        result = await createNewStaff(transformedData);
      }
      
      return result;
    } catch (error) {
      console.error('Staff form submission error:', error);
      
      // Handle validation errors
      if (error.data?.errors) {
        const errors = {};
        error.data.errors.forEach(err => {
          if (err.path) {
            errors[err.path[0]] = err.message;
          }
        });
        setFormErrors(errors);
      }
      
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [mode, initialStaff, createNewStaff, updateExistingStaff]);
  
  return {
    submitStaff,
    isSubmitting,
    formErrors,
    setFormErrors
  };
}

/**
 * Hook for staff payments management
 */
export function useStaffPayments(staffId) {
  const {
    staffPayments,
    paymentsLoading,
    paymentsError,
    fetchStaffPayments,
    addStaffPayment,
    updateExistingPayment,
    removePayment
  } = useStaff();
  
  const [filters, setFilters] = useState({
    paymentType: '',
    paymentMode: '',
    fromDate: '',
    toDate: '',
    page: 1,
    limit: 10
  });
  
  // Fetch payments when staffId or filters change
  useEffect(() => {
    if (staffId) {
      fetchStaffPayments(staffId, filters);
    }
  }, [staffId, filters, fetchStaffPayments]);
  
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  }, []);
  
  const loadMore = useCallback(() => {
    setFilters(prev => ({ ...prev, page: prev.page + 1 }));
  }, []);
  
  // Computed analytics
  const paymentStats = useMemo(() => {
    const total = staffPayments.reduce((sum, payment) => sum + parseInt(payment.amount), 0);
    const byType = staffPayments.reduce((acc, payment) => {
      acc[payment.paymentType] = (acc[payment.paymentType] || 0) + parseInt(payment.amount);
      return acc;
    }, {});
    
    return {
      totalAmount: total,
      totalPayments: staffPayments.length,
      byType,
      averagePayment: staffPayments.length > 0 ? total / staffPayments.length : 0
    };
  }, [staffPayments]);
  
  return {
    payments: staffPayments,
    loading: paymentsLoading,
    error: paymentsError,
    filters,
    updateFilters,
    loadMore,
    paymentStats,
    addPayment: (paymentData) => addStaffPayment(staffId, paymentData),
    updatePayment: updateExistingPayment,
    deletePayment: removePayment
  };
}

/**
 * Hook for staff attendance management
 */
export function useStaffAttendance(staffId) {
  const {
    staffAttendance,
    attendanceLoading,
    attendanceError,
    fetchStaffAttendance,
    markStaffAttendance
  } = useStaff();
  
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return {
      year: now.getFullYear(),
      month: now.getMonth()
    };
  });
  
  // Fetch attendance for current month
  useEffect(() => {
    if (staffId) {
      const fromDate = new Date(currentMonth.year, currentMonth.month, 1).toISOString();
      const toDate = new Date(currentMonth.year, currentMonth.month + 1, 0).toISOString();
      
      fetchStaffAttendance(staffId, { fromDate, toDate });
    }
  }, [staffId, currentMonth, fetchStaffAttendance]);
  
  // Navigation helpers
  const navigateMonth = useCallback((direction) => {
    setCurrentMonth(prev => {
      let newMonth = prev.month + direction;
      let newYear = prev.year;
      
      if (newMonth > 11) {
        newMonth = 0;
        newYear++;
      } else if (newMonth < 0) {
        newMonth = 11;
        newYear--;
      }
      
      return { year: newYear, month: newMonth };
    });
  }, []);
  
  // Attendance analytics
  const attendanceStats = useMemo(() => {
    const statusCount = staffAttendance.reduce((acc, record) => {
      acc[record.status] = (acc[record.status] || 0) + 1;
      return acc;
    }, {});
    
    const workingDays = staffAttendance.length;
    const presentDays = statusCount.present || 0;
    const absentDays = statusCount.absent || 0;
    const attendanceRate = workingDays > 0 ? (presentDays / workingDays) * 100 : 0;
    
    return {
      workingDays,
      presentDays,
      absentDays,
      attendanceRate: Math.round(attendanceRate),
      statusBreakdown: statusCount
    };
  }, [staffAttendance]);
  
  return {
    attendance: staffAttendance,
    loading: attendanceLoading,
    error: attendanceError,
    currentMonth,
    navigateMonth,
    attendanceStats,
    markAttendance: markStaffAttendance
  };
}