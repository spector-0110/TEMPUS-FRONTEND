'use client';

import { useState, useEffect } from 'react';
import { useHospital } from '@/context/HospitalProvider';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/Spinner';
import { Calendar, User, Clock, Phone, Mail, Award, Briefcase, Edit, Plus, Minus, Save, Check } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

// Component to display doctor's schedule
const DoctorSchedule = ({ schedules }) => {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  return (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto p-2">
      {schedules.map((schedule) => (
        <div key={schedule.id} className="border rounded-lg p-3 bg-card">
          <div className="font-medium text-lg mb-2">{dayNames[schedule.dayOfWeek]}</div>
          <div className="text-sm text-muted-foreground mb-2">
            Average consultation: {schedule.avgConsultationTime} min
          </div>
          <div className="space-y-2">
            {schedule.timeRanges.map((range, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-primary" />
                <span>{range.start} - {range.end}</span>
              </div>
            ))}
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            Status: <span className={schedule.status === 'active' ? 'text-green-500' : 'text-red-500'}>
              {schedule.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

// Schedule Editor Component
const ScheduleEditor = ({ doctorId, initialSchedules, onSave, onCancel }) => {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const [schedules, setSchedules] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  // Initialize with doctor's existing schedules
  useEffect(() => {
    if (initialSchedules) {
      // Sort by day of week for consistency
      const sortedSchedules = [...initialSchedules].sort((a, b) => a.dayOfWeek - b.dayOfWeek);
      setSchedules(sortedSchedules);
    }
  }, [initialSchedules]);

  // Add a new time range to a specific day schedule
  const addTimeRange = (dayIndex) => {
    setSchedules(prev => 
      prev.map(schedule => {
        if (schedule.dayOfWeek === dayIndex) {
          return {
            ...schedule,
            timeRanges: [...schedule.timeRanges, { start: "09:00", end: "17:00" }]
          };
        }
        return schedule;
      })
    );
  };

  // Remove a time range from a specific day schedule
  const removeTimeRange = (dayIndex, rangeIndex) => {
    setSchedules(prev => 
      prev.map(schedule => {
        if (schedule.dayOfWeek === dayIndex) {
          const newTimeRanges = [...schedule.timeRanges];
          newTimeRanges.splice(rangeIndex, 1);
          return {
            ...schedule,
            timeRanges: newTimeRanges
          };
        }
        return schedule;
      })
    );
  };

  // Update time range values
  const updateTimeRange = (dayIndex, rangeIndex, field, value) => {
    setSchedules(prev => 
      prev.map(schedule => {
        if (schedule.dayOfWeek === dayIndex) {
          const newTimeRanges = [...schedule.timeRanges];
          newTimeRanges[rangeIndex] = {
            ...newTimeRanges[rangeIndex],
            [field]: value
          };
          return {
            ...schedule,
            timeRanges: newTimeRanges
          };
        }
        return schedule;
      })
    );
  };

  // Update consultation time
  const updateConsultationTime = (dayIndex, value) => {
    setSchedules(prev => 
      prev.map(schedule => {
        if (schedule.dayOfWeek === dayIndex) {
          return {
            ...schedule,
            avgConsultationTime: parseInt(value) || 15
          };
        }
        return schedule;
      })
    );
  };

  // Update status
  const updateStatus = (dayIndex, value) => {
    setSchedules(prev => 
      prev.map(schedule => {
        if (schedule.dayOfWeek === dayIndex) {
          return {
            ...schedule,
            status: value
          };
        }
        return schedule;
      })
    );
  };

  // Handle save action
  const handleSave = () => {
    // Construct the data object to be sent
    const scheduleData = {
      doctor_id: doctorId,
      schedules: schedules
    };
    
    onSave(scheduleData);
    setShowConfirmation(false);
  };

  return (
    <>
      {!showConfirmation ? (
        <div className="space-y-6 max-h-[70vh] overflow-y-auto p-2">
          {schedules.map((schedule) => (
            <div key={schedule.dayOfWeek} className="border rounded-lg p-4 bg-card">
              <div className="font-medium text-lg mb-3 flex justify-between items-center">
                <span>{dayNames[schedule.dayOfWeek]}</span>
                <div className="flex items-center gap-2">
                  <Label htmlFor={`status-${schedule.dayOfWeek}`} className="text-xs">Status:</Label>
                  <select
                    id={`status-${schedule.dayOfWeek}`}
                    value={schedule.status}
                    onChange={(e) => updateStatus(schedule.dayOfWeek, e.target.value)}
                    className="text-xs p-1 rounded-md border border-input bg-background"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 mb-4">
                <Label htmlFor={`consultation-${schedule.dayOfWeek}`} className="text-sm">
                  Avg. consultation time (min):
                </Label>
                <Input
                  id={`consultation-${schedule.dayOfWeek}`}
                  type="number"
                  min="5"
                  max="60"
                  value={schedule.avgConsultationTime}
                  onChange={(e) => updateConsultationTime(schedule.dayOfWeek, e.target.value)}
                  className="w-20 h-8 text-sm"
                />
              </div>
              
              <div className="space-y-3">
                {schedule.timeRanges.map((range, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      type="time"
                      value={range.start}
                      onChange={(e) => updateTimeRange(schedule.dayOfWeek, index, 'start', e.target.value)}
                      className="w-24 h-8"
                    />
                    <span>to</span>
                    <Input
                      type="time"
                      value={range.end}
                      onChange={(e) => updateTimeRange(schedule.dayOfWeek, index, 'end', e.target.value)}
                      className="w-24 h-8"
                    />
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => removeTimeRange(schedule.dayOfWeek, index)}
                      className="h-8 w-8 p-0"
                      disabled={schedule.timeRanges.length === 1}
                    >
                      <Minus className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addTimeRange(schedule.dayOfWeek)}
                  className="mt-2"
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Time Slot
                </Button>
              </div>
            </div>
          ))}
          
          <DialogFooter>
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={() => setShowConfirmation(true)}>
              <Save className="h-4 w-4 mr-1" /> Save Changes
            </Button>
          </DialogFooter>
        </div>
      ) : (
        <div className="p-4 space-y-6">
          <DialogDescription className="text-center">
            Are you sure you want to update this doctor's schedule? 
            This will affect all future appointments.
          </DialogDescription>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmation(false)}>
              Go Back
            </Button>
            <Button onClick={handleSave}>
              <Check className="h-4 w-4 mr-1" /> Confirm Update
            </Button>
          </DialogFooter>
        </div>
      )}
    </>
  );
};

// Individual Doctor Card Component
const DoctorCard = ({ doctor, onUpdateDoctor, onUpdateSchedule }) => {
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [editScheduleOpen, setEditScheduleOpen] = useState(false);
  const [editDoctorOpen, setEditDoctorOpen] = useState(false);
  
  const handleUpdateSchedule = (scheduleData) => {
    onUpdateSchedule(scheduleData);
    setEditScheduleOpen(false);
  };
  
  const handleUpdateDoctor = (doctorData) => {
    onUpdateDoctor(doctorData);
    setEditDoctorOpen(false);
  };
  
  return (
    <Card className="h-full flex flex-col transition-all duration-200 hover:shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 rounded-full bg-secondary overflow-hidden flex items-center justify-center">
              {doctor.photo && doctor.photo !== "https://example.com/doctor-photo.jpg" ? (
                <img 
                  src={doctor.photo} 
                  alt={doctor.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <User size={32} className="text-secondary-foreground" />
              )}
            </div>
            <div>
              <CardTitle className="text-xl">{doctor.name}</CardTitle>
              <CardDescription className="flex items-center gap-1">
                <Award size={14} />
                <span>{doctor.specialization}</span>
              </CardDescription>
            </div>
          </div>
          <Dialog open={editDoctorOpen} onOpenChange={setEditDoctorOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Edit size={16} />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>Edit Doctor Details</DialogTitle>
              </DialogHeader>
              {/* <DoctorDetailsEditor 
                doctor={doctor} 
                onSave={handleUpdateDoctor} 
                onCancel={() => setEditDoctorOpen(false)} 
              /> */}
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Mail size={14} className="text-muted-foreground"/>
            <span>{doctor.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone size={14} className="text-muted-foreground"/>
            <span>{doctor.phone}</span>
          </div>
          <div className="flex items-center gap-2">
            <Award size={14} className="text-muted-foreground"/>
            <span>{doctor.qualification}</span>
          </div>
          <div className="flex items-center gap-2">
            <Briefcase size={14} className="text-muted-foreground"/>
            <span>{doctor.experience} years experience</span>
          </div>
          <div className="mt-3 text-xs">
            <span className="text-muted-foreground">Status: </span>
            <span className={doctor.status === 'active' ? 'text-green-500' : 'text-red-500'}>
              {doctor.status}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2 border-t pt-4">
        <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1">
              <Calendar className="h-4 w-4" />
              View Schedule
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Dr. {doctor.name}'s Schedule</DialogTitle>
            </DialogHeader>
            <DoctorSchedule schedules={doctor.schedules} />
          </DialogContent>
        </Dialog>
        
        <Dialog open={editScheduleOpen} onOpenChange={setEditScheduleOpen}>
          <DialogTrigger asChild>
            <Button variant="secondary" size="sm" className="gap-1">
              <Clock className="h-4 w-4" />
              Update Schedule
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Update Dr. {doctor.name}'s Schedule</DialogTitle>
              <DialogDescription>
                Modify the schedule details for each day
              </DialogDescription>
            </DialogHeader>
            <ScheduleEditor 
              doctorId={doctor.id} 
              initialSchedules={doctor.schedules} 
              onSave={handleUpdateSchedule} 
              onCancel={() => setEditScheduleOpen(false)} 
            />
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
};

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
      // For now we'll just show a success message
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
      // For now we'll just show a success message
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
            {/* <DoctorDetailsEditor 
              onSave={(doctorData) => {
                console.log('Adding new doctor:', doctorData);
                setShowAddDoctorDialog(false);
                setActionStatus({
                  type: 'success',
                  message: `Doctor ${doctorData.name} added successfully`
                });
                setTimeout(() => {
                  setActionStatus({ type: '', message: '' });
                }, 3000);
              }} 
              onCancel={() => setShowAddDoctorDialog(false)} 
            /> */}
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Status message */}
      {actionStatus.message && (
        <div className={`p-3 rounded-md ${
          actionStatus.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 
          actionStatus.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : ''
        }`}>
          {actionStatus.message}
        </div>
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