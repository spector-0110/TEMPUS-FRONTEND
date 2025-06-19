'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { CheckCircle, Building2, MapPin, Phone, Mail, User, FileText, AlertTriangle, XCircle } from 'lucide-react';
import { fetchHospitalFormFields, submitHospitalDetails } from '@/lib/api';
import { useIsMobile } from '@/hooks/use-mobile';
import { ErrorDialog } from '@/components/ui/error-dialog';
import { MobileNavigation } from '@/components/ui/mobile-navigation';

const FORM_STORAGE_KEY = 'hospitalFormData';

export default function HospitalRegistrationForm() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formConfig, setFormConfig] = useState({ sections: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [errorDialog, setErrorDialog] = useState({
    isOpen: false,
    title: 'Registration Error',
    message: '',
    details: [],
    errorType: 'api',
    statusCode: null,
    errorData: null
  });

  // Fetch form configuration on mount
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setIsLoading(true);
        const config = await fetchHospitalFormFields();
        setFormConfig(config);
      } catch (error) {
        toast.error('Failed to load form configuration');
        console.error('Error loading form configuration:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConfig();
  }, []);

  // Restore form data from localStorage on mount
  useEffect(() => {
    // Try to get saved form data from localStorage
    const savedFormData = localStorage.getItem(FORM_STORAGE_KEY);
    
    if (savedFormData) {
      try {
        const parsedData = JSON.parse(savedFormData);
        setFormData(parsedData);
        return;
      } catch (e) {
        console.error('Error parsing saved form data:', e);
      }
    }

    // Initialize with empty form data if no saved data exists
    const initialData = {};
    formConfig.sections.forEach(section => {
      section.fields.forEach(field => {
        initialData[field.id] = '';
      });
    });
    setFormData(initialData);
  }, [formConfig]);

  const validateField = useCallback((field, value) => {
    const { validation } = field;
    if (!validation) return '';

    if (validation.required && (!value || value.toString().trim() === '')) {
      return `${field.label} is required`;
    }

    if (validation.pattern && value && value.toString().trim()) {
      const regex = new RegExp(validation.pattern);
      if (!regex.test(value)) return validation.message || `Invalid ${field.label}`;
    }

    if (validation.minLength && value && value.toString().length < validation.minLength) {
      return `${field.label} must be at least ${validation.minLength} characters`;
    }

    if (validation.maxLength && value && value.toString().length > validation.maxLength) {
      return `${field.label} must not exceed ${validation.maxLength} characters`;
    }

    if (validation.min && value && parseInt(value) < validation.min) {
      return `${field.label} must be at least ${validation.min}`;
    }

    if (validation.max && value && parseInt(value) > validation.max) {
      return `${field.label} must not exceed ${validation.max}`;
    }

    return '';
  }, []);

  const validateForm = useCallback(() => {
    const newErrors = {};
    let hasError = false;

    formConfig.sections.forEach(section => {
      section.fields.forEach(field => {
        const value = formData[field.id] || '';
        const error = validateField(field, value);
        if (error) {
          newErrors[field.id] = error;
          hasError = true;
        }
      });
    });

    setErrors(newErrors);
    return !hasError;
  }, [formData, validateField, formConfig]);

  const handleChange = (field, value) => {
    const transformedValue = field.validation?.transform
      ? field.validation.transform(value)
      : value;

    const newFormData = {
      ...formData,
      [field.id]: transformedValue,
    };

    setFormData(newFormData);
    // Save to localStorage after each change
    localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(newFormData));

    // Clear error when user starts typing
    if (errors[field.id]) {
      const error = validateField(field, transformedValue);
      setErrors(prev => ({
        ...prev,
        [field.id]: error,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent multiple submissions
    if (isSubmitting) {
      return;
    }

    setSubmitAttempted(true);

    // Check if there are any empty required fields
    const hasEmptyRequiredFields = formConfig.sections.some(section => 
      section.fields.some(field => 
        field.required && (!formData[field.id] || formData[field.id].toString().trim() === '')
      )
    );

    // First check for empty required fields
    if (hasEmptyRequiredFields) {
      toast.error('Please fill out all required fields before submitting.');
      return;
    }

    // Then validate all field formats
    const isValid = validateForm();
    if (!isValid) {
      toast.error('Please correct the errors in the form before submitting.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await submitHospitalDetails(formData);
      
      // Clear saved form data after successful submission
      localStorage.removeItem(FORM_STORAGE_KEY);
      
      toast.success('Hospital details submitted successfully');
      
      // Show success dialog
      setShowSuccessDialog(true);
      
    } catch (error) {
      console.error('Submission error:', error);
      
      // Prepare error details for the dialog
      let errorMessage = 'Submission failed, please try again.';
      let errorDetails = [];
      let statusCode = null;
      let errorData = null;
      
      // Extract useful information from the error
      if (error) {
        // If there's a message, use it
        if (error.error) {
          errorMessage = error.error;
        }
        
        // If there's a status code (for API errors)
        if (error.status) {
          statusCode = error.status;
        }
        
        // If there are validation errors or other details
        if (error.data) {
          errorData = error.data;
          
          // Format validation errors if present
          if (Array.isArray(error.data.errors)) {
            errorDetails = error.data.errors.map(err => {
              if (typeof err === 'string') return err;
              if (err.field && err.message) return `${err.field}: ${err.message}`;
              return JSON.stringify(err);
            });
          } else if (typeof error.data === 'object') {
            // Handle other error data formats
            errorDetails = Object.entries(error.data).map(([key, value]) => 
              `${key}: ${typeof value === 'object' ? JSON.stringify(value) : value}`
            );
          }
        }
      }
      
      // Show toast for immediate feedback
      toast.error(errorMessage);
      
      // Open the error dialog with details
      setErrorDialog({
        isOpen: true,
        title: 'Registration Error',
        message: errorMessage,
        details: errorDetails,
        errorType: 'api',
        statusCode,
        errorData: errorData || error
      });
    } finally {
      // Always reset submission state in finally block
      setIsSubmitting(false);
    }
  };

  const handleSuccessDialogAction = (action) => {
    
    // Close the dialog immediately
    setShowSuccessDialog(false);
    
    // Navigate to dashboard
    // Hard refresh the page
    window.location.reload(true);
    router.push('/dashboard');
  };

  const getFieldIcon = (sectionId) => {
    const iconMap = {
      'contact': Phone,
      'basic': Building2,
      'address': MapPin,
      'additional': FileText
    };

    return iconMap[sectionId] || FileText;
  };

  const getCompletionPercentage = () => {
    const totalFields = formConfig.sections.reduce((acc, section) => acc + section.fields.length, 0);
    const filledFields = formConfig.sections.reduce((acc, section) => {
      return acc + section.fields.filter(field => {
        const value = formData[field.id];
        return value && value.toString().trim() !== '';
      }).length;
    }, 0);
    return totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0;
  };

  // Check if form has required empty fields for button disabled state
  const hasRequiredEmptyFields = formConfig.sections.some(section => 
    section.fields.some(field => 
      field.required && (!formData[field.id] || formData[field.id].toString().trim() === '')
    )
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="text-muted-foreground font-medium">Loading registration form...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className={`fixed top-0 left-0 right-0 z-[60] transition-all duration-300 ${
        isMobile ? 'w-[98%] mx-auto mt-2' : 'w-[95%] max-w-screen-xl mx-auto'
      }`}>
        <div className="bg-card border border-border shadow-lg rounded-full px-3 py-2.5 sm:px-4 sm:py-2 backdrop-blur-md">
          <div className="container mx-auto">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center space-x-2.5 sm:space-x-3">
                <div className="p-2 sm:p-2 bg-primary rounded-lg shadow-lg shrink-0">
                  <Building2 className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} text-primary-foreground`} />
                </div>
                <div className="min-w-0">
                  <h1 className={`font-bold text-foreground truncate ${isMobile ? 'text-base sm:text-lg' : 'text-2xl'}`}>
                    Hospital Registration
                  </h1>
                </div>
              </div>
              <div className="flex items-center shrink-0 ml-2 gap-2">
                {/* Progress bar - always show */}
                <div className="flex items-center space-x-2">
                  <div className={`${isMobile ? 'w-20 sm:w-24' : 'w-32'} bg-muted rounded-full h-2`}>
                    <div 
                      className="bg-primary h-full rounded-full transition-all duration-300 shadow-lg"
                      style={{ width: `${getCompletionPercentage()}%` }}
                    ></div>
                  </div>
                  <span className={`font-semibold text-foreground ${isMobile ? 'text-xs sm:text-sm' : 'text-sm'} whitespace-nowrap`}>
                    {getCompletionPercentage()}%
                  </span>
                </div>
                 {/* Mobile Navigation or desktop theme switcher */}
                <MobileNavigation variant="inline" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add margin-top to account for fixed header */}
      <div className={`${isMobile ? 'mt-12' : 'mt-11'}`}>
        {/* Form Content */}
        <form onSubmit={handleSubmit}>
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-5xl mx-auto">
              <div className="grid gap-8">
                {formConfig.sections.map((section, sectionIndex) => {
                  const IconComponent = getFieldIcon(section.id);
                  const sectionErrors = section.fields.filter(field => errors[field.id]).length;
                  const sectionCompleted = section.fields.filter(field => {
                    const value = formData[field.id];
                    return value && value.toString().trim() !== '';
                  }).length;

                  return (
                    <Card key={section.id} className="overflow-hidden shadow-lg border border-border bg-card backdrop-blur-md">
                      {/* Section Header */}
                      <div className="bg-muted/50 px-6 py-4 border-b border-border">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-primary/10 backdrop-blur-sm rounded-lg border border-border">
                              <IconComponent className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <h2 className="text-xl font-semibold text-foreground">{section.title}</h2>
                              <p className="text-muted-foreground text-sm">
                                Step {sectionIndex + 1} of {formConfig.sections.length}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-muted-foreground text-sm">
                              {sectionCompleted}/{section.fields.length} completed
                            </div>
                            {sectionErrors > 0 && (
                              <div className="flex items-center text-destructive text-sm mt-1">
                                <AlertTriangle className="w-4 h-4 mr-1" />
                                {sectionErrors} error{sectionErrors > 1 ? 's' : ''}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Section Content */}
                      <div className="p-6 bg-card">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {section.fields.map(field => (
                            <div key={field.id} className="space-y-2">
                              <Label htmlFor={field.id} className="text-sm font-medium text-foreground flex items-center">
                                {field.label}
                                {field.required && <span className="text-destructive ml-1">*</span>}
                              </Label>
                              <div className="relative">
                                <Input
                                  id={field.id}
                                  type={field.type}
                                  value={formData[field.id] || ''}
                                  onChange={(e) => handleChange(field, e.target.value)}
                                  className={`transition-all duration-200 bg-input border-border text-foreground placeholder-muted-foreground focus:ring-2 ${
                                    errors[field.id] 
                                      ? 'border-destructive focus:border-destructive focus:ring-destructive/20' 
                                      : 'border-border focus:border-primary focus:ring-primary/20'
                                  } ${
                                    formData[field.id] && !errors[field.id] 
                                      ? 'border-success bg-success/10' 
                                      : ''
                                  }`}
                                  min={field.validation?.min}
                                  max={field.validation?.max}
                                  placeholder={`Enter ${field.label.toLowerCase()}`}
                                />
                                {formData[field.id] && !errors[field.id] && (
                                  <CheckCircle className="absolute right-3 top-3 w-4 h-4 text-success" />
                                )}
                              </div>
                              {errors[field.id] && (
                                <div className="flex items-center space-x-1 text-sm text-destructive">
                                  <AlertTriangle className="w-4 h-4" />
                                  <span>{errors[field.id]}</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>

              {/* Submit Section */}
              <div className="mt-8">
                <Card className="bg-card backdrop-blur-md border border-border shadow-lg">
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
                      <div className="text-center md:text-left">
                        <h3 className="text-lg font-semibold text-foreground">Ready to Submit?</h3>
                        <p className="text-muted-foreground text-sm mt-1">
                          Please review all information before submitting your registration
                        </p>
                      </div>
                      <Button
                        type="submit"
                        disabled={isSubmitting || hasRequiredEmptyFields}
                        size="lg"
                        className="relative px-8 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-w-[200px]"
                      >
                        {isSubmitting ? (
                          <div className="flex items-center space-x-2">
                            <div className="animate-spin w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full"></div>
                            <span>Submitting...</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4" />
                            <span>Submit Registration</span>
                          </div>
                        )}
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </form>

        {/* Error Dialog */}
        <ErrorDialog
          isOpen={errorDialog.isOpen}
          onClose={() => setErrorDialog(prev => ({ ...prev, isOpen: false }))}
          title={errorDialog.title}
          message={errorDialog.message}
          details={errorDialog.details}
          errorType={errorDialog.errorType}
          statusCode={errorDialog.statusCode}
          errorData={errorDialog.errorData}
        />
        
        {/* Success Dialog */}
        <Dialog 
          open={showSuccessDialog} 
          onOpenChange={setShowSuccessDialog}
        >
          <DialogContent className="sm:max-w-md bg-card border-border text-foreground">
            <DialogHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-success/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-success/30">
                <CheckCircle className="w-8 h-8 text-success" />
              </div>
              <DialogTitle className="text-xl font-semibold text-foreground">
                Registration Successful!
              </DialogTitle>
              <DialogDescription className="text-muted-foreground mt-2">
                Your hospital has been successfully registered in our system. You can now access your dashboard to manage your hospital details and start using our services.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-6">
              <Button
                onClick={() => handleSuccessDialogAction('dashboard')}
                className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Go to Dashboard
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}