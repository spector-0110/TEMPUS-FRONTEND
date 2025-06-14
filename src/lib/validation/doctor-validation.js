import { z } from 'zod';
import { DOCTOR_STATUS, SCHEDULE_STATUS } from '../constants/doctor';

/**
 * Helper function to validate update doctor data   
 */

export const validateUpdateDoctorData=(data) => {
    // Create schemas for different types of updates
    const basicInfoSchema = z.object({
      doctor_id: z.string({
        required_error: "Doctor ID is required",
        invalid_type_error: "Doctor ID must be a string"
      }),
      name: z.string({
        invalid_type_error: "Name must be a string"
      }).min(2, "Name must be at least 2 characters").max(100, "Name must not exceed 100 characters").optional(),
      specialization: z.string({
        invalid_type_error: "Specialization must be a string"
      }).min(2, "Specialization must be at least 2 characters").max(1000, "Specialization must not exceed 1000 characters").optional(),
      qualification: z.string({
        invalid_type_error: "Qualification must be a string"
      }).min(2, "Qualification must be at least 2 characters").max(1000, "Qualification must not exceed 1000 characters").optional(),
      experience: z.union([
        z.number().int("Experience must be a whole number").min(0, "Experience cannot be negative"), 
        z.string().regex(/^\d+$/, "Experience must contain only digits").transform(Number)
      ]).optional(),
      age: z.union([
        z.number().int("Age must be a whole number").min(20, "Doctor must be at least 20 years old").max(100, "Doctor's age cannot exceed 100 years"),
        z.string().regex(/^\d+$/, "Age must contain only digits").transform(Number)
      ]).optional(),
    });

    const contactInfoSchema = z.object({
      phone: z.string({
        invalid_type_error: "Phone number must be a string"
      }).regex(/^\+?[\d\s-]{8,}$/, "Phone number must be at least 8 digits and can include +, spaces, or hyphens").optional(),
      email: z.string({
        invalid_type_error: "Email must be a string"
      }).email("Invalid email address format").optional(),
    });

    const statusSchema = z.object({
      status: z.enum([DOCTOR_STATUS.ACTIVE, DOCTOR_STATUS.INACTIVE], {
        invalid_type_error: "Status must be either ACTIVE or INACTIVE",
        required_error: "Status is required"
      })
    });

    const otherInfoSchema = z.object({
      photo: z.string({
        invalid_type_error: "Photo URL must be a string"
      }).url("Photo must be a valid URL").optional(),
      aadhar: z.string({
        invalid_type_error: "Aadhar number must be a string"
      }).optional(),
    });

    // Combine all schemas
    const updateSchema = basicInfoSchema.merge(contactInfoSchema).merge(statusSchema).merge(otherInfoSchema);

    try {
      // First validate the structure of the update data
      const validatedData = updateSchema.parse(data);

      // Now perform business logic validations
      const errors = [];

      if (errors.length > 0) {
        return {
          isValid: false,
          errors: errors.map(error => ({
            field: error.field,
            message: error.message
          }))
        };
      }

      return {
        isValid: true,
        data: validatedData,
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
  }

/**
 * Helper function to validate new doctor data
 */

export const validateCreateDoctorData=(data)=> {
    const schema = z.object({
      name: z.string({
        required_error: "Doctor name is required",
        invalid_type_error: "Name must be a string"
      }).min(2, "Name must be at least 2 characters").max(100, "Name must not exceed 100 characters"),
      specialization: z.string({
        required_error: "Specialization is required",
        invalid_type_error: "Specialization must be a string"
      }).min(2, "Specialization must be at least 2 characters").max(100, "Specialization must not exceed 100 characters"),
      qualification: z.string({
        required_error: "Qualification is required",
        invalid_type_error: "Qualification must be a string"
      }).min(2, "Qualification must be at least 2 characters").max(100, "Qualification must not exceed 100 characters"),
      experience: z.number({
        required_error: "Experience is required",
        invalid_type_error: "Experience must be a number"
      }).int("Experience must be a whole number").min(0, "Experience cannot be negative"),
      age: z.number({
        required_error: "Age is required",
        invalid_type_error: "Age must be a number"
      }).int("Age must be a whole number").min(20, "Doctor must be at least 20 years old").max(100, "Doctor's age cannot exceed 100 years"),
      phone: z.string({
        required_error: "Phone number is required",
        invalid_type_error: "Phone number must be a string"
      }).regex(/^\d{10}$/, {
        message: 'Phone number must be exactly 10 digits',
      }),
      email: z.string({
        required_error: "Email is required",
        invalid_type_error: "Email must be a string"
      }).email("Invalid email address format"),
      photo: z.union([
        z.string().url("Photo must be a valid URL"), 
        z.string().refine(val => val === '', { 
          message: 'Photo must be a valid URL or an empty string' 
        })
      ]).optional(),
      aadhar: z.string({
        required_error: "Aadhar number is required",
        invalid_type_error: "Aadhar must be a string"
      }),
    });

    try {
      const validatedData = schema.parse(data);
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
  }

/**
 * Helper function to validate schedule data
 */
 const validateScheduleData=(data) => {
    const timeRangeSchema = z.object({
      start: z.string({
        required_error: "Start time is required",
        invalid_type_error: "Start time must be a string"
      }).regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format. Use HH:MM (24-hour format)'),
      end: z.string({
        required_error: "End time is required",
        invalid_type_error: "End time must be a string"
      }).regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format. Use HH:MM (24-hour format)')
    }).refine(data => data.start < data.end, {
      message: 'End time must be after start time',
      path: ['end'] // Path helps specify which field the error is associated with
    });

    const scheduleSchema = z.object({
      avgConsultationTime: z.number({
        required_error: "Average consultation time is required",
        invalid_type_error: "Average consultation time must be a number"
      }).int("Average consultation time must be a whole number").positive("Average consultation time must be positive"),
      timeRanges: z.array(timeRangeSchema, {
        required_error: "Time ranges are required",
        invalid_type_error: "Time ranges must be an array"
      }).min(1, "At least one time range is required").refine(
        ranges => {
          // Sort ranges by start time
          const sortedRanges = [...ranges].sort((a, b) => a.start.localeCompare(b.start));
          
          // Check for overlaps
          for (let i = 0; i < sortedRanges.length - 1; i++) {
            if (sortedRanges[i].end > sortedRanges[i + 1].start) {
              return false;
            }
          }
          return true;
        },
        {
          message: 'Time ranges must not overlap',
          path: ['timeRanges']
        }
      ),
      status: z.enum([SCHEDULE_STATUS.ACTIVE, SCHEDULE_STATUS.INACTIVE], {
        invalid_type_error: "Status must be either ACTIVE or INACTIVE"
      }).default(SCHEDULE_STATUS.ACTIVE)
    });

    try {
      const validatedData = scheduleSchema.parse(data);
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
  }
  
export const validateAllSchedulesData = (schedules) => {
    // Validate that we have exactly 7 days of schedules
    if (!Array.isArray(schedules) || schedules.length !== 7) {
      return {
        isValid: false,
        errors: [{
          field: 'schedules',
          message: 'Exactly 7 days of schedules are required'
        }]
      };
    }
    
    // Validate each day's schedule and ensure day 0-6 (Sun-Sat) are all present
    const dayIndices = new Set([0, 1, 2, 3, 4, 5, 6]);
    const validatedSchedules = [];
    const errors = [];
    
    schedules.forEach((schedule, index) => {
      if (typeof schedule.dayOfWeek !== 'number' || !dayIndices.has(schedule.dayOfWeek)) {
        errors.push({
          field: `schedules[${index}].dayOfWeek`,
          message: 'Day of week must be a number between 0 (Sunday) and 6 (Saturday)'
        });
        return;
      }
      
      dayIndices.delete(schedule.dayOfWeek);
      
      const validationResult = validateScheduleData(schedule);
      if (!validationResult.isValid) {
        errors.push(...validationResult.errors.map(err => ({
          field: `schedules[${index}].${err.field}`,
          message: err.message
        })));
      } else {
        validatedSchedules.push({
          dayOfWeek: schedule.dayOfWeek,
          ...validationResult.data
        });
      }
    });
    
    // Check if any days are missing
    if (dayIndices.size > 0) {
      errors.push({
        field: 'schedules',
        message: `Missing schedules for days: ${Array.from(dayIndices).join(', ')}`
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
      data: validatedSchedules
    };
  }