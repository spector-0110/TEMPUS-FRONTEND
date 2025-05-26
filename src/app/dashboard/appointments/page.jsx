
'use client';

import { useState, useEffect } from 'react';
import { useHospital } from '@/context/HospitalProvider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Plus, Filter, Users, Clock, CheckCircle, XCircle, History } from 'lucide-react';
import { ErrorDialog } from '@/components/ui/error-dialog';
import { SuccessDialog } from '@/components/ui/success-dialog';
import AppointmentCreationFlow from '@/components/appointments/AppointmentCreationFlow';
import AppointmentDetailsModal from '@/components/appointments/AppointmentDetailsModal';

/**
 * Main Appointments Page Component
 * Features: Appointment management with filtering and creation flow
 */
export default function AppointmentsPage() {
  const { hospitalDashboardDetails, loading } = useHospital();
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [activeTimeFilter, setActiveTimeFilter] = useState('today');
  const [activeStatusFilter, setActiveStatusFilter] = useState('all');
  const [selectedDoctor, setSelectedDoctor] = useState('all');
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

  // Get doctors list from hospital data
  const doctors = hospitalDashboardDetails?.doctors || [];

  useEffect(() => {
    loadAppointments();
  }, []);

  useEffect(() => {
    filterAppointments();
  }, [appointments, activeTimeFilter, activeStatusFilter, selectedDoctor]);


  // apppointment loading function fetching appointments from hospitalDashboardDetails
  const loadAppointments = async () => {
    try {
      setIsLoadingAppointments(true);
      
      // Extract appointments from the nested structure
      const appointmentsFromBackend = hospitalDashboardDetails?.appointments;
      
      if (!appointmentsFromBackend) {
        setAppointments([]);
        return;
      }
      
      // Combine all appointments from different sources
      const allAppointments = [
        ...(appointmentsFromBackend.upcoming?.today || []),
        ...(appointmentsFromBackend.upcoming?.tomorrow || []),
        ...(appointmentsFromBackend.history || [])
      ];
      
      // For testing purposes, if no appointments exist, create some mock data
      // Remove this in production
      if (allAppointments.length === 0) {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const mockAppointments = [
          {
            id: 'mock-1',
            patient: { 
              name: 'John Doe', 
              mobile: '9876543210', 
              email: 'john.doe@email.com',
              age: 35,
              gender: 'Male',
              address: '123 Main Street, Delhi, India'
            },
            doctor: { 
              name: ' Vatsa', 
              specialization: 'Cardiology',
              department: 'Cardiology Department'
            },
            appointmentDate: today.toISOString(),
            appointmentTime: '09:00',
            duration: 30,
            status: 'scheduled',
            reason: 'Regular checkup for heart condition',
            notes: 'Patient has a history of high blood pressure',
            patientName: 'John Doe',
            patientMobile: '9876543210',
            doctorName: 'Dr. Vatsa',
            datetime: today
          },
          {
            id: 'mock-2',
            patient: { 
              name: 'Jane Smith', 
              mobile: '8765432109', 
              email: 'jane.smith@email.com',
              age: 28,
              gender: 'Female',
              address: '456 Oak Avenue, Mumbai, India'
            },
            doctor: { 
              name: 'Dr. Vatsa', 
              specialization: 'Cardiology',
              department: 'Cardiology Department'
            },
            appointmentDate: today.toISOString(),
            appointmentTime: '10:30',
            duration: 45,
            status: 'completed',
            reason: 'Follow-up consultation',
            notes: 'Patient is responding well to treatment',
            patientName: 'Jane Smith',
            patientMobile: '8765432109',
            doctorName: 'Dr. Vatsa',
            datetime: today
          },
          {
            id: 'mock-3',
            patient: { 
              name: 'Robert Wilson', 
              mobile: '7654321098', 
              email: 'robert.wilson@email.com',
              age: 45,
              gender: 'Male',
              address: '789 Pine Street, Bangalore, India'
            },
            doctor: { 
              name: 'Dr. Vatsa', 
              specialization: 'Cardiology',
              department: 'Cardiology Department'
            },
            appointmentDate: tomorrow.toISOString(),
            appointmentTime: '14:00',
            duration: 30,
            status: 'confirmed',
            reason: 'Chest pain evaluation',
            notes: 'Patient experiencing mild chest discomfort',
            patientName: 'Robert Wilson',
            patientMobile: '7654321098',
            doctorName: 'Dr. Vatsa',
            datetime: tomorrow
          }
        ];
        setAppointments(mockAppointments);
      } else {
        // Ensure appointments is always an array
        setAppointments(Array.isArray(allAppointments) ? allAppointments : []);
      }
    } catch (error) {
      console.error('Error loading appointments:', error);
      // Ensure appointments is set to empty array on error
      setAppointments([]);
      setErrorDialog({
        isOpen: true,
        title: 'Load Error',
        message: 'Failed to load appointments',
        details: [error.message || 'Unknown error occurred'],
        errorType: 'api',
        statusCode: error.status || null,
        errorData: error.data || error
      });
    } finally {
      setIsLoadingAppointments(false);
    }
  };

  const filterAppointments = () => {
    // Ensure appointments is an array before filtering
    if (!Array.isArray(appointments)) {
      setFilteredAppointments([]);
      console.log('Appointments data is not an array:');
      return;
    }
    
    let filtered = [...appointments];
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Time-based filtering
    if (activeTimeFilter === 'today') {
      const todayStr = today.toISOString().split('T')[0];
      filtered = filtered.filter(apt => apt.appointmentDate === todayStr);
    } else if (activeTimeFilter === 'tomorrow') {
      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      filtered = filtered.filter(apt => apt.appointmentDate === tomorrowStr);
    } else if (activeTimeFilter === 'history') {
      const todayStr = today.toISOString().split('T')[0];
      filtered = filtered.filter(apt => apt.appointmentDate < todayStr);
    }

    // Status-based filtering
    if (activeStatusFilter !== 'all') {
      filtered = filtered.filter(apt => apt.status === activeStatusFilter);
    }

    // Doctor-based filtering
    if (selectedDoctor !== 'all') {
      filtered = filtered.filter(apt => apt.doctorId === selectedDoctor);
    }
    console.log('Filtered Appointments:', filtered);
    setFilteredAppointments(filtered);
  };

  const handleAppointmentCreated = (appointmentDetails) => {
    setShowCreateDialog(false);
    setSuccessDialog({
      isOpen: true,
      title: 'Appointment Created',
      message: 'New appointment has been successfully created.',
      details: [
        `Patient: ${appointmentDetails.patientName}`,
        `Doctor: Dr. ${appointmentDetails.doctorName}`,
        `Date: ${appointmentDetails.appointmentDate}`,
        `Time: ${appointmentDetails.appointmentTime}`,
        `Appointment ID: ${appointmentDetails.appointmentId}`
      ]
    });
    loadAppointments(); // Refresh appointments list
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'booked': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'missed': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'booked': return <Clock className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'missed': return <XCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
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

  // Appointment action handlers
  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailsModal(true);
  };

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      // Update appointment status in local state immediately for better UX
      setAppointments(prevAppointments => 
        prevAppointments.map(apt => 
          apt.id === appointmentId 
            ? { ...apt, status: newStatus }
            : apt
        )
      );

      // Here you would typically make an API call to update the status
      // await updateAppointmentStatus(appointmentId, newStatus);

      setSuccessDialog({
        isOpen: true,
        title: 'Status Updated',
        message: `Appointment status has been updated to ${newStatus}.`,
        details: [`Appointment ID: ${appointmentId}`]
      });

    } catch (error) {
      console.error('Error updating appointment status:', error);
      // Revert the local state change on error
      loadAppointments();
      
      setErrorDialog({
        isOpen: true,
        title: 'Update Failed',
        message: 'Failed to update appointment status',
        details: [error.message || 'Unknown error occurred'],
        errorType: 'api',
        statusCode: error.status || null,
        errorData: error.data || error
      });
    }
  };

  const handleEditAppointment = (appointment) => {
    // Close details modal and show edit functionality
    setShowDetailsModal(false);
    // Here you could implement edit functionality
    // For now, just show a success message indicating the feature
    setSuccessDialog({
      isOpen: true,
      title: 'Edit Feature',
      message: 'Edit appointment functionality will be implemented here.',
      details: [`Appointment ID: ${appointment.id}`]
    });
  };

  const handleCancelAppointment = async (appointmentId) => {
    try {
      await handleStatusChange(appointmentId, 'cancelled');
      setShowDetailsModal(false);
    } catch (error) {
      console.error('Error cancelling appointment:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
          <p className="text-muted-foreground">
            Manage your hospital's appointment system and create new appointments
          </p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2 w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              Create New Appointment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
            <AppointmentCreationFlow 
              doctors={doctors}
              onSuccess={handleAppointmentCreated}
              onCancel={() => setShowCreateDialog(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Today's Appointments</p>
                <p className="text-2xl font-bold">
                  {(() => {
                    const appointmentsData = hospitalDashboardDetails?.appointments;
                    const todaySlots = appointmentsData?.upcoming?.today || [];
                    return Array.isArray(todaySlots) ? todaySlots.length : 0;
                  })()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Patients</p>
                <p className="text-2xl font-bold">{Array.isArray(appointments) ? appointments.length : 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-emerald-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">
                  {Array.isArray(appointments) ? appointments.filter(apt => apt.status === 'completed').length : 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">
                  {Array.isArray(appointments) ? appointments.filter(apt => apt.status === 'booked').length : 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Appointments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Time-based Filters */}
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Time Period</label>
              <Tabs value={activeTimeFilter} onValueChange={setActiveTimeFilter}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="today">Today</TabsTrigger>
                  <TabsTrigger value="tomorrow">Tomorrow</TabsTrigger>
                  <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Status-based Filters */}
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Tabs value={activeStatusFilter} onValueChange={setActiveStatusFilter}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="booked">Booked</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                  <TabsTrigger value="missed">Missed</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Doctor Filter */}
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Doctor</label>
              <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                <SelectTrigger>
                  <SelectValue placeholder="Select doctor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Doctors</SelectItem>
                  {doctors.map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.id}>
                      Dr. {doctor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appointments List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Appointments ({filteredAppointments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingAppointments ? (
            <div className="flex justify-center py-8">
              <Spinner size="md" />
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-500 mb-2">No appointments found</h3>
              <p className="text-gray-200 mb-4">
                {appointments.length === 0 
                  ? "No appointments have been created yet."
                  : "No appointments match the current filters."
                }
              </p>
              <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Create First Appointment
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAppointments.map((appointment) => (
                <div key={appointment.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{appointment.patientName}</h3>
                        <Badge className={`${getStatusColor(appointment.status)} flex items-center gap-1`}>
                          {getStatusIcon(appointment.status)}
                          {appointment.status.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Doctor:</span> Dr. {appointment.doctorName}
                        </div>
                        <div>
                          <span className="font-medium">Date:</span> {formatDate(appointment.appointmentDate)}
                        </div>
                        <div>
                          <span className="font-medium">Time:</span> {formatTime(appointment.appointmentTime)}
                        </div>
                        <div>
                          <span className="font-medium">Phone:</span> {appointment.patientMobile}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleViewDetails(appointment)}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error Dialog */}
      <ErrorDialog
        isOpen={errorDialog.isOpen}
        onClose={() => setErrorDialog({ ...errorDialog, isOpen: false })}
        title={errorDialog.title}
        message={errorDialog.message}
        details={errorDialog.details}
        errorType={errorDialog.errorType}
        statusCode={errorDialog.statusCode}
        errorData={errorDialog.errorData}
      />

      {/* Success Dialog */}
      <SuccessDialog
        isOpen={successDialog.isOpen}
        onClose={() => setSuccessDialog({ ...successDialog, isOpen: false })}
        title={successDialog.title}
        message={successDialog.message}
        details={successDialog.details}
      />

      {/* Appointment Details Modal */}
      <AppointmentDetailsModal
        appointment={selectedAppointment}
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedAppointment(null);
        }}
        onStatusChange={handleStatusChange}
        onEdit={handleEditAppointment}
        onCancel={handleCancelAppointment}
      />
    </div>
  );
}
