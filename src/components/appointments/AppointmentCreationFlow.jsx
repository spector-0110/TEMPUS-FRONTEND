'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, ArrowLeft, ArrowRight, RefreshCw, User, Calendar } from 'lucide-react';
import PatientForm from './PatientForm';
import DoctorSelector from './DoctorSelector';
import SlotPicker from './SlotPicker';
import { createAppointment } from '@/lib/api/patientAPI';
import { validateAppointmentData } from '@/lib/validation/appointment-validation';
import { useDetails } from '@/context/AppointmentDetailsProvider';

/**
 * Multi-step appointment creation flow
 * Steps: Patient Details → Doctor Selection → Time Slot → Confirmation
 */
const AppointmentCreationFlow = ({ onSuccess }) => {
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
      
      // Transform slots to include required properties for SlotPicker
      const transformedSlots = allSlots.map(slot => ({
        id: `${slot.date}_${slot.start}`,
        date: slot.date,
        start: slot.start,
        end: slot.end,
        time: slot.start, // For backward compatibility
        timeDisplay: slot.timeDisplay,
        available: slot.available,
        datetime: new Date(`${slot.date}T${slot.start}:00`),
        maxCapacity: slot.maxCapacity,
        patientCount: slot.patientCount || 0, 
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
      <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-background">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-12 h-12 border-4 border-primary/20 rounded-full"></div>
        </div>
        <p className="mt-6 text-foreground font-medium">Loading appointment flow...</p>
        <p className="mt-2 text-muted-foreground dark:text-muted-foreground text-sm">Please wait while we prepare everything</p>
      </div>
    );
  }

  // Show error/no data message if hospital data is not found
  if ( !details || !isReady) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-background">
        <div className="text-center max-w-md">
          <div className="mx-auto mb-6 h-16 w-16 rounded-full bg-destructive/10 border-2 border-destructive/20 flex items-center justify-center">
            <svg className="h-8 w-8 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-4">Hospital Not Found</h1>
          <p className="text-muted-foreground dark:text-muted-foreground mb-6">Unable to load hospital information. Please try refreshing the page.</p>
          <Button 
            onClick={() => window.location.reload()}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-background min-h-screen transition-colors duration-300">
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-foreground transition-colors duration-300">Create New Appointment</h2>
            <p className="text-muted-foreground dark:text-muted-foreground mt-1 transition-colors duration-300">Follow the steps to book an appointment</p>
          </div>
          <div className="text-right">
            <span className="text-sm font-medium text-muted-foreground dark:text-muted-foreground transition-colors duration-300">
              Step {currentStep} of {steps.length}
            </span>
            <div className="text-xs text-muted-foreground dark:text-muted-foreground mt-1 transition-colors duration-300">
              {steps[currentStep - 1]?.title}
            </div>
          </div>
        </div>
        
        <Progress value={progressPercentage} className="mb-6 h-2 bg-muted dark:bg-muted/50" />
        
        <div className="grid grid-cols-4 gap-4">
          {steps.map((step) => (
            <div key={step.number} className="flex flex-col items-center text-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium mb-3 transition-all duration-300 ${
                  currentStep > step.number
                    ? 'bg-success text-success-foreground shadow-lg shadow-success/20 dark:shadow-success/10'
                    : currentStep === step.number
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 dark:shadow-primary/10 ring-2 ring-primary/20 dark:ring-primary/30'
                    : 'bg-muted text-muted-foreground border-2 border-border hover:border-primary/50 dark:bg-muted/70 dark:border-border/70 dark:hover:border-primary/40'
                }`}
              >
                {currentStep > step.number ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  step.number
                )}
              </div>
              <div className="hidden sm:block">
                <p className={`text-sm font-medium transition-colors duration-300 ${
                  currentStep >= step.number ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                  {step.title}
                </p>
                <p className="text-xs text-muted-foreground dark:text-muted-foreground mt-1 transition-colors duration-300">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-destructive/10 dark:bg-destructive/5 border border-destructive/20 dark:border-destructive/30 rounded-lg backdrop-blur-sm transition-colors duration-300">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-destructive/20 dark:bg-destructive/30 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-destructive dark:text-destructive text-xs">!</span>
            </div>
            <div>
              <p className="text-destructive dark:text-destructive font-medium text-sm">Error</p>
              <p className="text-destructive/80 dark:text-destructive/90 text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Success Display */}
      {isSuccess && (
        <div className="mb-6 p-4 bg-success/10 dark:bg-success/5 border border-success/20 dark:border-success/30 rounded-lg backdrop-blur-sm transition-colors duration-300">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-success dark:text-success flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-success dark:text-success font-medium text-sm">Appointment Created Successfully!</p>
              <p className="text-success/80 dark:text-success/90 text-sm mt-1">Your appointment details have been saved and you will be redirected shortly.</p>
            </div>
          </div>
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
          <Card className="bg-card dark:bg-card border-border dark:border-border shadow-lg dark:shadow-xl transition-all duration-300">
            <CardHeader className="border-b border-border/50 dark:border-border/30">
              <CardTitle className="text-xl text-foreground dark:text-foreground flex items-center gap-2 transition-colors duration-300">
                <CheckCircle className="w-6 h-6 text-success dark:text-success" />
                Confirm Appointment Details
              </CardTitle>
              <p className="text-muted-foreground dark:text-muted-foreground transition-colors duration-300">Please review the information before confirming</p>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-muted/30 dark:bg-muted/20 rounded-lg border border-border/50 dark:border-border/30 transition-colors duration-300">
                  <h3 className="font-semibold text-lg mb-4 text-foreground dark:text-foreground flex items-center gap-2 transition-colors duration-300">
                    <User className="w-5 h-5 text-primary dark:text-primary" />
                    Patient Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="font-medium text-muted-foreground dark:text-muted-foreground transition-colors duration-300">Name:</span> 
                      <span className="text-foreground dark:text-foreground transition-colors duration-300">{patientData.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-muted-foreground dark:text-muted-foreground transition-colors duration-300">Age:</span> 
                      <span className="text-foreground dark:text-foreground transition-colors duration-300">{patientData.age} years</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-muted-foreground dark:text-muted-foreground transition-colors duration-300">Mobile:</span> 
                      <span className="text-foreground dark:text-foreground transition-colors duration-300">{patientData.mobile}</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-muted/30 dark:bg-muted/20 rounded-lg border border-border/50 dark:border-border/30 transition-colors duration-300">
                  <h3 className="font-semibold text-lg mb-4 text-foreground dark:text-foreground flex items-center gap-2 transition-colors duration-300">
                    <Calendar className="w-5 h-5 text-primary dark:text-primary" />
                    Appointment Details
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="font-medium text-muted-foreground dark:text-muted-foreground transition-colors duration-300">Doctor:</span> 
                      <span className="text-foreground dark:text-foreground transition-colors duration-300">Dr. {selectedDoctor?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-muted-foreground dark:text-muted-foreground transition-colors duration-300">Specialization:</span> 
                      <span className="text-foreground dark:text-foreground transition-colors duration-300">{selectedDoctor?.specialization}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-muted-foreground dark:text-muted-foreground transition-colors duration-300">Date:</span> 
                      <span className="text-foreground dark:text-foreground transition-colors duration-300">{formatDate(selectedSlot?.date)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-muted-foreground dark:text-muted-foreground transition-colors duration-300">Time:</span> 
                      <span className="text-foreground dark:text-foreground transition-colors duration-300">{selectedSlot?.timeDisplay || `${formatTime(selectedSlot?.start)} - ${formatTime(selectedSlot?.end)}`}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-info/10 dark:bg-info/5 border border-info/20 dark:border-info/30 p-6 rounded-lg transition-colors duration-300">
                <h4 className="font-medium text-info dark:text-info mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Important Notes
                </h4>
                <ul className="text-info/80 dark:text-info/90 text-sm space-y-2 transition-colors duration-300">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-info dark:bg-info mt-2 flex-shrink-0"></div>
                    <span>Please arrive 30 minutes before your appointment</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-info dark:bg-info mt-2 flex-shrink-0"></div>
                    <span>Bring a valid ID and any relevant medical documents</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-info dark:bg-info mt-2 flex-shrink-0"></div>
                    <span>The appointment confirmation will be sent to the mobile number provided</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center pt-6 border-t border-border/50 dark:border-border/30 transition-colors duration-300">
        <div>
          {currentStep > 1 && (
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={isLoading || isSubmitting || isSuccess}
              className="gap-2 min-w-24 border-border dark:border-border hover:bg-accent dark:hover:bg-accent hover:text-accent-foreground dark:hover:text-accent-foreground transition-all duration-300"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          )}
        </div>

        <div className="flex gap-3">
          {currentStep < 4 ? (
            <Button
              onClick={handleNext}
              disabled={isNextDisabled() || isLoading}
              className="gap-2 min-w-32 bg-primary dark:bg-primary hover:bg-primary-hover dark:hover:bg-primary-hover text-primary-foreground dark:text-primary-foreground transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground dark:border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={handleSubmitAppointment}
              disabled={isSubmitting || isSuccess}
              className={`gap-2 min-w-44 transition-all duration-300 ${
                isSuccess 
                  ? 'bg-success dark:bg-success hover:bg-success dark:hover:bg-success text-success-foreground dark:text-success-foreground' 
                  : isSubmitting 
                  ? 'cursor-not-allowed opacity-75' 
                  : 'bg-success dark:bg-success hover:bg-success-hover dark:hover:bg-success-hover text-success-foreground dark:text-success-foreground shadow-lg hover:shadow-xl'
              }`}
            >
              {isSuccess ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Appointment Created!
                </>
              ) : isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-success-foreground border-t-transparent rounded-full animate-spin" />
                  Creating Appointment...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Create Appointment
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
export default AppointmentCreationFlow;