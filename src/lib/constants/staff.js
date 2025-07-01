/**
 * Constants for staff-related functionality
 */

export const STAFF_ROLES = {
  STAFF_NURSE: 'Staff_Nurse',
  OPD_ASSISTANT: 'OPD_Assistant', 
  RECEPTIONIST: 'Receptionist',
  OPD_MANAGER: 'OPD_Manager',
  HELPER: 'Helper',
  DOCTOR: 'Doctor'
};

export const STAFF_SALARY_TYPES = {
  MONTHLY: 'monthly',
  DAILY: 'daily'
};

export const STAFF_PAYMENT_TYPES = {
  SALARY: 'salary',
  ADVANCE: 'advance',
  BONUS: 'bonus',
  LOAN: 'loan'
};

export const STAFF_PAYMENT_MODES = {
  CASH: 'cash',
  BANK_TRANSFER: 'bank_transfer',
  UPI: 'upi',
  CARD: 'card',
  CHEQUE: 'cheque',
  NET_BANKING: 'net_banking',
  OTHER: 'other'
};

export const STAFF_ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  PAID_LEAVE: 'paid_leave',
  HALF_DAY: 'half_day',
  WEEK_HOLIDAY: 'week_holiday'
};

export const STAFF_STATUS = {
  ACTIVE: true,
  INACTIVE: false
};
