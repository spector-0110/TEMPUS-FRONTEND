'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import PatientForm from './PatientForm';
import DoctorSelector from './DoctorSelector';
import SlotPicker from './SlotPicker';
import { createAppointment } from '@/lib/patientAPI';
import { validateAppointmentData } from '@/lib/validation/appointment-validation';
import { useDetails } from '@/context/AppointmentDetailsProvider';

/**
 * Multi-step appointment creation flow
 * Steps: Patient Details → Doctor Selection → Time Slot → Confirmation
 */
const AppointmentCreationFlow = ({ onSuccess,onCancel }) => {
  const { hospitalInfo, doctors,  details, loading, isReady } = useDetails();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState(null);
  

  // Form data
  const [patientData, setPatientData] = useState({
    name: '',
    age: '',
    mobile: ''
  });

  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});

  const steps = [
    { number: 1, title: 'Patient Details', description: 'Enter patient information' },
    { number: 2, title: 'Select Doctor', description: 'Choose available doctor' },
    { number: 3, title: 'Select Time', description: 'Pick appointment slot' },
    { number: 4, title: 'Confirmation', description: 'Review and confirm' }
  ];

  const progressPercentage = ((currentStep - 1) / (steps.length - 1)) * 100;

  // Validation for patient details
  const validatePatientDetails = () => {
    const errors = {};
    
    if (!patientData.name.trim()) {
      errors.name = 'Patient name is required';
    } else if (patientData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    } else if (patientData.name.trim().length > 100) {
      errors.name = 'Name must not exceed 100 characters';
    }
    
    if (!patientData.age) {
      errors.age = 'Age is required';
    } else if (parseInt(patientData.age) < 1 || parseInt(patientData.age) > 120) {
      errors.age = 'Age must be between 1 and 120';
    }
    
    if (!patientData.mobile) {
      errors.mobile = 'Mobile number is required';
    } else if (!/^[6-9]\d{9}$/.test(patientData.mobile)) {
      errors.mobile = 'Please enter a valid 10-digit mobile number';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Load available slots when doctor is selected
  const loadAvailableSlots = async (doctorId) => {
    try {
      setIsLoading(true);
      const doctor = doctors.find(doc => doc.id === doctorId);
      
      if (!doctor || !doctor.availability) {
        setAvailableSlots([]);
        setError('No availability found for selected doctor');
        return;
      }
      
      // Extract slots from both today and tomorrow
      const allSlots = [];
      
      // Add today's slots if available
      if (doctor.availability.today && doctor.availability.today.slots) {
        allSlots.push(...doctor.availability.today.slots);
      }
      
      // Add tomorrow's slots if available
      if (doctor.availability.tomorrow && doctor.availability.tomorrow.slots) {
        allSlots.push(...doctor.availability.tomorrow.slots);
      }

      console.log('Available slots:', allSlots);
      
      // Transform slots to include required properties for SlotPicker
      const transformedSlots = allSlots.map(slot => ({
        id: `${slot.date}_${slot.start}`,
        date: slot.date,
        start: slot.start,
        end: slot.end,
        time: slot.start, // For backward compatibility
        timeDisplay: slot.timeDisplay,
        available: slot.available,
        datetime: new Date(`${slot.date}T${slot.start}:00`)
      }));
      
      setAvailableSlots(transformedSlots);
      
      if (transformedSlots.length === 0) {
        setError('No available slots found for the selected doctor');
      }
    } catch (err) {
      console.error('Error loading available slots:', err);
      setError('Failed to load available time slots');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle patient data changes
  const handlePatientDataChange = (field, value) => {
    setPatientData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear validation error for this field when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Handle doctor selection
  const handleDoctorSelect = (doctor) => {
    setSelectedDoctor(doctor);
    setSelectedSlot(null);
    setAvailableSlots([]);
  };

  // Handle slot selection
  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
  };

  // Navigation handlers
  const handleNext = async () => {
    setError(null);
    
    if (currentStep === 1) {
      if (validatePatientDetails()) {
        setCurrentStep(2);
      }
    } else if (currentStep === 2) {
      if (selectedDoctor) {
        await loadAvailableSlots(selectedDoctor.id);
        setCurrentStep(3);
      }
    } else if (currentStep === 3) {
      if (selectedSlot) {
        setCurrentStep(4);
      }
    }
  };

  const handleBack = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    } else if (currentStep === 3) {
      setCurrentStep(2);
      setSelectedSlot(null);
    } else if (currentStep === 4) {
      setCurrentStep(3);
    }
  };

  // Submit appointment
  const handleSubmitAppointment = async () => {
    // Prevent multiple submissions
    if (isSubmitting || isSuccess) {
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // Check if hospitalId is available
      if (!hospitalInfo?.id) {
        throw new Error('Hospital information not available. Please refresh the page and try again.');
      }

      // Create flat data structure expected by backend
      const appointmentData = {
        hospitalId: hospitalInfo.id,
        doctorId: selectedDoctor.id,
        patientName: patientData.name.trim(),
        mobile: patientData.mobile.trim(),
        age: parseInt(patientData.age),
        appointmentDate: selectedSlot.date,
        startTime: selectedSlot.start,
        endTime: selectedSlot.end,
      };

      // Validate the complete appointment data
      const validationResult = validateAppointmentData(appointmentData);
      
      if (!validationResult.isValid) {
        const errorMessages = validationResult.errors.map(err => err.message || err).join(', ');
        throw new Error(errorMessages);
      }

      const result = await createAppointment(validationResult.data);
      
      // Mark as successful - don't reset isSubmitting to keep button disabled
      setIsSuccess(true);
      
      // Call success callback with complete backend response - store as is without manipulation
      onSuccess(result);

    } catch (err) {
      console.error('Error creating appointment:', err);
      setError(err.message || 'Failed to create appointment');
      // Only reset isSubmitting on error to allow retry
      setIsSubmitting(false);
    }
    // Note: We don't reset isSubmitting on success to prevent multiple submissions
  };

  const isNextDisabled = () => {
    if (currentStep === 1) {
      // Real-time validation for step 1
      const hasValidName = patientData.name.trim().length >= 2 && patientData.name.trim().length <= 100;
      const hasValidAge = patientData.age && parseInt(patientData.age) >= 1 && parseInt(patientData.age) <= 120;
      const hasValidMobile = patientData.mobile && /^[6-9]\d{9}$/.test(patientData.mobile);
      
      return !hasValidName || !hasValidAge || !hasValidMobile;
    } else if (currentStep === 2) {
      return !selectedDoctor;
    } else if (currentStep === 3) {
      return !selectedSlot;
    }
    return false;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

    // Show loading while fetching hospital details or checking appointments
  if (loading || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 border-r-gray-900">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    );
  }

  // Show error/no data message if hospital data is not found
  if ( !details || !isReady) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8">
        <div className="text-center max-w-md">
          <div className="mx-auto mb-6 h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-300 mb-4">Hospital Not Found</h1>
          <button 
            onClick={() => window.location.reload()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Create New Appointment</h2>
          <span className="text-sm text-gray-500">
            Step {currentStep} of {steps.length}
          </span>
        </div>
        
        <Progress value={progressPercentage} className="mb-4" />
        
        <div className="flex justify-between ">
          {steps.map((step) => (
            <div key={step.number} className="flex flex-col items-center text-center ">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mb-2 ${
                  currentStep > step.number
                    ? 'bg-green-600 text-white'
                    : currentStep === step.number
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {currentStep > step.number ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  step.number
                )}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium">{step.title}</p>
                <p className="text-xs text-gray-500">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Success Display */}
      {isSuccess && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-green-700 text-sm font-medium">Appointment Created Successfully!</p>
          </div>
          <p className="text-green-600 text-sm mt-1">Your appointment details have been saved and you will be redirected shortly.</p>
        </div>
      )}

      {/* Step Content */}
      <div className="mb-8">
        {currentStep === 1 && (
          <PatientForm
            patientData={patientData}
            onPatientDataChange={handlePatientDataChange}
            validationErrors={validationErrors}
            isLoading={isLoading}
          />
        )}

        {currentStep === 2 && (
          <DoctorSelector
            doctors={doctors}
            selectedDoctor={selectedDoctor}
            onDoctorSelect={handleDoctorSelect}
            isLoading={isLoading}
          />
        )}

        {currentStep === 3 && (
          <SlotPicker
            availableSlots={availableSlots}
            selectedSlot={selectedSlot}
            onSlotSelect={handleSlotSelect}
            selectedDoctor={selectedDoctor}
            isLoading={isLoading}
          />
        )}

        {currentStep === 4 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Confirm Appointment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-lg mb-3">Patient Information</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Name:</span> {patientData.name}</p>
                    <p><span className="font-medium">Age:</span> {patientData.age} years</p>
                    <p><span className="font-medium">Mobile:</span> {patientData.mobile}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg mb-3">Appointment Details</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Doctor:</span> Dr. {selectedDoctor?.name}</p>
                    <p><span className="font-medium">Specialization:</span> {selectedDoctor?.specialization}</p>
                    <p><span className="font-medium">Date:</span> {formatDate(selectedSlot?.date)}</p>
                    <p><span className="font-medium">Time:</span> {selectedSlot?.timeDisplay || `${formatTime(selectedSlot?.start)} - ${formatTime(selectedSlot?.end)}`}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Important Notes:</h4>
                <ul className="text-blue-800 text-sm space-y-1">
                  <li>• Please arrive 30 minutes before your appointment</li>
                  <li>• Bring a valid ID and any relevant medical documents</li>
                  <li>• The appointment confirmation will be sent to the mobile number provided</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <div>
          {currentStep > 1 && (
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={isLoading || isSubmitting || isSuccess}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          )}
        </div>

        

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isLoading || isSubmitting}
          >
            Cancel
          </Button>
          
          {currentStep < 4 ? (
            <Button
              onClick={handleNext}
              disabled={isNextDisabled() || isLoading}
              className="gap-2"
            >
              {isLoading ? 'Loading...' : 'Next'}
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmitAppointment}
              disabled={isSubmitting || isSuccess}
              className={`gap-2 ${(isSubmitting || isSuccess) ? 'cursor-not-allowed opacity-50' : 'bg-green-600 hover:bg-green-700'}`}
            >
              {isSuccess ? 'Appointment Created!' : isSubmitting ? 'Creating Appointment...' : 'Create Appointment'}
              <CheckCircle className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentCreationFlow;