'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, 
  Phone, 
  CreditCard, 
  Camera, 
  Calendar,
  DollarSign,
  Clock,
  X,
  Save,
  Upload,
  IndianRupee,
  Badge as BadgeIcon
} from 'lucide-react';
import { STAFF_CONSTANTS, getDisplayName } from '@/lib/api/staffAPI';
import { useStaff } from '@/context/StaffContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { validateCreateStaffData, validateUpdateStaffData } from '@/lib/validation/staff-validation';

export function StaffForm({ 
  isOpen, 
  onClose, 
  staff = null, // null for create, staff object for edit
  mode = 'create' // 'create' or 'edit'
}) {
  const isMobile = useIsMobile();
  const { createNewStaff, updateExistingStaff } = useStaff();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [resultMessage, setResultMessage] = useState({ title: '', description: '', isSuccess: true });
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isDirty }
  } = useForm({
    defaultValues: {
      name: '',
      age: '',
      mobileNumber: '',
      aadhaarCard: '',
      photoUrl: '',
      staffRole: '',
      salaryType: 'monthly',
      salaryAmount: '',
      salaryCreditCycle: '1',
      isActive: true
    }
  });
  
  const watchedValues = watch();
  
  // Reset form when staff or mode changes
  useEffect(() => {
    if (staff && mode === 'edit') {
      reset({
        name: staff.name || '',
        age: staff.age?.toString() || '',
        mobileNumber: staff.mobileNumber || '',
        aadhaarCard: staff.aadhaarCard || '',
        photoUrl: staff.photoUrl || '',
        staffRole: staff.staffRole || '',
        salaryType: staff.salaryType || 'monthly',
        salaryAmount: staff.salaryAmount?.toString() || '',
        salaryCreditCycle: staff.salaryCreditCycle?.toString() || '1',
        isActive: staff.isActive !== undefined ? staff.isActive : true
      });
      setPhotoPreview(staff.photoUrl);
    } else {
      reset({
        name: '',
        age: '',
        mobileNumber: '',
        aadhaarCard: '',
        photoUrl: '',
        staffRole: '',
        salaryType: 'monthly',
        salaryAmount: '',
        salaryCreditCycle: '1',
        isActive: true
      });
      setPhotoPreview(null);
    }
  }, [staff, mode, reset]);
  
  // Handle photo URL change
  useEffect(() => {
    if (watchedValues.photoUrl) {
      setPhotoPreview(watchedValues.photoUrl);
    }
  }, [watchedValues.photoUrl]);
  
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setValidationErrors({});
    
    try {
      // Prepare data for validation and API submission
      const formData = {
        ...data,
        age: data.age ? parseInt(data.age) : undefined,
        salaryAmount: data.salaryAmount ? parseFloat(data.salaryAmount) : undefined,
        salaryCreditCycle: data.salaryCreditCycle ? parseInt(data.salaryCreditCycle) : undefined
      };

      // For edit mode, only include fields that have been changed
      if (mode === 'edit' && staff) {
        // Create a clean object with only modified fields
        const updatedFields = {};
        
        // Only include these fields if they've been modified
        // These are the only fields allowed for updates according to backend schema
        const allowedUpdateFields = [
          'name', 'age', 'photoUrl', 'mobileNumber', 'aadhaarCard', 
          'staffRole', 'salaryAmount', 'isActive'
        ];
        
        // Compare values appropriately based on type
        allowedUpdateFields.forEach(field => {
          let originalVal = staff[field];
          let currentVal = formData[field];
          
          // Special handling for numeric fields to ensure proper comparison
          if (field === 'age' || field === 'salaryAmount') {
            originalVal = originalVal !== undefined ? String(originalVal) : '';
            currentVal = currentVal !== undefined ? String(currentVal) : '';
          }

          // Only include if the field has actually changed
          if (originalVal !== currentVal) {
            updatedFields[field] = formData[field];
          }
        });
        
        // Only proceed with update if there are fields to update
        if (Object.keys(updatedFields).length === 0) {
          setResultMessage({
            title: 'No Changes',
            description: 'No changes were detected in the form.',
            isSuccess: true
          });
          setShowResultDialog(true);
          return;
        }

        // Prepare data for the backend update
        const updateData = {
          ...updatedFields
        };
        
        // Validate data using our validation function
        const validationResult = validateUpdateStaffData(updateData);

        if (!validationResult.isValid) {
          // Convert validation errors to form errors
          const errors = {};
          validationResult.errors.forEach(error => {
            errors[error.field] = { message: error.message };
          });
          setValidationErrors(errors);
          setResultMessage({
            title: 'Validation Error',
            description: 'Please fix the validation errors and try again.',
            isSuccess: false
          });
          setShowResultDialog(true);
          return;
        }
        
        await updateExistingStaff(staff.id, validationResult.data);
        // Show success dialog
        setResultMessage({
          title: 'Success',
          description: 'Staff member updated successfully.',
          isSuccess: true
        });
        setShowResultDialog(true);
      } else {
        // Create mode - use all form data
        const validationResult = validateCreateStaffData(formData);

        if (!validationResult.isValid) {
          // Convert validation errors to form errors
          const errors = {};
          validationResult.errors.forEach(error => {
            errors[error.field] = { message: error.message };
          });
          setValidationErrors(errors);
          setResultMessage({
            title: 'Validation Error',
            description: 'Please fix the validation errors and try again.',
            isSuccess: false
          });
          setShowResultDialog(true);
          return;
        }
        
        await createNewStaff(validationResult.data);
        setResultMessage({
          title: 'Success',
          description: 'Staff member created successfully.',
          isSuccess: true
        });
        setShowResultDialog(true);
      }
      
      onClose();
    } catch (error) {
      // Error handling with dialog
      console.error('Form submission error:', error);
      setResultMessage({
        title: 'Error',
        description: error.message || 'An error occurred while saving staff member',
        isSuccess: false
      });
      setShowResultDialog(true);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handlePhotoUrlClear = () => {
    setValue('photoUrl', '');
    setPhotoPreview(null);
  };
  
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getOrdinalSuffix = (num) => {
    const j = num % 10;
    const k = num % 100;
    if (j === 1 && k !== 11) return 'st';
    if (j === 2 && k !== 12) return 'nd';
    if (j === 3 && k !== 13) return 'rd';
    return 'th';
  };

  // Credit Cycle Day Selector Component
  const CreditCycleDaySelector = ({ value, onChange, disabled = false }) => {
    const days = Array.from({ length: 28 }, (_, i) => i + 1);
    
    const handleDaySelect = (day) => {
      if (disabled) return;
      onChange(day.toString());
    };
    
    const getQuickOptions = () => [
      { label: '1st', value: 1 },
      { label: '15th', value: 15 },
      { label: '28th', value: 28 }
    ];
    
    return (
      <DropdownMenu disabled={disabled}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className={`w-full justify-start text-left font-normal ${
              !value ? 'text-muted-foreground' : ''
            } ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
            disabled={disabled}
          >
            <Calendar className="mr-2 h-4 w-4" />
            {value ? `${value}${getOrdinalSuffix(parseInt(value))} to ${value}${getOrdinalSuffix(parseInt(value))}` : 'Select day of month'}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-80" align="start">
          <DropdownMenuLabel>Salary Credit Day (1st-28th of month)</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {/* Quick Options */}
          <div className="p-2">
            <div className="text-xs font-medium text-muted-foreground mb-2">Common Options</div>
            <div className="grid grid-cols-3 gap-1">
              {getQuickOptions().map((option) => (
                <Button
                  key={option.value}
                  variant={value === option.value.toString() ? 'default' : 'outline'}
                  size="sm"
                  className="text-xs h-8"
                  onClick={() => handleDaySelect(option.value)}
                  disabled={disabled}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
          
          <DropdownMenuSeparator />
          
          {/* Calendar Grid */}
          <div className="p-2">
            <div className="text-xs font-medium text-muted-foreground mb-2">All Days</div>
            <div className="grid grid-cols-7 gap-1 max-h-32 overflow-y-auto">
              {days.map((day) => (
                <Button
                  key={day}
                  variant={value === day.toString() ? 'default' : 'ghost'}
                  size="sm"
                  className={`h-8 w-8 p-0 text-xs font-normal ${
                    value === day.toString() 
                      ? 'bg-primary text-primary-foreground' 
                      : 'hover:bg-accent hover:text-accent-foreground'
                  }`}
                  onClick={() => handleDaySelect(day)}
                  disabled={disabled}
                >
                  {day}
                </Button>
              ))}
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };
  
  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className={`${isMobile ? 'w-[95vw] max-w-none h-[95vh]' : 'max-w-2xl max-h-[90vh]'} flex flex-col p-0`}>
          <DialogHeader className="p-6 pb-4 border-b">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <User className="w-5 h-5" />
              {mode === 'edit' ? 'Edit Staff Member' : 'Add New Staff Member'}
            </DialogTitle>
            <DialogDescription>
              {mode === 'edit' 
                ? 'Update staff member information and settings.'
                : 'Fill in the details to add a new staff member to your hospital.'
              }
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col min-h-0">
            
            <div className="flex-1 overflow-auto p-6 space-y-6">
              {/* Photo Section */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Camera className="w-4 h-4" />
                    Profile Photo
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={photoPreview} alt="Staff photo" />
                      <AvatarFallback className="text-lg">
                        {watchedValues.name ? getInitials(watchedValues.name) : <User className="w-6 h-6" />}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                      <Label htmlFor="photoUrl" className="text-sm">Photo URL</Label>
                      <div className="flex gap-2">
                        <Input
                          id="photoUrl"
                          placeholder="Enter photo URL"
                          {...register('photoUrl')}
                          className="flex-1"
                        />
                        {photoPreview && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handlePhotoUrlClear}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Basic Information */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="name"
                      placeholder="Enter full name"
                      {...register('name', {
                        required: 'Name is required',
                        minLength: {
                          value: 2,
                          message: 'Name must be at least 2 characters'
                        },
                        maxLength: {
                          value: 100,
                          message: 'Name cannot exceed 100 characters'
                        }
                      })}
                      className={errors.name || validationErrors.name ? 'border-destructive' : ''}
                    />
                    {(errors.name || validationErrors.name) && (
                      <p className="text-sm text-destructive">
                        {errors.name?.message || validationErrors.name?.message}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="age">
                      Age <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="age"
                      type="number"
                      min="10"
                      max="100"
                      placeholder="Enter age"
                      {...register('age', {
                        required: 'Age is required',
                        min: {
                          value: 10,
                          message: 'Age must be at least 10'
                        },
                        max: {
                          value: 100,
                          message: 'Age cannot exceed 100'
                        }
                      })}
                      className={errors.age || validationErrors.age ? 'border-destructive' : ''}
                    />
                    {(errors.age || validationErrors.age) && (
                      <p className="text-sm text-destructive">
                        {errors.age?.message || validationErrors.age?.message}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="mobileNumber">
                      Mobile Number <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="mobileNumber"
                      placeholder="Enter 10 digit mobile number"
                      maxLength="10"
                      {...register('mobileNumber', {
                        required: 'Mobile number is required',
                        pattern: {
                          value: /^[0-9]{10}$/,
                          message: 'Enter a valid 10 digit mobile number'
                        }
                      })}
                      className={errors.mobileNumber || validationErrors.mobileNumber ? 'border-destructive' : ''}
                    />
                    {(errors.mobileNumber || validationErrors.mobileNumber) && (
                      <p className="text-sm text-destructive">
                        {errors.mobileNumber?.message || validationErrors.mobileNumber?.message}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="aadhaarCard">Aadhaar Card</Label>
                    <Input
                      id="aadhaarCard"
                      maxLength="12"
                      placeholder="Enter 12-digit Aadhaar number"
                      {...register('aadhaarCard', {
                        pattern: {
                          value: /^[0-9]{12}$/,
                          message: 'Enter a valid 12-digit Aadhaar number'
                        }
                      })}
                      className={errors.aadhaarCard || validationErrors.aadhaarCard ? 'border-destructive' : ''}
                    />
                    {(errors.aadhaarCard || validationErrors.aadhaarCard) && (
                      <p className="text-sm text-destructive">
                        {errors.aadhaarCard?.message || validationErrors.aadhaarCard?.message}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              {/* Role Information */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <BadgeIcon className="w-4 h-4" />
                    Role & Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="staffRole">
                      Staff Role <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={watchedValues.staffRole}
                      onValueChange={(value) => setValue('staffRole', value)}
                    >
                      <SelectTrigger className={errors.staffRole || validationErrors.staffRole ? 'border-destructive' : ''}>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(STAFF_CONSTANTS.ROLES).map(([key, value]) => (
                          <SelectItem key={value} value={value}>
                            {getDisplayName.role(value)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <input
                      type="hidden"
                      {...register('staffRole', {
                        required: 'Staff role is required'
                      })}
                    />
                    {(errors.staffRole || validationErrors.staffRole) && (
                      <p className="text-sm text-destructive">
                        {errors.staffRole?.message || validationErrors.staffRole?.message}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="isActive">Status</Label>
                    <Select
                      value={watchedValues.isActive ? 'true' : 'false'}
                      onValueChange={(value) => setValue('isActive', value === 'true')}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Active</SelectItem>
                        <SelectItem value="false">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
              
              {/* Salary Information */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <IndianRupee className="w-4 h-4" />
                    Salary Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="salaryType">
                      Salary Type <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={watchedValues.salaryType}
                      onValueChange={(value) => setValue('salaryType', value)}
                      disabled={mode === 'edit'} // Disable in edit mode
                    >
                      <SelectTrigger className={mode === 'edit' ? 'opacity-70' : ''}>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(STAFF_CONSTANTS.SALARY_TYPES).map(([key, value]) => (
                          <SelectItem key={value} value={value}>
                            {getDisplayName.salaryType(value)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="salaryAmount">
                      Salary Amount (₹) <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="salaryAmount"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Enter amount"
                      {...register('salaryAmount', {
                        required: 'Salary amount is required',
                        min: {
                          value: 0,
                          message: 'Salary amount must be positive'
                        }
                      })}
                      className={errors.salaryAmount || validationErrors.salaryAmount ? 'border-destructive' : ''}
                    />
                    {(errors.salaryAmount || validationErrors.salaryAmount) && (
                      <p className="text-sm text-destructive">
                        {errors.salaryAmount?.message || validationErrors.salaryAmount?.message}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="salaryCreditCycle">
                      Credit Cycle <span className="text-destructive">*</span>
                    </Label>
                    <CreditCycleDaySelector
                      value={watchedValues.salaryCreditCycle}
                      onChange={(value) => setValue('salaryCreditCycle', value)}
                      disabled={mode === 'edit'} // Add disabled prop
                    />
                    <input
                      type="hidden"
                      {...register('salaryCreditCycle', {
                        required: 'Salary credit day is required',
                        min: {
                          value: 1,
                          message: 'Must be between 1st and 28th'
                        },
                        max: {
                          value: 28,
                          message: 'Must be between 1st and 28th'
                        }
                      })}
                    />
                    {(errors.salaryCreditCycle || validationErrors.salaryCreditCycle) && (
                      <p className="text-sm text-destructive">
                        {errors.salaryCreditCycle?.message || validationErrors.salaryCreditCycle?.message}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <DialogFooter className="p-6 pt-4 border-t bg-background shrink-0">
              <div className="flex gap-2 w-full justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="min-w-[100px]"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      {mode === 'edit' ? 'Updating...' : 'Creating...'}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Save className="w-4 h-4" />
                      {mode === 'edit' ? 'Update Staff' : 'Create Staff'}
                    </div>
                  )}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={showResultDialog} onOpenChange={setShowResultDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className={`text-lg font-semibold ${resultMessage.isSuccess ? 'text-green-500' : 'text-destructive'}`}>
              {resultMessage.title}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {resultMessage.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => {
              setShowResultDialog(false);
              if (resultMessage.isSuccess && resultMessage.title !== 'No Changes') {
                onClose();
              }
            }}>
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}