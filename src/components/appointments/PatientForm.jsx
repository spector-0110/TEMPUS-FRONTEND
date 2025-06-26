'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Phone, Calendar } from 'lucide-react';

/**
 * Patient Details Form Component
 * Step 1 of the appointment booking flow - Enhanced for hospital staff use
 */
const PatientForm = ({ 
  patientData, 
  onPatientDataChange, 
  validationErrors = {},
  isLoading = false 
}) => {
  const handleInputChange = (field, value) => {
    // Format mobile number to only contain digits
    if (field === 'mobile') {
      value = value.replace(/\D/g, '');
    }
    
    // Format age to only contain digits
    if (field === 'age') {
      value = value.replace(/\D/g, '');
    }
    
    // Format name to remove extra spaces and capitalize
    if (field === 'name') {
      value = value.replace(/\s+/g, ' '); // Replace multiple spaces with single space
    }
    
    onPatientDataChange(field, value);
  };

  const isFormValid = () => {
    return (
      patientData.name?.trim() && 
      patientData.age && 
      patientData.mobile?.length === 10 &&
      Object.keys(validationErrors).length === 0
    );
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card className="bg-card dark:bg-card border-border dark:border-border shadow-lg dark:shadow-xl transition-all duration-300">
        <CardHeader className="text-center border-b border-border/50 dark:border-border/30 transition-colors duration-300">
          <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-primary/10 dark:bg-primary/15 border-2 border-primary/20 dark:border-primary/30 flex items-center justify-center transition-colors duration-300">
            <User className="h-7 w-7 text-primary dark:text-primary" />
          </div>
          <CardTitle className="text-2xl font-semibold text-foreground dark:text-foreground transition-colors duration-300">Patient Details</CardTitle>
          <p className="text-muted-foreground dark:text-muted-foreground mt-3 leading-relaxed transition-colors duration-300">
            Please provide accurate patient information to book the appointment
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6 pt-6">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="patient-name" className="text-sm font-medium text-foreground dark:text-foreground transition-colors duration-300">
              Full Name *
            </Label>
            <Input
              id="patient-name"
              type="text"
              placeholder="Enter patient's full name"
              value={patientData.name || ''}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`h-12 transition-all duration-200 bg-input-background dark:bg-input-background border-input dark:border-input focus:border-input-focus dark:focus:border-input-focus hover:border-input-hover dark:hover:border-input-hover ${
                validationErrors.name 
                  ? 'border-destructive dark:border-destructive focus:border-destructive dark:focus:border-destructive ring-1 ring-destructive/20 dark:ring-destructive/30' 
                  : 'focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/30'
              }`}
              aria-describedby={validationErrors.name ? 'name-error' : undefined}
            />
            {validationErrors.name && (
              <p id="name-error" className="text-xs text-destructive dark:text-destructive flex items-center gap-2 transition-colors duration-300">
                <span className="w-4 h-4 rounded-full bg-destructive/20 dark:bg-destructive/30 flex items-center justify-center text-xs">!</span>
                {validationErrors.name}
              </p>
            )}
          </div>

          {/* Age and Mobile Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Age Field */}
            <div className="space-y-2">
              <Label htmlFor="patient-age" className="text-sm font-medium text-foreground dark:text-foreground transition-colors duration-300">
                Age *
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground dark:text-muted-foreground pointer-events-none transition-colors duration-300" />
                <Input
                  id="patient-age"
                  type="text"
                  placeholder="Age in years"
                  value={patientData.age || ''}
                  onChange={(e) => handleInputChange('age', e.target.value)}
                  maxLength={3}
                  className={`pl-10 h-12 transition-all duration-200 bg-input-background dark:bg-input-background border-input dark:border-input focus:border-input-focus dark:focus:border-input-focus hover:border-input-hover dark:hover:border-input-hover ${
                    validationErrors.age 
                      ? 'border-destructive dark:border-destructive focus:border-destructive dark:focus:border-destructive ring-1 ring-destructive/20 dark:ring-destructive/30' 
                      : 'focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/30'
                  }`}
                  aria-describedby={validationErrors.age ? 'age-error' : undefined}
                />
              </div>
              {validationErrors.age && (
                <p id="age-error" className="text-xs text-destructive dark:text-destructive flex items-center gap-2 transition-colors duration-300">
                  <span className="w-4 h-4 rounded-full bg-destructive/20 dark:bg-destructive/30 flex items-center justify-center text-xs">!</span>
                  {validationErrors.age}
                </p>
              )}
            </div>

            {/* Mobile Field */}
            <div className="space-y-2">
              <Label htmlFor="patient-mobile" className="text-sm font-medium text-foreground dark:text-foreground transition-colors duration-300">
                Mobile Number *
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground dark:text-muted-foreground pointer-events-none transition-colors duration-300" />
                <Input
                  id="patient-mobile"
                  type="tel"
                  placeholder="10-digit mobile number"
                  value={patientData.mobile || ''}
                  onChange={(e) => handleInputChange('mobile', e.target.value)}
                  maxLength={10}
                  className={`pl-10 h-12 transition-all duration-200 bg-input-background dark:bg-input-background border-input dark:border-input focus:border-input-focus dark:focus:border-input-focus hover:border-input-hover dark:hover:border-input-hover ${
                    validationErrors.mobile 
                      ? 'border-destructive dark:border-destructive focus:border-destructive dark:focus:border-destructive ring-1 ring-destructive/20 dark:ring-destructive/30' 
                      : 'focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/30'
                  }`}
                  aria-describedby={validationErrors.mobile ? 'mobile-error' : undefined}
                />
              </div>
              {validationErrors.mobile && (
                <p id="mobile-error" className="text-xs text-destructive dark:text-destructive flex items-center gap-2 transition-colors duration-300">
                  <span className="w-4 h-4 rounded-full bg-destructive/20 dark:bg-destructive/30 flex items-center justify-center text-xs">!</span>
                  {validationErrors.mobile}
                </p>
              )}
            </div>
          </div>

          {/* Form Validation Summary */}
          {Object.keys(validationErrors).length > 0 && (
            <div className="p-4 bg-destructive/5 dark:bg-destructive/10 border border-destructive/20 dark:border-destructive/30 rounded-lg transition-colors duration-300">
              <h4 className="text-sm font-medium text-destructive dark:text-destructive mb-2 transition-colors duration-300">
                Please fix the following errors:
              </h4>
              <ul className="text-xs text-destructive/80 dark:text-destructive/90 space-y-1 transition-colors duration-300">
                {Object.values(validationErrors).map((error, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-destructive dark:bg-destructive"></div>
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 dark:border-primary/30 p-4 rounded-lg transition-colors duration-300">
            <h4 className="text-sm font-medium text-primary dark:text-primary mb-3 flex items-center gap-2 transition-colors duration-300">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Information Required
            </h4>
            <ul className="text-xs text-primary/80 space-y-2">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0"></div>
                <span>Full name as per government ID</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0"></div>
                <span>Current age of the patient</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0"></div>
                <span>Active mobile number for appointment confirmations</span>
              </li>
            </ul>
          </div>

          {/* Privacy Notice */}
          <div className="text-center pt-2">
            <div className="inline-flex items-center gap-2 px-3 py-2 bg-success/10 border border-success/20 rounded-full">
              <div className="w-2 h-2 bg-success rounded-full"></div>
              <p className="text-xs text-success font-medium">
                Your information is secure and confidential
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientForm;
