'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/Spinner';
import { useHospital } from '@/context/HospitalProvider';
import defaultHospitalFormConfig from '@/lib/config/hospitalFormConfig';
import { updateHospitalDetailsAPI } from '@/lib/api';

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
      
      // Clear any initial errors after setting the form data
      setErrors({});
      setApiError(null); // Clear any API errors when form data is initialized
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
  
  // Function to dismiss API error alerts and re-enable the submit button
  const dismissApiError = () => {
    setApiError(null);
    // After dismissing the error, the submit button will be re-enabled
    // if all other conditions are met (has changes, no validation errors, etc.)
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
    // No longer automatically clearing API errors on field changes
    // User must explicitly dismiss the error
    
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
      return;
    }
    
    // If no sections were touched or no actual changes made, there's nothing to update
    if (!Object.values(touchedSections).some(touched => touched) || !hasActualChanges()) {
      toast.info('No changes to update');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const dataToUpdate = prepareDataForUpdate();
      
      // Make API call to update the details
      const response = await updateHospitalDetailsAPI(dataToUpdate);
      
      // After successful API call, update the context
      updateHospitalDetails({
        ...hospitalDetails,
        ...dataToUpdate
      });
      toast.success('Hospital details updated successfully');
      
      // Reset touched sections after successful update
      setTouchedSections({
        main: false,
        address: false,
        contact: false
      });
      
      // Call onSuccess callback if provided
      if (onSuccess && typeof onSuccess === 'function') {
        onSuccess();
      }
      
    } catch (error) {
      // Set the API error for alert display
      setApiError(error?.message || 'Failed to update hospital details');
      // Still show toast for immediate feedback
      toast.error(error?.message || 'Failed to update hospital details');
      console.error('Update error:', error);
    } finally {
      setIsSubmitting(false);
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
      <Card className="p-6 bg-red-50">
        <h2 className="text-xl font-semibold text-red-600">Error Loading Hospital Details</h2>
        <p className="mt-2 text-red-500">{error?.message || 'Failed to load hospital details'}</p>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* API Error Alert */}
      {apiError && (
        <Card className="p-4 bg-red-50 border border-red-300">
          <div className="flex items-start">
            <div className="flex-shrink-0 text-red-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-red-800">Error from server</h3>
              <div className="mt-1 text-red-700">{apiError}</div>
              <div className="mt-3">
                <Button 
                  type="button" 
                  className="bg-red-50 hover:bg-red-100 text-red-800 px-2 py-1 text-xs rounded"
                  onClick={dismissApiError}
                >
                  Dismiss
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}
      
      {/* Main Information Section */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Hospital Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">
              Hospital Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value, 'main')}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="gstin">
              GSTIN <span className="text-red-500">*</span>
            </Label>
            <Input
              id="gstin"
              value={formData.gstin}
              onChange={(e) => handleChange('gstin', e.target.value, 'main')}
              className={errors.gstin ? 'border-red-500' : ''}
            />
            {errors.gstin && <p className="text-sm text-red-500">{errors.gstin}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="establishedDate">
              Established Date <span className="text-red-500">*</span>
            </Label>
            <Input
              id="establishedDate"
              type="date"
              value={formData.establishedDate}
              onChange={(e) => handleChange('establishedDate', e.target.value, 'main')}
              className={errors.establishedDate ? 'border-red-500' : ''}
              max={new Date().toISOString().split('T')[0]}
            />
            {errors.establishedDate && <p className="text-sm text-red-500">{errors.establishedDate}</p>}
          </div>
        </div>
      </Card>

      {/* Address Section */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Address Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="street">
              Street Address <span className="text-red-500">*</span>
            </Label>
            <Input
              id="street"
              value={formData.street}
              onChange={(e) => handleChange('street', e.target.value, 'address')}
              className={errors.street ? 'border-red-500' : ''}
            />
            {errors.street && <p className="text-sm text-red-500">{errors.street}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="city">
              City <span className="text-red-500">*</span>
            </Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => handleChange('city', e.target.value, 'address')}
              className={errors.city ? 'border-red-500' : ''}
            />
            {errors.city && <p className="text-sm text-red-500">{errors.city}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="district">
              District <span className="text-red-500">*</span>
            </Label>
            <Input
              id="district"
              value={formData.district}
              onChange={(e) => handleChange('district', e.target.value, 'address')}
              className={errors.district ? 'border-red-500' : ''}
            />
            {errors.district && <p className="text-sm text-red-500">{errors.district}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="state">
              State <span className="text-red-500">*</span>
            </Label>
            <Input
              id="state"
              value={formData.state}
              onChange={(e) => handleChange('state', e.target.value, 'address')}
              className={errors.state ? 'border-red-500' : ''}
            />
            {errors.state && <p className="text-sm text-red-500">{errors.state}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="pincode">
              PIN Code <span className="text-red-500">*</span>
            </Label>
            <Input
              id="pincode"
              value={formData.pincode}
              onChange={(e) => handleChange('pincode', e.target.value, 'address')}
              className={errors.pincode ? 'border-red-500' : ''}
            />
            {errors.pincode && <p className="text-sm text-red-500">{errors.pincode}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="country">
              Country <span className="text-red-500">*</span>
            </Label>
            <Input
              id="country"
              value={formData.country}
              onChange={(e) => handleChange('country', e.target.value, 'address')}
              className={errors.country ? 'border-red-500' : ''}
              readOnly
            />
          </div>
        </div>
      </Card>

      {/* Contact Section */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="phone">
              Phone Number <span className="text-red-500">*</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value, 'contact')}
              className={errors.phone ? 'border-red-500' : ''}
            />
            {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              type="url"
              value={formData.website}
              onChange={(e) => handleChange('website', e.target.value, 'contact')}
              className={errors.website ? 'border-red-500' : ''}
            />
            {errors.website && <p className="text-sm text-red-500">{errors.website}</p>}
          </div>
        </div>
      </Card>

      <div className="flex justify-end gap-4">
        <Button
          type="submit"
          disabled={
            isSubmitting || 
            (Object.keys(errors).length > 0 && Object.keys(errors).some(field => {
              const section = getSectionNameForField(field);
              return touchedSections[section]; 
            })) || 
            !Object.values(touchedSections).some(touched => touched) ||
            !hasActualChanges() ||
            apiError !== null // Disable button if there's an API error until it's dismissed
          }
        >
          {isSubmitting ? 'Updating...' : 'Update Hospital Details'}
        </Button>
      </div>
    </form>
  );
}