'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthProvider';
import { fetchHospitalFormFields,submitHospitalDetails } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { FormField } from '@/components/ui/FormField';
import { cn } from '@/lib/utils';

export default function FormPage() {
  const [formFields, setFormFields] = useState([]);
  const [formSections, setFormSections] = useState([]);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const getFormFields = async () => {
      try {
        setLoading(true);
        const data = await fetchHospitalFormFields();
        
        if (data.sections && data.sections.length > 0) {
          setFormSections(data.sections);
          
          // Transform sections into flat array of fields with section info
          const fields = data.sections.reduce((acc, section) => {
            return acc.concat(
              section.fields.map(field => ({
                ...field,
                step: section.id
              }))
            );
          }, []);
          
          setFormFields(fields);
        }
      } catch (err) {
        setError('Failed to load form fields. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      getFormFields();
    }
  }, [user]);

  const handleInputChange = (fieldId, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const handleFileChange = (fieldId, file) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: file
    }));
  };

  const validateField = (field, value) => {
    if (field.required && (value === undefined || value === null || value === '')) {
      return `${field.label} is required`;
    }

    if (!value && !field.required) {
      return null;
    }

    const validation = field.validation;
    if (!validation) return null;

    if (validation.minLength && String(value).length < validation.minLength) {
      return `${field.label} must be at least ${validation.minLength} characters`;
    }

    if (validation.maxLength && String(value).length > validation.maxLength) {
      return `${field.label} must be no more than ${validation.maxLength} characters`;
    }

    if (validation.pattern) {
      const pattern = new RegExp(validation.pattern);
      if (!pattern.test(String(value))) {
        return validation.message || `Invalid format for ${field.label}`;
      }
    }

    if (field.type === 'file' && value) {
      if (validation.maxSize && value.size > validation.maxSize) {
        return `File size must be less than ${validation.maxSize / 1024 / 1024}MB`;
      }
      
      if (validation.acceptedTypes && !validation.acceptedTypes.includes(value.type)) {
        return `File type must be ${validation.acceptedTypes.join(', ')}`;
      }
    }

    if (field.type === 'date' && validation.max && new Date(value) > new Date(validation.max)) {
      return validation.message || `${field.label} cannot be later than ${validation.max}`;
    }

    return null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate all fields before submitting
    const errors = formFields.map(field => validateField(field, formData[field.id])).filter(Boolean);
    
    if (errors.length > 0) {
      setError(errors[0]);
      return;
    }
    
    // Store form data in session storage for the subscription page
   // sessionStorage.setItem('formData', JSON.stringify(formData));


    submitHospitalDetails(formData);

    
    router.push('/dashboard');
  };

  const nextStep = () => {
    if (currentStep < formSections.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const isCurrentStepValid = () => {
    if (!formSections[currentStep]) return false;
    
    const currentStepFields = formFields.filter(
      field => field.step === formSections[currentStep].id && field.required
    );
    
    return currentStepFields.every(field => {
      const value = formData[field.id];
      return !validateField(field, value);
    });
  };

  // Get fields for current step
  const getCurrentStepFields = () => {
    if (!formSections[currentStep]) return [];
    return formFields.filter(field => field.step === formSections[currentStep].id);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-400 border-r-transparent" role="status">
            <span className="sr-only">Loading...</span>
          </div>
          <p className="mt-4 text-sm text-gray-500">Loading form fields...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6 max-w-md mx-auto border-error-100">
        <CardContent className="p-0">
          <div className="text-error-600 mb-4 text-sm">{error}</div>
          <Button 
            onClick={() => window.location.reload()}
            variant="outline"
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const currentFields = getCurrentStepFields();

  return (
    <div className="w-full max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Complete your profile</CardTitle>
          <CardDescription>
            We need some information to set up your account properly.
          </CardDescription>
        </CardHeader>
        
        {/* Progress steps */}
        <div className="px-8 py-4 bg-gray-50 border-b border-gray-100">
          <div className="flex items-center w-full">
            {formSections.map((section, index) => (
              <div key={index} className="flex items-center relative w-full">
                {/* Step connector */}
                {index > 0 && (
                  <div 
                    className={cn(
                      "absolute left-[10%] right-[10%] top-1/2 h-0.5 -translate-y-1/2 mx-4",
                      currentStep >= index ? "bg-primary-400" : "bg-gray-200"
                    )}
                  ></div>
                )}
                
                {/* Step circle */}
                <div className="flex flex-col items-center relative z-10 w-full">
                  <div
                    className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium",
                      currentStep > index 
                        ? "bg-primary-500 text-white" 
                        : currentStep === index 
                          ? "bg-primary-100 border-2 border-primary-500 text-primary-700" 
                          : "bg-gray-100 text-gray-500 border border-gray-300"
                    )}
                  >
                    {currentStep > index ? (
                      <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      index + 1
                    )}
                  </div>
                  <p className="mt-2 text-xs font-medium text-gray-500">
                    {section.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {formFields.length === 0 ? (
          <CardContent className="text-center text-gray-500">
            No form fields available. Please contact support.
          </CardContent>
        ) : (
          <form onSubmit={handleSubmit}>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {formSections[currentStep]?.title || "Form"}
              </h3>
              
              <div className="space-y-5">
                {currentFields.map((field) => {
                  // Common field props
                  const fieldProps = {
                    key: field.id,
                    label: field.label,
                    required: field.required,
                    description: field.description,
                  };
                  
                  const validationError = validateField(field, formData[field.id]);

                  // Render appropriate field based on type
                  switch (field.type) {
                    case 'text':
                      return (
                        <FormField {...fieldProps}>
                          <Input
                            value={formData[field.id] || ''}
                            onChange={(e) => handleInputChange(field.id, e.target.value)}
                            placeholder={field.placeholder || ''}
                            className={validationError ? "border-error-300" : ""}
                          />
                          {validationError && <p className="mt-1 text-sm text-error-500">{validationError}</p>}
                        </FormField>
                      );
                      
                    case 'textarea':
                      return (
                        <FormField {...fieldProps}>
                          <textarea
                            value={formData[field.id] || ''}
                            onChange={(e) => handleInputChange(field.id, e.target.value)}
                            placeholder={field.placeholder || ''}
                            rows={4}
                            className={cn(
                              "w-full px-3 py-2 bg-white border rounded-md text-gray-900 text-sm transition-colors duration-200",
                              "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
                              validationError ? "border-error-300" : "border-gray-300 focus:border-primary-500"
                            )}
                          />
                          {validationError && <p className="mt-1 text-sm text-error-500">{validationError}</p>}
                        </FormField>
                      );
                      
                    case 'select':
                      return (
                        <FormField {...fieldProps}>
                          <select
                            value={formData[field.id] || ''}
                            onChange={(e) => handleInputChange(field.id, e.target.value)}
                            className={cn(
                              "w-full px-3 py-2 bg-white border rounded-md text-gray-900 text-sm transition-colors duration-200",
                              "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
                              validationError ? "border-error-300" : "border-gray-300 focus:border-primary-500"
                            )}
                          >
                            <option value="">Select an option</option>
                            {field.options?.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          {validationError && <p className="mt-1 text-sm text-error-500">{validationError}</p>}
                        </FormField>
                      );
                      
                    case 'radio':
                      return (
                        <FormField {...fieldProps}>
                          <div className="space-y-2 pt-1">
                            {field.options?.map((option) => (
                              <div key={option.value} className="flex items-center">
                                <input
                                  id={`${field.id}-${option.value}`}
                                  type="radio"
                                  name={field.id}
                                  value={option.value}
                                  checked={formData[field.id] === option.value}
                                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                                />
                                <label htmlFor={`${field.id}-${option.value}`} className="ml-2 text-sm text-gray-700">
                                  {option.label}
                                </label>
                              </div>
                            ))}
                          </div>
                          {validationError && <p className="mt-1 text-sm text-error-500">{validationError}</p>}
                        </FormField>
                      );
                      
                    case 'checkbox':
                      return (
                        <FormField {...fieldProps}>
                          <div className="flex items-center pt-1">
                            <input
                              id={field.id}
                              type="checkbox"
                              checked={!!formData[field.id]}
                              onChange={(e) => handleInputChange(field.id, e.target.checked)}
                              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                            />
                            <label htmlFor={field.id} className="ml-2 text-sm text-gray-700">
                              {field.checkboxLabel || field.label}
                            </label>
                          </div>
                          {validationError && <p className="mt-1 text-sm text-error-500">{validationError}</p>}
                        </FormField>
                      );
                      
                    case 'tel':
                      return (
                        <FormField {...fieldProps}>
                          <Input
                            type="tel"
                            value={formData[field.id] || ''}
                            onChange={(e) => handleInputChange(field.id, e.target.value)}
                            placeholder={field.placeholder || ''}
                            className={validationError ? "border-error-300" : ""}
                          />
                          {validationError && <p className="mt-1 text-sm text-error-500">{validationError}</p>}
                        </FormField>
                      );
                      
                    case 'url':
                      return (
                        <FormField {...fieldProps}>
                          <Input
                            type="url"
                            value={formData[field.id] || ''}
                            onChange={(e) => handleInputChange(field.id, e.target.value)}
                            placeholder={field.placeholder || 'https://example.com'}
                            className={validationError ? "border-error-300" : ""}
                          />
                          {validationError && <p className="mt-1 text-sm text-error-500">{validationError}</p>}
                        </FormField>
                      );
                      
                    case 'file':
                      return (
                        <FormField {...fieldProps}>
                          <div className="mt-1">
                            <input
                              id={field.id}
                              type="file"
                              onChange={(e) => handleFileChange(field.id, e.target.files[0])}
                              accept={field.validation?.acceptedTypes?.join(',')}
                              className={cn(
                                "block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4",
                                "file:rounded-md file:border-0 file:text-sm file:font-semibold",
                                "file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100",
                                validationError ? "border border-error-300 rounded-md" : ""
                              )}
                            />
                            {validationError && <p className="mt-1 text-sm text-error-500">{validationError}</p>}
                            {formData[field.id] && (
                              <p className="mt-1 text-sm text-gray-500">
                                Selected file: {formData[field.id].name}
                              </p>
                            )}
                          </div>
                        </FormField>
                      );
                      
                    case 'color':
                      return (
                        <FormField {...fieldProps}>
                          <div className="flex items-center gap-3">
                            <input
                              type="color"
                              id={field.id}
                              value={formData[field.id] || field.defaultValue || '#000000'}
                              onChange={(e) => handleInputChange(field.id, e.target.value)}
                              className="h-10 w-10 rounded cursor-pointer"
                            />
                            <Input
                              type="text"
                              value={formData[field.id] || field.defaultValue || '#000000'}
                              onChange={(e) => handleInputChange(field.id, e.target.value)}
                              placeholder="#000000"
                              className="w-32"
                            />
                          </div>
                          {validationError && <p className="mt-1 text-sm text-error-500">{validationError}</p>}
                        </FormField>
                      );
                      
                    case 'date':
                      return (
                        <FormField {...fieldProps}>
                          <Input
                            type="date"
                            value={formData[field.id] || ''}
                            onChange={(e) => handleInputChange(field.id, e.target.value)}
                            max={field.validation?.max}
                            className={validationError ? "border-error-300" : ""}
                          />
                          {validationError && <p className="mt-1 text-sm text-error-500">{validationError}</p>}
                        </FormField>
                      );
                      
                    default:
                      return null;
                  }
                })}
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-between">
              <Button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 0}
                variant="outline"
              >
                Previous
              </Button>
              
              {currentStep < formSections.length - 1 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  disabled={!isCurrentStepValid()}
                >
                  Next
                </Button>
              ) : (
                <Button type="submit" disabled={!isCurrentStepValid()}>

                  Create Hospital Account
                </Button>
              )}
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
}