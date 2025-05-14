'use client';

import { useState } from 'react';
import { useHospital } from '@/context/HospitalProvider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/Spinner';
import { User } from 'lucide-react';
import DoctorCard from '@/components/doctors/DoctorCard';
import DoctorDetailsEditor from '@/components/doctors/DoctorDetailsEditor';
import StatusMessage from '@/components/ui/StatusMessage';
import {updateDoctorDetails , updateDoctorSchedule} from '@/lib/api'; 

/**
 * Main DoctorsPage component
 */
const DoctorsPage = () => {
  const { hospitalDashboardDetails, loading, backgroundRefresh } = useHospital();
  const [showAddDoctorDialog, setShowAddDoctorDialog] = useState(false);
  const [actionStatus, setActionStatus] = useState({ type: '', message: '' });

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
      // Here you would call the API to update the doctor details

      console.log('Updating doctor details:', doctorData);
      
      setActionStatus({
        type: 'success',
        message: `Doctor details updated successfully for ${doctorData.name}`
      });
      
      // In a real implementation, refresh data from server
      // await backgroundRefresh();
      
      // Hide status after 3 seconds
      setTimeout(() => {
        setActionStatus({ type: '', message: '' });
      }, 3000);
    } catch (error) {
      console.error('Error updating doctor details:', error);
      setActionStatus({
        type: 'error',
        message: 'Failed to update doctor details. Please try again.'
      });
      
      setTimeout(() => {
        setActionStatus({ type: '', message: '' });
      }, 3000);
    }
  };
  
  const handleUpdateSchedule = async (scheduleData) => {
    try {
      // Here you would call the API to update the schedule
      console.log('Updating doctor schedule:', scheduleData);
      
      setActionStatus({
        type: 'success',
        message: 'Schedule updated successfully'
      });
      
      // In a real implementation, refresh data from server
      // await backgroundRefresh();
      
      // Hide status after 3 seconds
      setTimeout(() => {
        setActionStatus({ type: '', message: '' });
      }, 3000);
    } catch (error) {
      console.error('Error updating schedule:', error);
      setActionStatus({
        type: 'error',
        message: 'Failed to update schedule. Please try again.'
      });
      
      setTimeout(() => {
        setActionStatus({ type: '', message: '' });
      }, 3000);
    }
  };

  const handleAddDoctor = (doctorData) => {
    console.log('Adding new doctor:', doctorData);
    setShowAddDoctorDialog(false);
    setActionStatus({
      type: 'success',
      message: `Doctor ${doctorData.name} added successfully`
    });
    
    setTimeout(() => {
      setActionStatus({ type: '', message: '' });
    }, 3000);
  };

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
