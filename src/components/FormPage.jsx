'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthProvider';
import { fetchHospitalFormFields } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { FormField } from '@/components/ui/FormField';
import { cn } from '@/lib/utils';

export default function FormPage() {
  const [formFields, setFormFields] = useState([]);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const { user } = useAuth();
  const router = useRouter();

  // Group form fields into steps for better user experience
  const formSteps = [
    { title: 'Basic Information', key: 'basic' },
    { title: 'Healthcare Details', key: 'healthcare' },
    { title: 'Additional Information', key: 'additional' }
  ];

  useEffect(() => {
    const getFormFields = async () => {
      try {
        setLoading(true);
        const data = await fetchHospitalFormFields();
        setFormFields(data.fields || []);
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

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Store form data in session storage for the subscription page
    sessionStorage.setItem('formData', JSON.stringify(formData));
    
    // Navigate to subscription page
    router.push('/subscription');
  };

  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, formSteps.length - 1));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const isCurrentStepValid = () => {
    const currentStepFields = formFields.filter(
      field => field.step === formSteps[currentStep].key && field.required
    );
    
    return currentStepFields.every(field => 
      formData[field.id] !== undefined && formData[field.id] !== ''
    );
  };

  // Get fields for current step
  const getCurrentStepFields = () => {
    return formFields.filter(field => field.step === formSteps[currentStep].key);
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
            {formSteps.map((step, index) => (
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
                    {step.title}
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
                {formSteps[currentStep].title}
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

                  // Render appropriate field based on type
                  switch (field.type) {
                    case 'text':
                      return (
                        <FormField {...fieldProps}>
                          <Input
                            value={formData[field.id] || ''}
                            onChange={(e) => handleInputChange(field.id, e.target.value)}
                            placeholder={field.placeholder || ''}
                          />
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
                              "border-gray-300 focus:border-primary-500"
                            )}
                          />
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
                              "border-gray-300 focus:border-primary-500"
                            )}
                          >
                            <option value="">Select an option</option>
                            {field.options?.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
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
              
              {currentStep < formSteps.length - 1 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  disabled={!isCurrentStepValid()}
                >
                  Next
                </Button>
              ) : (
                <Button type="submit">
                  Continue to Subscription
                </Button>
              )}
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
}