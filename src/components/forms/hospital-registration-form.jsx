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
import { CheckCircle, Building2, MapPin, Phone, Mail, User, FileText, AlertTriangle } from 'lucide-react';
import { fetchHospitalFormFields ,submitHospitalDetails } from '@/lib/api';
import {useIsMobile} from '@/hooks/use-mobile';

const FORM_STORAGE_KEY = 'hospitalFormData';

export default function HospitalRegistrationForm() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [formConfig, setFormConfig] = useState({ sections: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);

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
    setSubmitAttempted(true);

    if (isSubmitting || isButtonDisabled) return;

    // Check if there are any empty required fields
    const hasEmptyRequiredFields = formConfig.sections.some(section => 
      section.fields.some(field => 
        field.required && (!formData[field.id] || formData[field.id].toString().trim() === '')
      )
    );

    // First check for empty required fields
    if (hasEmptyRequiredFields) {
      toast.error('Please fill out all required fields before submitting.');
      setIsButtonDisabled(false);
      return;
    }

    // Then validate all field formats
    const isValid = validateForm();
    if (!isValid) {
      toast.error('Please correct the errors in the form before submitting.');
      setIsButtonDisabled(false);
      return;
    }

    setIsSubmitting(true);
    setIsButtonDisabled(true);

    try {
      const response = await submitHospitalDetails(formData);
      
      // Clear saved form data after successful submission
      localStorage.removeItem(FORM_STORAGE_KEY);
      
      setShowSuccessDialog(true);
      toast.success('Hospital details submitted successfully');
    } catch (error) {
      toast.error(error?.message || 'Submission failed, please try again.');
      setTimeout(() => {
        setIsButtonDisabled(false);
      }, 3000);
    } finally {
      setTimeout(() => {
        setIsButtonDisabled(false);
      }, 5000);
    }
  };

  const handleSuccessDialogAction = (action) => {
    setShowSuccessDialog(false);
    if (action === 'dashboard') {
      router.push('/dashboard');
    } else if (action === 'cancel') {
      router.push('/dashboard');
    }
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-slate-300 font-medium">Loading registration form...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-950 via-gray-700 to-neutral-900">
      {/* Header */}
      <div className={`fixed top-0 left-0 right-0 z-[60] transition-all duration-300 ${
        isMobile ? 'w-[98%] mx-auto mt-2' : 'w-[95%] max-w-screen-xl mx-auto'
      }`}>
        <div className="bg-gray-900 shadow-md rounded-full px-3 py-2.5 sm:px-4 sm:py-2">
          <div className="container mx-auto">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center space-x-2.5 sm:space-x-3">
                <div className="p-2 sm:p-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg shadow-lg shrink-0">
                  <Building2 className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} text-white`} />
                </div>
                <div className="min-w-0">
                  <h1 className={`font-bold text-white truncate ${isMobile ? 'text-base sm:text-lg' : 'text-2xl'}`}>
                    Hospital Registration
                  </h1>
                </div>
              </div>
              <div className="flex items-center shrink-0 ml-2">
                <div className="flex items-center space-x-2">
                  <div className={`${isMobile ? 'w-24 sm:w-28' : 'w-32'} bg-slate-700 rounded-full h-2`}>
                    <div 
                      className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full rounded-full transition-all duration-300 shadow-lg"
                      style={{ width: `${getCompletionPercentage()}%` }}
                    ></div>
                  </div>
                  <span className={`font-semibold text-slate-200 ${isMobile ? 'text-xs sm:text-sm' : 'text-sm'} whitespace-nowrap`}>
                    {getCompletionPercentage()}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add margin-top to account for fixed header */}
      <div className={`${isMobile ? 'mt-7' : 'mt-11'}`}>
        {/* Form Content */}
        <form onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}>
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
                    <Card key={section.id} className="overflow-hidden shadow-2xl border border-slate-800/50 bg-slate-900/95 backdrop-blur-md">
                      {/* Section Header */}
                      <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-4 border-b border-slate-700/50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                              <IconComponent className="w-5 h-5 text-cyan-300" />
                            </div>
                            <div>
                              <h2 className="text-xl font-semibold text-white">{section.title}</h2>
                              <p className="text-slate-300 text-sm">
                                Step {sectionIndex + 1} of {formConfig.sections.length}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-slate-300 text-sm">
                              {sectionCompleted}/{section.fields.length} completed
                            </div>
                            {sectionErrors > 0 && (
                              <div className="flex items-center text-red-400 text-sm mt-1">
                                <AlertTriangle className="w-4 h-4 mr-1" />
                                {sectionErrors} error{sectionErrors > 1 ? 's' : ''}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Section Content */}
                      <div className="p-6 bg-slate-900/50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {section.fields.map(field => (
                            <div key={field.id} className="space-y-2">
                              <Label htmlFor={field.id} className="text-sm font-medium text-slate-200 flex items-center">
                                {field.label}
                                {field.required && <span className="text-red-400 ml-1">*</span>}
                              </Label>
                              <div className="relative">
                                <Input
                                  id={field.id}
                                  type={field.type}
                                  value={formData[field.id] || ''}
                                  onChange={(e) => handleChange(field, e.target.value)}
                                  className={`transition-all duration-200 bg-slate-800/90 border-slate-700 text-white placeholder-slate-500 focus:ring-2 ${
                                    errors[field.id] 
                                      ? 'border-red-500 focus:border-red-400 focus:ring-red-500/20' 
                                      : 'border-slate-600 focus:border-cyan-400 focus:ring-cyan-400/20'
                                  } ${
                                    formData[field.id] && !errors[field.id] 
                                      ? 'border-emerald-400 bg-emerald-500/10' 
                                      : ''
                                  }`}
                                  min={field.validation?.min}
                                  max={field.validation?.max}
                                  placeholder={`Enter ${field.label.toLowerCase()}`}
                                />
                                {formData[field.id] && !errors[field.id] && (
                                  <CheckCircle className="absolute right-3 top-3 w-4 h-4 text-emerald-400" />
                                )}
                              </div>
                              {errors[field.id] && (
                                <div className="flex items-center space-x-1 text-sm text-red-400">
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
                <Card className="bg-gradient-to-r from-slate-900/95 to-slate-800/95 backdrop-blur-md border border-slate-700/50 shadow-2xl">
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
                      <div className="text-center md:text-left">
                        <h3 className="text-lg font-semibold text-white">Ready to Submit?</h3>
                        <p className="text-slate-300 text-sm mt-1">
                          Please review all information before submitting your registration
                        </p>
                      </div>
                      <Button
                        type="submit"
                        disabled={isSubmitting || isButtonDisabled || formConfig.sections.some(section => 
                          section.fields.some(field => 
                            field.required && (!formData[field.id] || formData[field.id].toString().trim() === '')
                          )
                        )}
                        size="lg"
                        className="relative px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-w-[200px] border-0"
                      >
                        {isSubmitting ? (
                          <div className="flex items-center space-x-2">
                            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                            <span>Submitting...</span>
                          </div>
                        ) : isButtonDisabled ? (
                          <div className="flex items-center space-x-2">
                            <div className="animate-pulse w-4 h-4 bg-white/50 rounded-full"></div>
                            <span>Please wait...</span>
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

        {/* Success Dialog */}
        <Dialog open={showSuccessDialog} onOpenChange={() => {}}>
          <DialogContent className="sm:max-w-md bg-slate-900 border-slate-800 text-white">
            <DialogHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-emerald-500/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-emerald-400/30">
                <CheckCircle className="w-8 h-8 text-emerald-400" />
              </div>
              <DialogTitle className="text-xl font-semibold text-white">
                Registration Successful!
              </DialogTitle>
              <DialogDescription className="text-slate-300 mt-2">
                Your hospital has been successfully registered in our system. You can now access your dashboard to manage your hospital details and start using our services.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => handleSuccessDialogAction('cancel')}
                className="w-full sm:w-auto bg-transparent border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
              >
                Maybe Later
              </Button>
              <Button
                onClick={() => handleSuccessDialogAction('dashboard')}
                className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white border-0"
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