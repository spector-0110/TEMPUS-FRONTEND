'use client';

import { useState } from 'react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Calendar, User, Clock, Phone, Mail, Award, Briefcase, Edit } from 'lucide-react';

import DoctorScheduleViewer from './DoctorScheduleViewer';
import ScheduleEditor from './ScheduleEditor';
import DoctorDetailsEditor from './DoctorDetailsEditor';

/**
 * Component for displaying a doctor card with actions
 */
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
              <DoctorDetailsEditor 
                doctor={doctor} 
                onSave={handleUpdateDoctor} 
                onCancel={() => setEditDoctorOpen(false)} 
              />
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
            <span className={doctor.status === 'active' ? 'text-success' : 'text-destructive'}>
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
            <DoctorScheduleViewer schedules={doctor.schedules} />
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

export default DoctorCard;
