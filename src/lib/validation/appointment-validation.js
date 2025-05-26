import { z } from 'zod';

/**
 * Validation schema for appointment creation
 */
export const appointmentSchema = z.object({
  patientDetails: z.object({
    name: z.string({
      required_error: "Patient name is required",
      invalid_type_error: "Name must be a string"
    }).min(2, "Name must be at least 2 characters").max(100, "Name must not exceed 100 characters"),
    
    age: z.union([
      z.number().int("Age must be a whole number").min(1, "Age must be at least 1").max(120, "Age cannot exceed 120"),
      z.string().regex(/^\d+$/, "Age must contain only digits").transform(Number)
    ]),
    
    mobile: z.string({
      required_error: "Mobile number is required",
      invalid_type_error: "Mobile number must be a string"
    }).regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian mobile number")
  }),
  
  doctorId: z.string({
    required_error: "Doctor selection is required",
    invalid_type_error: "Doctor ID must be a string"
  }).min(1, "Please select a doctor"),
  
  appointmentSlot: z.object({
    date: z.string({
      required_error: "Appointment date is required"
    }).regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
    
    time: z.string({
      required_error: "Appointment time is required"
    }).regex(/^\d{2}:\d{2}$/, "Time must be in HH:MM format"),
    
    slotId: z.string().optional()
  }),
  
  notes: z.string().max(500, "Notes cannot exceed 500 characters").optional()
});

/**
 * Validates appointment data
 */
export const validateAppointmentData = (data) => {
  try {
    const validatedData = appointmentSchema.parse(data);
    
    // Additional business logic validations
    const errors = [];
    
    // Check if appointment date is not in the past
    const appointmentDate = new Date(validatedData.appointmentSlot.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (appointmentDate < today) {
      errors.push({
        field: 'appointmentSlot.date',
        message: 'Appointment date cannot be in the past'
      });
    }
    
    // Check if appointment is not more than 90 days in future
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 90);
    
    if (appointmentDate > maxDate) {
      errors.push({
        field: 'appointmentSlot.date',
        message: 'Appointment cannot be scheduled more than 90 days in advance'
      });
    }
    
    if (errors.length > 0) {
      return {
        isValid: false,
        errors
      };
    }
    
    return {
      isValid: true,
      data: validatedData
    };
  } catch (error) {
    return {
      isValid: false,
      errors: error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }))
    };
  }
};

/**
 * Appointment status constants
 */
export const APPOINTMENT_STATUS = {
  BOOKED: 'booked',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  MISSED: 'missed',
  RESCHEDULED: 'rescheduled'
};

/**
 * Appointment filter types
 */
export const APPOINTMENT_FILTERS = {
  TIME: {
    TODAY: 'today',
    TOMORROW: 'tomorrow',
    THIS_WEEK: 'this_week',
    HISTORY: 'history'
  },
  STATUS: {
    BOOKED: 'booked',
    COMPLETED: 'completed',
    MISSED: 'missed',
    CANCELLED: 'cancelled'
  }
};
