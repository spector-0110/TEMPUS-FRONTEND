'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { useHospital } from '@/context/HospitalProvider';
import defaultHospitalFormConfig from '@/lib/config/hospitalFormConfig';
import { ApiErrorAlert } from '@/components/ui/api-error-alert';
import { FormSection } from '@/components/ui/form-ui/form-section';
import { HospitalOtpDialog } from '@/components/ui/form-ui/hospital-otp-dialog';
import { getOTPforHospitalDetailsUpdate } from '@/lib/api/api';

// Constants for allowed fields updates
const ALLOWED_UPDATE_FIELDS = [
  'name',
  'address',
  'logo',
  'gstin',
  'establishedDate',
  'website',
  'contactInfo'
];

const ALLOWED_ADDRESS_UPDATE_FIELDS = [
  'street', 
  'city', 
  'district',
  'state', 
  'pincode', 
  'country'
];

const ALLOWED_CONTACT_INFO = [
  'phone',
  'website'
];

export default function EditHospitalDetailsForm({ onSuccess = () => {} }) {
  const { hospitalDetails, loading, error, updateHospitalDetails } = useHospital();
  const [formData, setFormData] = useState(null);
  const [originalData, setOriginalData] = useState(null); // Store original values to compare changes
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null); // Store API error for alert display
  const [touchedSections, setTouchedSections] = useState({
    main: false,
    address: false,
    contact: false
  });
  const [formConfig, setFormConfig] = useState(defaultHospitalFormConfig);
  
  // OTP related states
  const [isOtpDialogOpen, setIsOtpDialogOpen] = useState(false);
  const [isRequestingOtp, setIsRequestingOtp] = useState(false);
  const [pendingUpdateData, setPendingUpdateData] = useState(null);

  // Initialize form data from hospital details
  useEffect(() => {
    if (hospitalDetails) {
      // Structure form data to match our form sections
      const initialData = {
        // Main section
        name: hospitalDetails.name || '',
        gstin: hospitalDetails.gstin || '',
        establishedDate: hospitalDetails.establishedDate || '',
        
        // Address section
        street: hospitalDetails.address?.street || '',
        city: hospitalDetails.address?.city || '',
        district: hospitalDetails.address?.district || '',
        state: hospitalDetails.address?.state || '',
        pincode: hospitalDetails.address?.pincode || '',
        country: hospitalDetails.address?.country || 'India',
        
        // Contact section
        phone: hospitalDetails.contactInfo?.phone || '',
        website: hospitalDetails.contactInfo?.website || '',
      };
      
      setFormData(initialData);
      setOriginalData(JSON.parse(JSON.stringify(initialData))); // Keep a copy of the original data
      setErrors({});
      setApiError(null); 
    }
    
    // Cleanup function that runs when component unmounts
    return () => {
      // Reset all states to their initial values
      setFormData(null);
      setOriginalData(null);
      setErrors({});
      setApiError(null);
      setIsSubmitting(false);
      setTouchedSections({
        main: false,
        address: false,
        contact: false
      });
    };
  }, [hospitalDetails]);

  // Field validation based on form config
  const validateField = useCallback((fieldId, value) => {
    // Find field in config - if not found, the field doesn't need validation
    let field = null;
    
    for (const section of formConfig.sections) {
      const foundField = section.fields.find(f => f.id === fieldId);
      if (foundField) {
        field = foundField;
        break;
      }
    }
    
    // If field not in config or has no validation rules, it passes validation
    if (!field || !field.validation) return '';
    
    // Only check if required when the section is touched
    const sectionName = getSectionNameForField(fieldId);
    const isSectionTouched = touchedSections[sectionName];
    
    if (isSectionTouched && field.validation.required && !value) {
      return `${field.label || fieldId} is required`;
    }
    
    // Only validate pattern if value exists
    if (field.validation.pattern && value) {
      const regex = new RegExp(field.validation.pattern);
      if (!regex.test(value)) return field.validation.message || `Invalid ${field.label || fieldId}`;
    }
    
    if (field.validation.minLength && value && value.length < field.validation.minLength)
      return `${field.label || fieldId} must be at least ${field.validation.minLength} characters`;
      
    if (field.validation.maxLength && value && value.length > field.validation.maxLength)
      return `${field.label || fieldId} must not exceed ${field.validation.maxLength} characters`;
      
    return '';
  }, [formConfig, touchedSections]);
  
  // Helper function to determine which section a field belongs to
  const getSectionNameForField = (fieldId) => {
    if (['name', 'gstin', 'establishedDate'].includes(fieldId)) return 'main';
    if (['street', 'city', 'district', 'state', 'pincode', 'country'].includes(fieldId)) return 'address';
    if (['phone', 'website'].includes(fieldId)) return 'contact';
    return '';
  };
  
  const dismissApiError = () => {
    setApiError(null);
  };
  
  // Check if there are any actual changes in the form data compared to original data
  const hasActualChanges = useCallback(() => {
    if (!formData || !originalData) return false;
    
    // Check if any sections that are touched have actual changes
    const sectionsToCheck = Object.entries(touchedSections)
      .filter(([_, touched]) => touched)
      .map(([section]) => section);
      
    if (sectionsToCheck.length === 0) return false;
    
    // Check each section's fields for changes
    for (const section of sectionsToCheck) {
      const fieldsToCheck = {
        main: ['name', 'gstin', 'establishedDate'],
        address: ['street', 'city', 'district', 'state', 'pincode', 'country'],
        contact: ['phone', 'website']
      }[section];
      
      // If any field has changed, return true
      for (const field of fieldsToCheck) {
        if (formData[field] !== originalData[field]) {
          return true;
        }
      }
    }
    
    // No actual changes detected
    return false;
  }, [formData, originalData, touchedSections]);

  // Validate all fields in a specific section
  const validateSection = useCallback((sectionName) => {
    const newErrors = { ...errors };
    let hasError = false;
    
    // Only validate if section is touched
    if (touchedSections[sectionName]) {
      const fieldsToValidate = {
        main: ['name', 'gstin', 'establishedDate'],
        address: ['street', 'city', 'district', 'state', 'pincode', 'country'],
        contact: ['phone', 'website']
      };
      
      fieldsToValidate[sectionName].forEach(fieldId => {
        const value = formData[fieldId] || '';
        const error = validateField(fieldId, value);
        
        if (error) {
          newErrors[fieldId] = error;
          hasError = true;
        } else {
          delete newErrors[fieldId];
        }
      });
    }
    
    setErrors(newErrors);
    return !hasError;
  }, [formData, validateField, errors, touchedSections]);

  const handleChange = (fieldId, value, sectionName) => {
    // Mark the section as touched
    if (!touchedSections[sectionName]) {
      setTouchedSections(prev => ({
        ...prev,
        [sectionName]: true
      }));
    }
    
    // Find field in config for transformation
    let field = null;
    for (const section of formConfig.sections) {
      const foundField = section.fields.find(f => f.id === fieldId);
      if (foundField) {
        field = foundField;
        break;
      }
    }
    
    // Apply transformation if available
    const transformedValue = field?.validation?.transform 
      ? field.validation.transform(value)
      : value;
    
    setFormData(prev => ({
      ...prev,
      [fieldId]: transformedValue,
    }));
    
    // Validate the field and update errors
    const error = validateField(fieldId, transformedValue);
    setErrors(prev => {
      const newErrors = { ...prev };
      if (error) {
        newErrors[fieldId] = error;
      } else {
        delete newErrors[fieldId]; // Remove error if field is now valid
      }
      return newErrors;
    });
  };

  const prepareDataForUpdate = () => {
    const updatedData = {};
    
    // Only include sections that have been touched
    if (touchedSections.main) {
      updatedData.name = formData.name;
      updatedData.gstin = formData.gstin;
      updatedData.establishedDate = formData.establishedDate;
    }
    
    if (touchedSections.address) {
      updatedData.address = {
        street: formData.street,
        city: formData.city,
        district: formData.district,
        state: formData.state,
        pincode: formData.pincode,
        country: formData.country
      };
    }
    
    if (touchedSections.contact) {
      updatedData.contactInfo = {
        phone: formData.phone,
        website: formData.website
      };
    }
    
    return updatedData;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    // Validate all touched sections
    let isValid = true;
    Object.entries(touchedSections).forEach(([section, touched]) => {
      if (touched && !validateSection(section)) {
        isValid = false;
      }
    });
    
    if (!isValid) {
      toast.error('Please fix the errors before submitting');
      setIsSubmitting(false);
      return;
    }
    
    // If no sections were touched or no actual changes made, there's nothing to update
    if (!Object.values(touchedSections).some(touched => touched) || !hasActualChanges()) {
      toast.info('No changes to update');
      setIsSubmitting(false);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const dataToUpdate = prepareDataForUpdate();
      if (Object.keys(dataToUpdate).length === 0) {
        toast.warn('No valid data to update');
        setIsSubmitting(false);
        return;
      }
      
      // Store the update data to use after OTP verification
      setPendingUpdateData(dataToUpdate);
      
      // Request OTP for verification
      setIsRequestingOtp(true);
      await requestOTP(dataToUpdate);
      
      // Open OTP dialog
      setIsOtpDialogOpen(true);
      
    } catch (error) {
      // Set the API error for alert display
      setApiError(error?.message || 'Failed to request OTP for verification');
      // Still show toast for immediate feedback
      toast.error(error?.message || 'Failed to request OTP for verification');
      console.error('OTP request error:', error);
    } finally {
      setIsSubmitting(false);
      setIsRequestingOtp(false);
    }
  };

  // Request OTP for hospital details update
  const requestOTP = async (dataToUpdate) => {
    try {
      await getOTPforHospitalDetailsUpdate(dataToUpdate);
      toast.success('OTP sent to your registered email/phone');
      return true;
    } catch (error) {
      setApiError(error?.message || 'Failed to send OTP');
      toast.error(error?.message || 'Failed to send OTP');
      console.error('Request OTP error:', error);
      return false;
    }
  };

  // Handle OTP verification success
  const handleOtpSuccess = () => {
    // Reset touched sections after successful update
    setTouchedSections({
      main: false,
      address: false,
      contact: false
    });
    
    setPendingUpdateData(null);
    setIsOtpDialogOpen(false);
    
    // Call onSuccess callback if provided
    if (onSuccess && typeof onSuccess === 'function') {
      onSuccess();
    }
  };

  if (loading || !formData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6 bg-destructive/10">
        <h2 className="text-xl font-semibold text-destructive">Error Loading Hospital Details</h2>
        <p className="mt-2 text-destructive">{error?.message || 'Failed to load hospital details'}</p>
      </Card>
    );
  }

  // Define form fields for each section
  const formSections = {
    main: {
      title: "Hospital Information",
      fields: [
        { id: 'name', label: 'Hospital Name', required: true },
        { id: 'gstin', label: 'GSTIN', required: true },
        { id: 'establishedDate', label: 'Established Date', type: 'date', required: true, max: new Date().toISOString().split('T')[0] }
      ]
    },
    address: {
      title: "Address Information",
      fields: [
        { id: 'street', label: 'Street Address', required: true },
        { id: 'city', label: 'City', required: true },
        { id: 'district', label: 'District', required: true },
        { id: 'state', label: 'State', required: true },
        { id: 'pincode', label: 'PIN Code', required: true },
        { id: 'country', label: 'Country', required: true, readOnly: true }
      ]
    },
    contact: {
      title: "Contact Information",
      fields: [
        { id: 'phone', label: 'Phone Number', type: 'tel', required: true },
        { id: 'website', label: 'Website', type: 'url' }
      ]
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* API Error Alert */}
        <ApiErrorAlert 
          error={apiError} 
          onDismiss={dismissApiError} 
        />
        
        {/* Form Sections */}
        <FormSection 
          title={formSections.main.title}
          fields={formSections.main.fields}
          formData={formData}
          handleChange={handleChange}
          errors={errors}
          sectionName="main"
        />

        <FormSection 
          title={formSections.address.title}
          fields={formSections.address.fields}
          formData={formData}
          handleChange={handleChange}
          errors={errors}
          sectionName="address"
        />

        <FormSection 
          title={formSections.contact.title}
          fields={formSections.contact.fields}
          formData={formData}
          handleChange={handleChange}
          errors={errors}
          sectionName="contact"
        />

        <div className="flex justify-end gap-4">
          <Button
            type="submit"
            disabled={
              isSubmitting || 
              isRequestingOtp ||
              (Object.keys(errors).length > 0 && Object.keys(errors).some(field => {
                const section = getSectionNameForField(field);
                return touchedSections[section]; 
              })) || 
              !Object.values(touchedSections).some(touched => touched) ||
              !hasActualChanges() ||
              apiError !== null // Disable button if there's an API error until it's dismissed
            }
            className={isSubmitting || isRequestingOtp ? 'opacity-50 cursor-not-allowed' : ''}
          >
            {isSubmitting || isRequestingOtp ? 'Processing...' : 'Update Hospital Details'}
          </Button>
        </div>
      </form>

      {/* OTP Verification Dialog */}
      <HospitalOtpDialog 
        isOpen={isOtpDialogOpen}
        onClose={() => setIsOtpDialogOpen(false)}
        pendingUpdateData={pendingUpdateData}
        onSuccess={handleOtpSuccess}
        hospitalDetails={hospitalDetails}
        updateHospitalDetails={updateHospitalDetails}
      />
    </>
  );
}