'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { submitHospitalDetails } from '@/lib/api';
import defaultHospitalFormConfig from '@/lib/config/hospitalFormConfig';

const FORM_STORAGE_KEY = 'hospitalFormData';

export default function HospitalRegistrationForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(formData));
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

    defaultHospitalFormConfig.sections.forEach(section => {
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
  }, [formData, validateField]);

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

    if (isSubmitting) return;

    const isValid = validateForm();
    if (!isValid) {
      toast.error('Please fill out all required fields correctly.');
      return;
    }

    setIsSubmitting(true);
    try {
      await submitHospitalDetails(formData);
      toast.success('Hospital details submitted successfully');
      localStorage.removeItem(FORM_STORAGE_KEY);
      router.push('/dashboard');
    } catch (error) {
      toast.error(error?.message || 'Submission failed, please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Hospital Registration</h1>

      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8">
        {defaultHospitalFormConfig.sections.map(section => (
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
        ))}

        <div className="flex justify-end mt-6">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full md:w-auto"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Registration'}
          </Button>
        </div>
      </form>
    </div>
  );
}