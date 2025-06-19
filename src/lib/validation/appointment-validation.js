import { z } from 'zod';

/**
 * Validation schema for appointment creation (matching backend flat structure)
 */
export const appointmentSchema = z.object({
  hospitalId: z.string({
    required_error: "Hospital ID is required",
    invalid_type_error: "Hospital ID must be a string"
  }).uuid("Hospital ID must be a valid UUID"),
  
  doctorId: z.string({
    required_error: "Doctor selection is required",
    invalid_type_error: "Doctor ID must be a string"
  }).uuid("Doctor ID must be a valid UUID"),
  
  patientName: z.string({
    required_error: "Patient name is required",
    invalid_type_error: "Name must be a string"
  }).trim().min(2, "Patient name must be at least 2 characters long").max(100, "Patient name cannot exceed 100 characters"),
  
  mobile: z.string({
    required_error: "Mobile number is required",
    invalid_type_error: "Mobile number must be a string"
  }).regex(/^[0-9]{10,12}$/, "Mobile number must be between 10-12 digits"),
  
  age: z.number().int("Age must be a number").min(0, "Age must be at least 0").max(120, "Age cannot exceed 120").nullable().optional(),
  
  appointmentDate: z.string({
    required_error: "Appointment date is required"
  }).datetime({
    message: "Appointment date must be in ISO format (YYYY-MM-DD)"
  }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Appointment date must be in ISO format (YYYY-MM-DD)")),
  
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Start time must be in 24-hour format (HH:MM)").nullable().optional(),
  
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "End time must be in 24-hour format (HH:MM)").nullable().optional(),
  });

/**
 * Validates appointment data for flat structure
 */
export const validateAppointmentData = (data) => {
  try {
    const validatedData = appointmentSchema.parse(data);
    
    // Additional business logic validations
    const errors = [];
    
    // Check if appointment date is not in the past
    const appointmentDate = new Date(validatedData.appointmentDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (appointmentDate < today) {
      errors.push({
        field: 'appointmentDate',
        message: 'Appointment date cannot be in the past'
      });
    }
    
    // Check if appointment is not more than 7 days in future
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 7);
    
    if (appointmentDate > maxDate) {
      errors.push({
        field: 'appointmentDate',
        message: 'Appointment cannot be scheduled more than 7 days in advance'
      });
    }
    
    // Validate time range if both start and end times are provided
    if (validatedData.startTime && validatedData.endTime) {
      if (validatedData.startTime >= validatedData.endTime) {
        errors.push({
          field: 'endTime',
          message: 'End time must be after start time'
        });
      }
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
