import { z } from 'zod';
import { 
  STAFF_ROLES, 
  STAFF_SALARY_TYPES, 
  STAFF_PAYMENT_TYPES, 
  STAFF_PAYMENT_MODES, 
  STAFF_ATTENDANCE_STATUS,
  STAFF_STATUS 
} from '../constants/staff';

/**
 * Helper function to validate create staff data
 */
export const validateCreateStaffData = (data) => {
  const schema = z.object({
    name: z.string({
      required_error: "Staff name is required",
      invalid_type_error: "Name must be a string"
    }).trim().min(2, "Staff name must be at least 2 characters long").max(100, "Staff name cannot exceed 100 characters"),

    age: z.union([
      z.number().int("Age must be a whole number").min(10, "Age must be at least 10").max(100, "Age cannot exceed 100"),
      z.string().regex(/^\d+$/, "Age must contain only digits").transform(Number).refine(val => val >= 10 && val <= 100, "Age must be between 10 and 100")
    ], {
      required_error: "Age is required",
      invalid_type_error: "Age must be a number"
    }),

    mobileNumber: z.string({
      required_error: "Mobile number is required",
      invalid_type_error: "Mobile number must be a string"
    }).regex(/^[0-9]{10}$/, "Mobile number must be exactly 10 digits"),

    aadhaarCard: z.string({
      invalid_type_error: "Aadhaar card must be a string"
    }).regex(/^[0-9]{12}$/, "Aadhaar card must be exactly 12 digits").optional(),

    photoUrl: z.string({
      invalid_type_error: "Photo URL must be a string"
    }).url("Photo must be a valid URL").optional().or(z.literal("")),

    staffRole: z.enum([
      STAFF_ROLES.STAFF_NURSE,
      STAFF_ROLES.OPD_ASSISTANT,
      STAFF_ROLES.RECEPTIONIST,
      STAFF_ROLES.OPD_MANAGER,
      STAFF_ROLES.HELPER,
      STAFF_ROLES.DOCTOR
    ], {
      required_error: "Staff role is required",
      invalid_type_error: `Staff role must be one of: ${Object.values(STAFF_ROLES).join(', ')}`
    }),

    salaryType: z.enum([STAFF_SALARY_TYPES.MONTHLY, STAFF_SALARY_TYPES.DAILY], {
      required_error: "Salary type is required",
      invalid_type_error: `Salary type must be one of: ${Object.values(STAFF_SALARY_TYPES).join(', ')}`
    }),

    salaryAmount: z.union([
      z.number().positive("Salary amount must be positive"),
      z.string().regex(/^\d+(\.\d{1,2})?$/, "Salary amount must be a valid number with up to 2 decimal places").transform(Number)
    ], {
      required_error: "Salary amount is required",
      invalid_type_error: "Salary amount must be a number"
    }),

    salaryCreditCycle: z.union([
      z.number().int("Salary credit cycle must be a whole number").min(1, "Salary credit cycle must be at least 1 day").max(28, "Salary credit cycle cannot exceed 28 days"),
      z.string().regex(/^\d+$/, "Salary credit cycle must contain only digits").transform(Number).refine(val => val >= 1 && val <= 28, "Salary credit cycle must be between 1 and 28 days")
    ], {
      required_error: "Salary credit cycle is required",
      invalid_type_error: "Salary credit cycle must be a number"
    }),

    isActive: z.boolean({
      invalid_type_error: "Status must be a boolean value"
    }).optional().default(true)
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
};

/**
 * Helper function to validate update staff data
 */
export const validateUpdateStaffData = (data) => {
  const schema = z.object({
    name: z.string({
      invalid_type_error: "Name must be a string"
    }).trim().min(2, "Staff name must be at least 2 characters long").max(100, "Staff name cannot exceed 100 characters").optional(),

    age: z.union([
      z.number().int("Age must be a whole number").min(10, "Age must be at least 10").max(100, "Age cannot exceed 100"),
      z.string().regex(/^\d+$/, "Age must contain only digits").transform(Number).refine(val => val >= 10 && val <= 100, "Age must be between 10 and 100")
    ]).optional(),

    mobileNumber: z.string({
      invalid_type_error: "Mobile number must be a string"
    }).regex(/^[0-9]{10,12}$/, "Mobile number must be between 10-12 digits").optional(),

    aadhaarCard: z.string({
      invalid_type_error: "Aadhaar card must be a string"
    }).regex(/^[0-9]{12}$/, "Aadhaar card must be exactly 12 digits").optional(),

    photoUrl: z.string({
      invalid_type_error: "Photo URL must be a string"
    }).url("Photo must be a valid URL").optional().or(z.literal("")),

    staffRole: z.enum([
      STAFF_ROLES.STAFF_NURSE,
      STAFF_ROLES.OPD_ASSISTANT,
      STAFF_ROLES.RECEPTIONIST,
      STAFF_ROLES.OPD_MANAGER,
      STAFF_ROLES.HELPER,
      STAFF_ROLES.DOCTOR
    ], {
      invalid_type_error: `Staff role must be one of: ${Object.values(STAFF_ROLES).join(', ')}`
    }).optional(),

    salaryAmount: z.union([
      z.number().positive("Salary amount must be positive"),
      z.string().regex(/^\d+(\.\d{1,2})?$/, "Salary amount must be a valid number with up to 2 decimal places").transform(Number)
    ]).optional(),

    isActive: z.boolean({
      invalid_type_error: "Status must be a boolean value"
    }).optional()
  }).refine(data => {
    // Ensure at least one field (besides staff_id) is provided for update
    const { staff_id, ...updateFields } = data;
    return Object.keys(updateFields).length > 0;
  }, {
    message: "At least one field must be provided for update",
    path: ["root"]
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
};

/**
 * Helper function to validate staff payment data
 */
export const validateCreateStaffPaymentData = (data) => {
  const schema = z.object({
    amount: z.union([
      z.number().positive("Payment amount must be positive"),
      z.string().regex(/^\d+(\.\d{1,2})?$/, "Payment amount must be a valid number with up to 2 decimal places").transform(Number)
    ], {
      required_error: "Payment amount is required",
      invalid_type_error: "Payment amount must be a number"
    }),

    paymentType: z.enum([
      STAFF_PAYMENT_TYPES.SALARY,
      STAFF_PAYMENT_TYPES.ADVANCE,
      STAFF_PAYMENT_TYPES.BONUS,
      STAFF_PAYMENT_TYPES.LOAN
    ], {
      required_error: "Payment type is required",
      invalid_type_error: `Payment type must be one of: ${Object.values(STAFF_PAYMENT_TYPES).join(', ')}`
    }),

    paymentMode: z.enum([
      STAFF_PAYMENT_MODES.CASH,
      STAFF_PAYMENT_MODES.BANK_TRANSFER,
      STAFF_PAYMENT_MODES.UPI,
      STAFF_PAYMENT_MODES.CARD,
      STAFF_PAYMENT_MODES.CHEQUE,
      STAFF_PAYMENT_MODES.NET_BANKING,
      STAFF_PAYMENT_MODES.OTHER
    ], {
      required_error: "Payment mode is required",
      invalid_type_error: `Payment mode must be one of: ${Object.values(STAFF_PAYMENT_MODES).join(', ')}`
    }),

    paymentDate: z.union([
      z.date(),
      z.string().refine(val => !isNaN(Date.parse(val)), "Payment date must be a valid date")
    ], {
      required_error: "Payment date is required",
      invalid_type_error: "Payment date must be a valid date"
    }),

    remarks: z.string({
      invalid_type_error: "Remarks must be a string"
    }).trim().max(500, "Remarks cannot exceed 500 characters").optional()
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
};

/**
 * Helper function to validate update staff payment data
 */
export const validateUpdateStaffPaymentData = (data) => {
  const schema = z.object({
    amount: z.union([
      z.number().positive("Payment amount must be positive"),
      z.string().regex(/^\d+(\.\d{1,2})?$/, "Payment amount must be a valid number with up to 2 decimal places").transform(Number)
    ]).optional(),

    paymentMode: z.enum([
      STAFF_PAYMENT_MODES.CASH,
      STAFF_PAYMENT_MODES.BANK_TRANSFER,
      STAFF_PAYMENT_MODES.UPI,
      STAFF_PAYMENT_MODES.CARD,
      STAFF_PAYMENT_MODES.CHEQUE,
      STAFF_PAYMENT_MODES.NET_BANKING,
      STAFF_PAYMENT_MODES.OTHER
    ], {
      invalid_type_error: `Payment mode must be one of: ${Object.values(STAFF_PAYMENT_MODES).join(', ')}`
    }).optional(),

    paymentDate: z.union([
      z.date(),
      z.string().refine(val => !isNaN(Date.parse(val)), "Payment date must be a valid date")
    ]).optional(),

    remarks: z.string({
      invalid_type_error: "Remarks must be a string"
    }).trim().max(500, "Remarks cannot exceed 500 characters").optional()
  }).refine(data => {
    // Ensure at least one field (besides payment_id) is provided for update
    const { payment_id, ...updateFields } = data;
    return Object.keys(updateFields).length > 0;
  }, {
    message: "At least one field must be provided for update",
    path: ["root"]
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
};

/**
 * Helper function to validate attendance data
 */
export const validateAttendanceData = (data) => {
  const schema = z.object({
    staffId: z.string({
      required_error: "Staff ID is required",
      invalid_type_error: "Staff ID must be a string"
    }).uuid("Staff ID must be a valid UUID"),

    attendanceDate: z.union([
      z.date(),
      z.string().refine(val => !isNaN(Date.parse(val)), "Attendance date must be a valid date")
    ], {
      required_error: "Attendance date is required",
      invalid_type_error: "Attendance date must be a valid date"
    }),

    status: z.enum([
      STAFF_ATTENDANCE_STATUS.PRESENT,
      STAFF_ATTENDANCE_STATUS.ABSENT,
      STAFF_ATTENDANCE_STATUS.PAID_LEAVE,
      STAFF_ATTENDANCE_STATUS.HALF_DAY,
      STAFF_ATTENDANCE_STATUS.WEEK_HOLIDAY
    ], {
      required_error: "Attendance status is required",
      invalid_type_error: `Attendance status must be one of: ${Object.values(STAFF_ATTENDANCE_STATUS).join(', ')}`
    })
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
};

/**
 * Helper function to validate staff ID
 */
export const validateStaffId = (data) => {
  const schema = z.object({
    id: z.string({
      required_error: "Staff ID is required",
      invalid_type_error: "Staff ID must be a string"
    }).uuid("Staff ID must be a valid UUID")
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
};

/**
 * Helper function to validate payment ID
 */
export const validatePaymentId = (data) => {
  const schema = z.object({
    id: z.string({
      required_error: "Payment ID is required",
      invalid_type_error: "Payment ID must be a string"
    }).uuid("Payment ID must be a valid UUID")
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
};

/**
 * Helper function to validate bulk attendance data
 */
export const validateBulkAttendanceData = (data) => {
  const schema = z.object({
    attendanceDate: z.union([
      z.date(),
      z.string().refine(val => !isNaN(Date.parse(val)), "Attendance date must be a valid date")
    ], {
      required_error: "Attendance date is required",
      invalid_type_error: "Attendance date must be a valid date"
    }),

    attendanceRecords: z.array(z.object({
      staffId: z.string({
        required_error: "Staff ID is required",
        invalid_type_error: "Staff ID must be a string"
      }).uuid("Staff ID must be a valid UUID"),

      status: z.enum([
        STAFF_ATTENDANCE_STATUS.PRESENT,
        STAFF_ATTENDANCE_STATUS.ABSENT,
        STAFF_ATTENDANCE_STATUS.PAID_LEAVE,
        STAFF_ATTENDANCE_STATUS.HALF_DAY,
        STAFF_ATTENDANCE_STATUS.WEEK_HOLIDAY
      ], {
        required_error: "Attendance status is required",
        invalid_type_error: `Attendance status must be one of: ${Object.values(STAFF_ATTENDANCE_STATUS).join(', ')}`
      })
    }), {
      required_error: "Attendance records are required",
      invalid_type_error: "Attendance records must be an array"
    }).min(1, "At least one attendance record is required")
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
};