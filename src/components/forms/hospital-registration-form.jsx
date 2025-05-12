'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/Spinner';
import { useHospital } from '@/context/HospitalProvider';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { submitHospitalDetails, fetchHospitalFormFields } from '@/lib/api';

const FORM_STORAGE_KEY = 'hospitalFormData';

export default function HospitalRegistrationForm() {
  const router = useRouter();
  const { refreshHospitalData } = useHospital();
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [formConfig, setFormConfig] = useState({ sections: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

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
    const savedData = localStorage.getItem(FORM_STORAGE_KEY);
    if (savedData) {
      try {
        setFormData(JSON.parse(savedData));
      } catch {
        console.error('Failed to parse saved form data');
      }
    }
  }, []);

  // Save form data to localStorage on change
  useEffect(() => {
    if (Object.keys(formData).length > 0) {
      localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(formData));
    }
  }, [formData]);

  const validateField = useCallback((field, value) => {
    const { validation } = field;
    if (!validation) return '';

    if (validation.required && !value) return `${field.label} is required`;

    if (validation.pattern && value) {
      const regex = new RegExp(validation.pattern);
      if (!regex.test(value)) return validation.message || `Invalid ${field.label}`;
    }

    if (validation.minLength && value.length < validation.minLength)
      return `${field.label} must be at least ${validation.minLength} characters`;

    if (validation.maxLength && value.length > validation.maxLength)
      return `${field.label} must not exceed ${validation.maxLength} characters`;

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

    setFormData(prev => ({
      ...prev,
      [field.id]: transformedValue,
    }));

    const error = validateField(field, transformedValue);
    setErrors(prev => ({
      ...prev,
      [field.id]: error,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting || isButtonDisabled) return;

    const isValid = validateForm();
    if (!isValid) {
      toast.error('Please fill out all required fields correctly.');
      return;
    }

    setIsSubmitting(true);
    setIsButtonDisabled(true);

    try {
      await submitHospitalDetails(formData);
      localStorage.removeItem(FORM_STORAGE_KEY);
      await refreshHospitalData();
      toast.success('Hospital details submitted successfully');
    } catch (error) {
      toast.error(error?.message || 'Submission failed, please try again.');
    } finally {
      setIsSubmitting(false);
      // Set a 3-second timeout before enabling the button again
      setTimeout(() => {
        setIsButtonDisabled(false);
      }, 10000);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Hospital Registration</h1>

      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8">
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <Spinner />
          </div>
        ) : (
          formConfig.sections.map(section => (
            <Card key={section.id} className="p-6">
              <h2 className="text-xl font-semibold mb-4">{section.title}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {section.fields.map(field => (
                  <div key={field.id} className="space-y-2">
                    <Label htmlFor={field.id}>
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    <Input
                      id={field.id}
                      type={field.type}
                      value={formData[field.id] || ''}
                      onChange={(e) => handleChange(field, e.target.value)}
                      className={errors[field.id] ? 'border-red-500' : ''}
                      max={field.validation?.max}
                    />
                    {errors[field.id] && (
                      <p className="text-sm text-red-500">{errors[field.id]}</p>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          ))
        )}

        <div className="flex justify-end mt-6">
          <Button
            type="submit"
            disabled={isSubmitting || isLoading || isButtonDisabled}
            className="w-full md:w-auto"
          >
            {isSubmitting ? 'Submitting...' : isButtonDisabled ? 'Please wait...' : 'Submit Registration'}
          </Button>
        </div>
      </form>

      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registration Successful!</DialogTitle>
            <DialogDescription>
              Your hospital has been successfully registered. You can now access your dashboard to manage your hospital details.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => router.push('/dashboard')}>
              Go to Dashboard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}