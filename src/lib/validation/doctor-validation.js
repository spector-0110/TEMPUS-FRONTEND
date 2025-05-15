import { z } from 'zod';
import { DOCTOR_STATUS, SCHEDULE_STATUS } from '../constants/doctor';

/**
 * Helper function to validate update doctor data   
 */

export const validateUpdateDoctorData=(data) => {
    // Create schemas for different types of updates
    const basicInfoSchema = z.object({
      doctor_id: z.string(),
      name: z.string().min(2).max(100).optional(),
      specialization: z.string().min(2).max(100).optional(),
      qualification: z.string().min(2).max(100).optional(),
      experience: z.union([z.number().int().min(0), z.string().regex(/^\d+$/).transform(Number)]).optional(),
      age: z.union([z.number().int().min(20).max(100), z.string().regex(/^\d+$/).transform(Number)]).optional(),
    });

    const contactInfoSchema = z.object({
      phone: z.string().regex(/^\+?[\d\s-]{8,}$/).optional(),
      email: z.string().email().optional(),
    });

    const statusSchema = z.object({
      status: z.enum([DOCTOR_STATUS.ACTIVE, DOCTOR_STATUS.INACTIVE])
    });

    const otherInfoSchema = z.object({
      photo: z.string().url().optional(),
      aadhar: z.string().optional(),
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
      name: z.string().min(2).max(100),
      specialization: z.string().min(2).max(100),
      qualification: z.string().min(2).max(100),
      experience: z.number().int().min(0),
      age: z.number().int().min(20).max(100),
      phone: z.string().regex(/^\d{10}$/, {
        message: 'Phone number must be exactly 10 digits',
      }),
      email: z.string().email(),
      photo: z.union([
        z.string().url(), 
        z.string().refine(val => val === '', { 
          message: 'Photo must be a valid URL or an empty string' 
        })
      ]).optional(),
      aadhar: z.string(),
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
      start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
      end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format')
    }).refine(data => data.start < data.end, {
      message: 'End time must be after start time'
    });

    const scheduleSchema = z.object({
      avgConsultationTime: z.number().int().positive(),
      timeRanges: z.array(timeRangeSchema).min(1).refine(
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
          message: 'Time ranges must not overlap'
        }
      ),
      status: z.enum([SCHEDULE_STATUS.ACTIVE, SCHEDULE_STATUS.INACTIVE]).default(SCHEDULE_STATUS.ACTIVE)
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