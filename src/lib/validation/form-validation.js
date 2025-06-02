'use client';

// Form validation utilities
export const validateField = (field, value, formConfig) => {
  // If field not in config or has no validation rules, it passes validation
  if (!field || !field.validation) return '';
  
  if (field.validation.required && !value) {
    return `${field.label || field.id} is required`;
  }
  
  // Only validate pattern if value exists
  if (field.validation.pattern && value) {
    const regex = new RegExp(field.validation.pattern);
    if (!regex.test(value)) return field.validation.message || `Invalid ${field.label || field.id}`;
  }
  
  if (field.validation.minLength && value && value.length < field.validation.minLength)
    return `${field.label || field.id} must be at least ${field.validation.minLength} characters`;
    
  if (field.validation.maxLength && value && value.length > field.validation.maxLength)
    return `${field.label || field.id} must not exceed ${field.validation.maxLength} characters`;
    
  return '';
};

export const validateSection = (sectionName, formData, touchedSections, formConfig, errors = {}) => {
  if (!touchedSections[sectionName]) return { isValid: true, errors };
  
  const newErrors = { ...errors };
  let hasError = false;
  
  const section = formConfig.sections.find(s => s.id === sectionName);
  if (!section) return { isValid: true, errors };
  
  section.fields.forEach(field => {
    const value = formData[field.id] || '';
    const error = validateField(field, value, formConfig);
    
    if (error) {
      newErrors[field.id] = error;
      hasError = true;
    } else {
      delete newErrors[field.id];
    }
  });
  
  return { isValid: !hasError, errors: newErrors };
};

// Prepare data for API calls
export const prepareDataForUpdate = (formData, touchedSections) => {
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

// Check if form data has actual changes compared to original data
export const hasActualChanges = (formData, originalData, touchedSections) => {
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
};

// Helper function to determine which section a field belongs to
export const getSectionNameForField = (fieldId) => {
  if (['name', 'gstin', 'establishedDate'].includes(fieldId)) return 'main';
  if (['street', 'city', 'district', 'state', 'pincode', 'country'].includes(fieldId)) return 'address';
  if (['phone', 'website'].includes(fieldId)) return 'contact';
  return '';
};
