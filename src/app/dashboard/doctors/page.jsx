'use client';

import { useState } from 'react';
import { useHospital } from '@/context/HospitalProvider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { User } from 'lucide-react';
import DoctorCard from '@/components/doctors/DoctorCard';
import DoctorDetailsEditor from '@/components/doctors/DoctorDetailsEditor';
import { ErrorDialog } from '@/components/ui/error-dialog';
import { SuccessDialog } from '@/components/ui/success-dialog';
import { updateDoctorDetails, updateDoctorSchedule, createDoctor } from '@/lib/api'; 
import { validateUpdateDoctorData, validateAllSchedulesData, validateCreateDoctorData } from '@/lib/validation/doctor-validation';

/**
 * Main DoctorsPage component
 */
const DoctorsPage = () => {
  const { hospitalDashboardDetails, loading, backgroundRefresh } = useHospital();
  const [showAddDoctorDialog, setShowAddDoctorDialog] = useState(false);
  const [isAddingDoctor, setIsAddingDoctor] = useState(false);
  const [errorDialog, setErrorDialog] = useState({ 
    isOpen: false, 
    title: '', 
    message: '', 
    details: [],
    errorType: 'general',
    statusCode: null,
    errorData: null
  });
  const [successDialog, setSuccessDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    details: []
  });

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // Check if we have doctors data
  const doctors = hospitalDashboardDetails?.doctors || [];
  
  const handleUpdateDoctorDetails = async (doctorData) => {
    try {
      // Validate the doctor data
      const validationResult = validateUpdateDoctorData(doctorData);
      
      if (!validationResult.isValid) {
        throwError(validationResult);
        return;
      }
      
      // Call the API to update the doctor details
      await updateDoctorDetails(validationResult.data);
      
       // Show success dialog
      setSuccessDialog({
        isOpen: true,
        title: 'Doctor Updated',
        message: 'Doctor details have been successfully updated.',
        details: []
      });
      
      // Refresh data from server
      await backgroundRefresh();
      
    } catch (error) {
      const errorObj = error || {};
      const errorMessage = errorObj.message || 'Unknown error';
      console.error('Error updating doctor details:', {
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack
        } : errorObj,
        doctorData
      });
      
      // Show error in dialog
      setErrorDialog({
        isOpen: true,
        title: 'Doctor Update Error',
        message: 'Failed to update doctor details',
        details: [errorMessage || 'Unknown error occurred'],
        errorType: 'api',
        statusCode: error.status || error.statusCode || null,
        errorData: error.data || error
      });
    }
  };
  
  const handleUpdateSchedule = async (scheduleData) => {
    try {
      
      // Validate the schedule data
      const validationResult = validateAllSchedulesData(scheduleData.schedules);
      
      if (!validationResult.isValid) {
        throwError(validationResult);
        return;
      }
      
      // Call the API to update the schedule
      await updateDoctorSchedule(scheduleData);
      
      // Refresh data from server
      await backgroundRefresh();
      
      // Show success dialog
      setSuccessDialog({
        isOpen: true,
        title: 'Schedule Updated',
        message: 'Doctor schedule has been successfully updated.',
        details: []
      });
    } catch (error) {
      console.error('Error updating schedule:', {
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack
        } : error,
        scheduleData
      });
      
      // Show error in dialog
      setErrorDialog({
        isOpen: true,
        title: 'Schedule Update Error',
        message: 'Failed to update doctor schedule',
        details: [error.message || 'Unknown error occurred'],
        errorType: 'api',
        statusCode: error.status || error.statusCode || null,
        errorData: error.data || error
      });
    }
  };

  const handleAddDoctor = async (doctorData) => {
    try {
      setIsAddingDoctor(true);
  
      const sanitizedData = {
        ...doctorData,
        experience: typeof doctorData.experience === 'string' ? 
          parseInt(doctorData.experience, 10) : doctorData.experience || 0,
        age: typeof doctorData.age === 'string' ? 
          parseInt(doctorData.age, 10) : doctorData.age || 30
      };
      
      // Validate the new doctor data
      const validationResult = validateCreateDoctorData(sanitizedData);
      
      if (!validationResult.isValid) {
        throwError(validationResult);
        return;
      }
        
      await createDoctor(validationResult.data);

      setShowAddDoctorDialog(false);
      
      // Refresh data from server
      await backgroundRefresh();
      
      // Show success dialog
      setSuccessDialog({
        isOpen: true,
        title: 'Doctor Added',
        message: 'New doctor has been successfully added to your hospital.',
        details: [`${validationResult.data.name} has been added to your doctors list.`]
      });
    } catch (error) {
      // Safely handle error object that might be null or undefined
      const errorObj = error || {};
      const errorMessage = errorObj.message || 'Unknown error';
      
      console.error('Error adding doctor:', {
        error: error instanceof Error ? {
          name: error.name,
          message: errorMessage,
          stack: error.stack
        } : errorObj,
        doctorData
      });
      
      // Show error in dialog
      setErrorDialog({
        isOpen: true,
        title: 'Doctor Add Error',
        message: 'Failed to add new doctor ',
        details: [errorMessage || 'Unknown error occurred'],
        errorType: 'api',
        statusCode: error.status || error.statusCode || null,
        errorData: error.data || error
      });
    } finally {
      setIsAddingDoctor(false);
    }
  };

  const throwError = (validationResult) => {
    console.error('Validation error:', validationResult);
    
    // Check if the validation result follows the expected format from doctor-validation.js
    if (!validationResult.isValid && Array.isArray(validationResult.errors)) {
      const formattedErrors = validationResult.errors.map(err => {
        // Format each validation error with field name and message
        return `${err.field}: ${err.message}`;
      });
      
      // Show validation errors in dialog
      setErrorDialog({
        isOpen: true,
        title: 'Validation Error',
        message: 'Please fix the following validation errors:',
        errorType: 'validation',
        details: formattedErrors
      });
      return;
    }
    
    // Fallback for unexpected error formats
    // This handles any other type of error that might be passed
    let mainErrorMessage = 'Validation failed';
    let errorDetails = [];
    
    if (typeof validationResult === 'string') {
      mainErrorMessage = validationResult;
    } else if (validationResult instanceof Error) {
      mainErrorMessage = validationResult.message || 'Unknown error';
      if (validationResult.stack) {
        errorDetails.push(validationResult.stack);
      }
    } else if (typeof validationResult === 'object') {
      // Try to extract meaningful error information
      if (validationResult.message) {
        mainErrorMessage = validationResult.message;
      }
      
      // Check for various error formats
      if (Array.isArray(validationResult.error)) {
        errorDetails = validationResult.error.map(err => 
          typeof err === 'object' ? (err.message || JSON.stringify(err)) : String(err)
        );
      } else if (validationResult.error && typeof validationResult.error === 'object') {
        errorDetails = Object.entries(validationResult.error).map(([key, value]) => 
          `${key}: ${typeof value === 'object' ? JSON.stringify(value) : value}`
        );
      } else if (validationResult.data) {
        errorDetails.push(JSON.stringify(validationResult.data));
      }
    }
    
    // Show error in dialog with the best information available
    setErrorDialog({
      isOpen: true,
      title: 'Error',
      errorType: 'validation',
      message: mainErrorMessage,
      details: errorDetails
    });
    
    return;
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Doctors</h1>
          <p className="text-muted-foreground">
            Manage your hospital's doctors and their schedules
          </p>
        </div>
        <Dialog open={showAddDoctorDialog} onOpenChange={setShowAddDoctorDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <User className="h-4 w-4" />
              Add New Doctor
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Doctor</DialogTitle>
            </DialogHeader>
            <DoctorDetailsEditor 
              onSave={handleAddDoctor}
              onCancel={() => setShowAddDoctorDialog(false)}
              isLoading={isAddingDoctor}
            />
          </DialogContent>
        </Dialog>
      </div>

      {doctors.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 border border-dashed rounded-lg">
          <User size={48} className="text-muted-foreground mb-4" />
          <h3 className="font-medium text-lg">No doctors added yet</h3>
          <p className="text-muted-foreground mt-2 text-center max-w-md">
            Add doctors to your hospital to manage their schedules and appointments
          </p>
          <Button className="mt-4 gap-2" onClick={() => setShowAddDoctorDialog(true)}>
            <User className="h-4 w-4" />
            Add Your First Doctor
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {doctors.map((doctor) => (
            <DoctorCard 
              key={doctor.id} 
              doctor={doctor}
              onUpdateDoctor={handleUpdateDoctorDetails}
              onUpdateSchedule={handleUpdateSchedule}
            />
          ))}
        </div>
      )}
      
      {/* Error Dialog */}
      {errorDialog.isOpen && (
        <ErrorDialog
          isOpen={errorDialog.isOpen}
          onClose={() => setErrorDialog(prev => ({ ...prev, isOpen: false }))}
          title={errorDialog.title}
          message={errorDialog.message}
          details={errorDialog.details}
          errorType={errorDialog.errorType}
          statusCode={errorDialog.statusCode}
          errorData={errorDialog.errorData}
        />
      )}
      
      {/* Success Dialog */}
      {successDialog.isOpen && (
        <SuccessDialog
          isOpen={successDialog.isOpen}
          onClose={() => setSuccessDialog(prev => ({ ...prev, isOpen: false }))}
          title={successDialog.title}
          message={successDialog.message}
          details={successDialog.details}
        />
      )}
    </div>
  );
};

export default DoctorsPage;
