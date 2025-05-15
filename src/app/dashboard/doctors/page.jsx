'use client';

import { useState } from 'react';
import { useHospital } from '@/context/HospitalProvider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { User } from 'lucide-react';
import DoctorCard from '@/components/doctors/DoctorCard';
import DoctorDetailsEditor from '@/components/doctors/DoctorDetailsEditor';
import StatusMessage from '@/components/ui/StatusMessage';
import ErrorDialog from '@/components/ui/ErrorDialog';
import { updateDoctorDetails, updateDoctorSchedule, createDoctor } from '@/lib/api'; 
import { validateUpdateDoctorData, validateAllSchedulesData, validateCreateDoctorData } from '@/lib/validation/doctor-validation';

/**
 * Main DoctorsPage component
 */
const DoctorsPage = () => {
  const { hospitalDashboardDetails, loading, backgroundRefresh } = useHospital();
  const [showAddDoctorDialog, setShowAddDoctorDialog] = useState(false);
  const [actionStatus, setActionStatus] = useState({ type: '', message: '' });
  const [errorDialog, setErrorDialog] = useState({ 
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
      
      setActionStatus({
        type: 'success',
        message: `Doctor details updated successfully for ${doctorData.name}`
      });
      
      // Refresh data from server
      await backgroundRefresh();
      
      // Hide status after 3 seconds
      setTimeout(() => {
        setActionStatus({ type: '', message: '' });
      }, 5000);
    } catch (error) {
      console.error('Error updating doctor details:', {
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack
        } : error,
        doctorData
      });
      
      // Show error in dialog
      setErrorDialog({
        isOpen: true,
        title: 'Doctor Update Error',
        message: 'Failed to update doctor details',
        details: [error.message || 'Unknown error occurred']
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
      
      setActionStatus({
        type: 'success',
        message: 'Schedule updated successfully'
      });
      
      // Refresh data from server
      await backgroundRefresh();
      
      // Hide status after 3 seconds
      setTimeout(() => {
        setActionStatus({ type: '', message: '' });
      }, 5000);
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
        details: [error.message || 'Unknown error occurred']
      });
    }
  };

  const handleAddDoctor = async (doctorData) => {
    try {
      // Ensure numeric fields are properly typed
      console.log('Adding new doctor:', doctorData);
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
      
      console.log('Adding new doctor FWD---------->>>:', validationResult.data);
    
      await createDoctor(validationResult.data);
      console.log('Doctor added successfully:', validationResult.data);

      setShowAddDoctorDialog(false);
      setActionStatus({
        type: 'success',
        message: `Doctor ${validationResult.data.name} added successfully`
      });
      
      // Refresh data from server
      await backgroundRefresh();
      
      setTimeout(() => {
        setActionStatus({ type: '', message: '' });
      }, 3000);
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
      
      setActionStatus({
        type: 'error',
        message: `Failed to add doctor: ${errorMessage}`
      });
      
      setTimeout(() => {
        setActionStatus({ type: '', message: '' });
      }, 5000);
    }
  };

  const throwError = (validationResult) => {
    console.error('Validation error :', validationResult.error);
    
    // Extract error message and details
    const mainErrorMessage = typeof validationResult.error === 'string'
      ? validationResult.error
      : 'Validation failed';
      
    // Create detailed error list for the dialog
    let errorDetails = [];
    if (Array.isArray(validationResult.error)) {
      errorDetails = validationResult.error.map(err => err.message || String(err));
    } else if (Array.isArray(validationResult.errors)) {
      errorDetails = validationResult.errors.map(err => `${err.field}: ${err.message}`);
    }
    
    // Show error in dialog
    setErrorDialog({
      isOpen: true,
      title: 'Validation Error',
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
            />
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Status message */}
      {actionStatus.message && (
        <StatusMessage type={actionStatus.type} message={actionStatus.message} />
      )}

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
    </div>
  );
};

export default DoctorsPage;
