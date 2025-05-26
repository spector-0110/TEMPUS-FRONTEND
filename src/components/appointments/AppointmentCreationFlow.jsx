'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import PatientForm from './PatientForm';
import DoctorSelector from './DoctorSelector';
import SlotPicker from './SlotPicker';
import { createAppointment, fetchDoctorAvailableSlots } from '@/lib/api';
import { validateAppointmentData } from '@/lib/validation/appointment-validation';
import { useHospital } from '@/context/HospitalProvider';

/**
 * Multi-step appointment creation flow
 * Steps: Patient Details → Doctor Selection → Time Slot → Confirmation
 */
const AppointmentCreationFlow = ({ doctors, onSuccess, onCancel }) => {
  const { hospitalDetails } = useHospital();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  // Generate time slots from doctor's schedule
  const generateTimeSlotsFromSchedule = (schedules) => {
    const slots = [];
    const today = new Date();
    
    // Generate slots for the today and tommorow days
    for (let i = 0; i < 2; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dayOfWeek = date.getDay();
      
      // Find schedule for this day of week
      const daySchedule = schedules.find(schedule => 
        schedule.dayOfWeek === dayOfWeek && schedule.status === 'active'
      );
      
      if (daySchedule && daySchedule.timeRanges && daySchedule.timeRanges.length > 0) {
        // Generate time slots for each time range
        daySchedule.timeRanges.forEach(range => {
          const startTime = range.start;
          const endTime = range.end;
          const consultationTime = daySchedule.avgConsultationTime || 10; // Default 30 minutes
          
          try {
            // Parse start and end times
            const [startHour, startMinute] = startTime.split(':').map(Number);
            const [endHour, endMinute] = endTime.split(':').map(Number);
            
            // Validate time format
            if (isNaN(startHour) || isNaN(startMinute) || isNaN(endHour) || isNaN(endMinute)) {
              console.warn(`Invalid time format for doctor schedule: ${startTime} - ${endTime}`);
              return;
            }
            
            const startDateTime = new Date(date);
            startDateTime.setHours(startHour, startMinute, 0, 0);
            
            const endDateTime = new Date(date);
            endDateTime.setHours(endHour, endMinute, 0, 0);
            
            // Generate slots with consultation time intervals
            let currentSlot = new Date(startDateTime);
            
            while (currentSlot < endDateTime) {
              // Skip past slots (only allow future appointments)
              if (currentSlot > new Date()) {
                slots.push({
                  id: `${date.toISOString().split('T')[0]}_${currentSlot.toTimeString().slice(0, 5)}`,
                  date: date.toISOString().split('T')[0],
                  time: currentSlot.toTimeString().slice(0, 5),
                  datetime: new Date(currentSlot),
                  available: true,
                  scheduleId: daySchedule.id,
                  dayOfWeek: dayOfWeek,
                  consultationTime: consultationTime
                });
              }
              
              // Move to next slot
              currentSlot = new Date(currentSlot.getTime() + consultationTime * 60000);
            }
          } catch (error) {
            console.error(`Error processing time range ${startTime} - ${endTime}:`, error);
          }
        });
      }
    }
    
    return slots.sort((a, b) => a.datetime - b.datetime);
  };

  // Load available slots when doctor is selected
  const loadAvailableSlots = async (doctorId) => {
    try {
      setIsLoading(true);
      const doctor = doctors.find(doc => doc.id === doctorId);
      
      if (!doctor || !doctor.schedules) {
        setAvailableSlots([]);
        setError('No schedule found for selected doctor');
        return;
      }
      
      const schedules = doctor.schedules || [];
      const generatedSlots = generateTimeSlotsFromSchedule(schedules);
      setAvailableSlots(generatedSlots);
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
    try {
      setIsSubmitting(true);
      setError(null);

      // Check if hospitalId is available
      if (!hospitalDetails?.id) {
        throw new Error('Hospital information not available. Please refresh the page and try again.');
      }

      // Create flat data structure expected by backend
      const appointmentData = {
        hospitalId: hospitalDetails.id,
        doctorId: selectedDoctor.id,
        patientName: patientData.name.trim(),
        mobile: patientData.mobile.trim(),
        age: parseInt(patientData.age),
        appointmentDate: selectedSlot.date,
        startTime: selectedSlot.time,
        endTime: null, // Will be calculated by backend based on consultation time
      };

      // Validate the complete appointment data
      const validationResult = validateAppointmentData(appointmentData);
      
      if (!validationResult.isValid) {
        const errorMessages = validationResult.errors.map(err => err.message || err).join(', ');
        throw new Error(errorMessages);
      }

      const result = await createAppointment(validationResult.data);
      
      // Call success callback with appointment details
      onSuccess({
        appointmentId: result.appointmentId,
        patientName: patientData.name,
        doctorName: selectedDoctor.name,
        appointmentDate: selectedSlot.date,
        appointmentTime: selectedSlot.time,
        trackingLink: result.trackingLink
      });

    } catch (err) {
      console.error('Error creating appointment:', err);
      setError(err.message || 'Failed to create appointment');
    } finally {
      setIsSubmitting(false);
    }
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
        
        <div className="flex justify-between">
          {steps.map((step) => (
            <div key={step.number} className="flex flex-col items-center text-center">
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
                    <p><span className="font-medium">Time:</span> {formatTime(selectedSlot?.time)}</p>
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
              disabled={isLoading || isSubmitting}
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
              disabled={isSubmitting}
              className="gap-2 bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? 'Creating...' : 'Create Appointment'}
              <CheckCircle className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentCreationFlow;
