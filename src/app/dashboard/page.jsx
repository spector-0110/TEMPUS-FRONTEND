
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useHospital } from '@/context/HospitalProvider';
import { AuthRefresh } from '@/components/auth/AuthRefresh';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Calendar, Plus, Filter, Users, Clock, CheckCircle, XCircle, History, CreditCard, Search, X ,FileText} from 'lucide-react';
import { ErrorDialog } from '@/components/ui/error-dialog';
import { SuccessDialog } from '@/components/ui/success-dialog';
import AppointmentCreationFlow from '@/components/appointments/AppointmentCreationFlow';
import AppointmentDetailsModal from '@/components/appointments/AppointmentDetailsModal';
import PatientHistoryModal from '@/components/appointments/PatientHistoryModal';
import {getTodayAndTomorrowandPastWeekAppointments, updateAppointmentStatus, updateAppointmentPaymentStatus, fetchPatientHistoryUsingMobileNumber}  from "@/lib/api"
import AppointmentDetailsProvider from '@/context/AppointmentDetailsProvider';
import { DateTime } from 'luxon';

export default function AppointmentsPage() {
  const { hospitalDashboardDetails, loading } = useHospital();
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [activeTimeFilter, setActiveTimeFilter] = useState('today');
  const [selectedDoctor, setSelectedDoctor] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [appointmentHistory, setAppointmentHistory] = useState([]);
  const hasLoadedAppointments = useRef(false);
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
  const subdomain = hospitalDashboardDetails?.hospitalInfo?.subdomain || '';

  useEffect(() => {
    if (!isLoadingAppointments && !hasLoadedAppointments.current) {
      hasLoadedAppointments.current = true;
      loadAppointments();
    }
  }, []); // Empty dependency array to run only once

  useEffect(() => {
    // Only filter if we have appointments data
    if (appointments.length > 0) {
      filterAppointments();
    }
  }, [appointments, activeTimeFilter, selectedDoctor, searchQuery]);


  // appointment loading function fetching appointments from backend
  const loadAppointments = useCallback(async (forceReload = false) => {
    // Prevent multiple simultaneous API calls, unless force reload is requested
    if (isLoadingAppointments && !forceReload) {
      return;
    }
    try {
      setIsLoadingAppointments(true);
      // Extract appointments from the nested structure
      const appointmentsFromBackend = await getTodayAndTomorrowandPastWeekAppointments();
      
      if (!appointmentsFromBackend || !appointmentsFromBackend.data) {
        setAppointments([]);
        setAppointmentHistory([]);
        return;
      }

      const data = appointmentsFromBackend.data;
      
      // Helper function to extract time from ISO datetime string
      const extractTimeFromISO = (isoString) => {
        if (!isoString) return null;
        const date = new Date(isoString);
        return date.toTimeString().slice(0, 5); // Extract HH:MM format
      };

      // Helper function to format appointment data
      const formatAppointment = (apt) => ({
        id: apt.id,
        hospitalId: apt.hospitalId,
        doctorId: apt.doctorId,
        patientName: apt.patientName,
        mobile: apt.mobile,
        age: apt.age,
        appointmentDate: apt.appointmentDate.split('T')[0], // Extract date part (YYYY-MM-DD)
        appointmentTime: extractTimeFromISO(apt.startTime), // Extract time from startTime ISO string
        startTime: apt.startTime,
        endTime: apt.endTime,
        status: apt.status,
        notificationStatus: apt.notificationStatus,
        paymentStatus: apt.paymentStatus,
        createdAt: apt.createdAt,
        doctor: apt.doctor,
        documents: apt.documents || [], // Add documents array
        // Legacy format for compatibility
        patient: {
          name: apt.patientName,
          mobile: apt.mobile,
          age: apt.age
        },
        patientMobile: apt.mobile,
        doctorName: apt.doctor?.name,
        datetime: new Date(apt.appointmentDate)
      });

      // Combine all appointments from different sources
      const todayAppointments = (data.today || []).map(formatAppointment);
      const tomorrowAppointments = (data.tomorrow || []).map(formatAppointment);
      const historyAppointments = (data.history?.appointments || []).map(formatAppointment);

      // Combine all appointments
      const allAppointments = [
        ...todayAppointments,
        ...tomorrowAppointments,
        ...historyAppointments
      ];

      // Store history separately for potential future use
      setAppointmentHistory(historyAppointments);
      
      // Set all appointments
      setAppointments(allAppointments);
      
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
  }, []); // Remove dependency on isLoadingAppointments to prevent unnecessary re-renders

  const filterAppointments = useCallback(() => {
    // Ensure appointments is an array before filtering
    if (!Array.isArray(appointments)) {
      setFilteredAppointments([]);
      return;
    }
    
    let filtered = [...appointments];
    // Time-based filtering using Luxon for proper timezone handling
    const today = DateTime.now().setZone('Asia/Kolkata');
    const tomorrow = today.plus({ days: 1 });
    

    // console.log(today.toISODate(), tomorrow.toISODate());

    // Time-based filtering
    if (activeTimeFilter === 'today') {
      const todayStr = today.toISO().split('T')[0];
      filtered = filtered.filter(apt => apt.appointmentDate === todayStr);
    } else if (activeTimeFilter === 'tomorrow') {
      const tomorrowStr = tomorrow.toISO().split('T')[0];
      filtered = filtered.filter(apt => apt.appointmentDate === tomorrowStr);
    } else if (activeTimeFilter === 'history') {
      // For history, we can use the appointmentHistory state which is already set
      // Exclude today and tomorrow from history
      const todayStr = today.toISODate();
      const tomorrowStr = tomorrow.toISODate();

      filtered = appointmentHistory.filter(apt => 
        apt.appointmentDate !== todayStr && apt.appointmentDate !== tomorrowStr
      );
      filtered = appointmentHistory;
    }
    
    // Doctor-based filtering
    if (selectedDoctor !== 'all') {
      filtered = filtered.filter(apt => apt.doctorId === selectedDoctor);
    }

    // Search-based filtering (by name or mobile number)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(apt => {
        const patientName = (apt.patientName || '').toLowerCase();
        const mobile = (apt.mobile || apt.patientMobile || '').toString();
        
        return patientName.includes(query) || mobile.includes(query);
      });
    }
    setFilteredAppointments(filtered);
  }, [appointments, activeTimeFilter, selectedDoctor, searchQuery]);

  const handleAppointmentCreated = (appointmentDetails) => {
    setShowCreateDialog(false);
    
    // Force reload appointments immediately after creation
    loadAppointments(true); // Force reload by passing true
    
    // Show success dialog after triggering the reload
    setSuccessDialog({
      isOpen: true,
      title: 'Appointment Created',
      message: 'New appointment has been successfully created.',
      details: [
        `Patient: ${appointmentDetails.data.patientName}`,
        `Doctor: Dr. ${appointmentDetails.data.doctor.name}`,
        `Date: ${appointmentDetails.data.appointmentDate.split('T')[0]}`,
        `Status: ${appointmentDetails.data.status}`,
      ]
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'booked': return 'bg-muted dark:bg-muted text-muted-foreground dark:text-muted-foreground border-border dark:border-border';
      case 'completed': return 'bg-success/10 dark:bg-success/20 text-success dark:text-success border-success/30 dark:border-success/40';
      case 'missed': return 'bg-destructive/10 dark:bg-destructive/20 text-destructive dark:text-destructive border-destructive/30 dark:border-destructive/40';
      case 'cancelled': return 'bg-muted dark:bg-muted text-muted-foreground dark:text-muted-foreground border-border dark:border-border';
      case 'confirmed': return 'bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary border-primary/30 dark:border-primary/40';
      default: return 'bg-muted dark:bg-muted text-muted-foreground dark:text-muted-foreground border-border dark:border-border';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'booked': return <Clock className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'missed': return <XCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getPaymentStatusColor = (paymentStatus) => {
    switch (paymentStatus) {
      case 'paid': return 'bg-success/10 dark:bg-success/20 text-success dark:text-success border-success/30 dark:border-success/40';
      case 'unpaid': return 'bg-warning/10 dark:bg-warning/20 text-warning dark:text-warning border-warning/30 dark:border-warning/40';
      default: return 'bg-muted dark:bg-muted text-muted-foreground dark:text-muted-foreground border-border dark:border-border';
    }
  };

  const getPaymentStatusIcon = (paymentStatus) => {
    switch (paymentStatus) {
      case 'paid': return <CheckCircle className="w-4 h-4" />;
      case 'unpaid': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getPaymentMethodDisplay = (paymentMethod) => {
    if (!paymentMethod) return '';
    return ` • ${paymentMethod.toUpperCase()}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (timeString) => {
   return timeString.split('T')[1].slice(0, 5);
  };

  // Appointment action handlers
  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailsModal(true);
  };
  
  // Handle viewing patient appointment history
  const handleViewHistory = (appointment) => {
    setSelectedAppointment(appointment);
    setShowHistoryModal(true);
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
      const res = await updateAppointmentStatus(appointmentId, newStatus);

      setSuccessDialog({
        isOpen: true,
        title: 'Status Updated',
        message: `Appointment status has been updated to ${newStatus}.`,
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

  const handlePaymentStatusChange = async (appointmentId, newPaymentStatus, paymentMethod = null, amount = null) => {
    try {
      // Update payment status in local state immediately for better UX
      setAppointments(prevAppointments => 
        prevAppointments.map(apt => 
          apt.id === appointmentId 
            ? { 
                ...apt, 
                paymentStatus: newPaymentStatus,
                ...(paymentMethod && { paymentMethod }),
                ...(amount && { amount })
              }
            : apt
        )
      );

      // Call API to update payment status with optional payment method and amount
      const res = await updateAppointmentPaymentStatus(appointmentId, newPaymentStatus, paymentMethod, amount);

      setSuccessDialog({
        isOpen: true,
        title: 'Payment Status Updated',
        message: paymentMethod && amount
          ? `Payment status has been updated to ${newPaymentStatus} via ${paymentMethod.toUpperCase()} for ₹${amount}.`
          : paymentMethod 
            ? `Payment status has been updated to ${newPaymentStatus} via ${paymentMethod.toUpperCase()}.`
            : `Payment status has been updated to ${newPaymentStatus}.`,
      });

    } catch (error) {
      console.error('Error updating payment status:', error);
      // Revert the local state change on error
      loadAppointments();
      
      setErrorDialog({
        isOpen: true,
        title: 'Payment Update Failed',
        message: 'Failed to update payment status',
        details: [error.message || 'Unknown error occurred'],
        errorType: 'api',
        statusCode: error.status || null,
        errorData: error.data || error
      });
    }
  };

  // Edit appointment handler :will be implemented in future based on requirements
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
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <AuthRefresh />
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
          <p className="text-muted-foreground dark:text-muted-foreground">
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
            <AppointmentDetailsProvider subdomain={subdomain}>
              <AppointmentCreationFlow 
                onSuccess={handleAppointmentCreated}
                onCancel={() => setShowCreateDialog(false)}
              />
            </AppointmentDetailsProvider>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-primary" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground dark:text-muted-foreground">Today's Appointments</p>
                <p className="text-2xl font-bold text-foreground">
                  {Array.isArray(appointments) ? 
                    appointments.filter(apt => {
                      const today = new Date().toISOString().split('T')[0];
                      return apt.appointmentDate === today;
                    }).length : 0
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-success" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground dark:text-muted-foreground">Total Patients</p>
                <p className="text-2xl font-bold text-foreground">{Array.isArray(appointments) ? appointments.length : 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-success" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground dark:text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-foreground">
                  {Array.isArray(appointments) ? appointments.filter(apt => apt.status === 'completed').length : 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-warning" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground dark:text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-foreground">
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
            {/* Search Filter */}
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground dark:text-muted-foreground" />
                <Input
                  placeholder="Search by patient name or mobile number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-10"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground dark:text-muted-foreground hover:text-foreground transition-colors"
                    type="button"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

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

            {/* Status-based Filters
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Tabs value={activeStatusFilter} onValueChange={setActiveStatusFilter}>
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="booked">Booked</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                  <TabsTrigger value="missed">Missed</TabsTrigger>
                  <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
                </TabsList>
              </Tabs>
            </div> */}

            {/* Payment Status Filter
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Payment Status</label>
              <Tabs value={activePaymentFilter} onValueChange={setActivePaymentFilter}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="paid">Paid</TabsTrigger>
                  <TabsTrigger value="unpaid">Unpaid</TabsTrigger>
                </TabsList>
              </Tabs>
            </div> */}

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
      <Card className="flex flex-col h-[60vh]">
        <CardHeader className="flex-shrink-0">
          <CardTitle>
            Appointments ({filteredAppointments.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-0">
          {isLoadingAppointments ? (
            <div className="flex justify-center items-center h-full">
              <Spinner size="xl" />
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-6">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground dark:text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground dark:text-muted-foreground mb-4">No appointments found</h3>
              <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Create First Appointment
              </Button>
            </div>
          ) : (
            <div className="h-full overflow-y-auto p-6">
              <div className="space-y-6 pr-2">
                {filteredAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="border border-border rounded-xl p-5 transition-all hover:bg-card-hover hover:shadow-md cursor-pointer bg-card"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-3">
                          <h3 className="text-lg font-semibold">
                            {appointment.patientName}
                          </h3>
                          <Badge className={`text-xs font-medium flex items-center gap-1 ${getStatusColor(appointment.status)}`}>
                            {getStatusIcon(appointment.status)}
                            {appointment.status.toUpperCase()}
                          </Badge>
                          <Badge className={`text-xs font-medium flex items-center gap-1 ${getPaymentStatusColor(appointment.paymentStatus || 'unpaid')}`}>
                            {getPaymentStatusIcon(appointment.paymentStatus || 'unpaid')}
                            {(appointment.paymentStatus || 'unpaid').toUpperCase()}{getPaymentMethodDisplay(appointment.paymentMethod)}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-y-2 gap-x-4 text-sm">
                          <div>
                            <span className="font-medium">Doctor:</span> Dr. {appointment.doctor?.name || appointment.doctorName}
                          </div>
                          <div>
                            <span className="font-medium">Date:</span> {formatDate(appointment.appointmentDate)}
                          </div>
                          <div>
                            <span className="font-medium">Time:</span> {formatTime(appointment.startTime)}
                          </div>
                          <div>
                            <span className="font-medium">Phone:</span> {appointment.mobile || appointment.patientMobile}
                          </div>

                          <div>
                            {appointment.documents && appointment.documents.length > 0 && (
                              <div className="text-sm">
                                <span className="font-medium flex items-center gap-1">
                                  <FileText className="h-3.5 w-3.5 text-accent" />
                                  Documents:
                                </span> {appointment.documents.length} file{appointment.documents.length !== 1 ? 's' : ''}
                              </div>
                            )}
                        </div>
                          
                        </div>
                      </div>
                      <div className="flex sm:flex-col gap-2 sm:items-end">
                        <Button
                          variant="outline"
                          size="sm"
                          className="whitespace-nowrap"
                          onClick={() => handleViewDetails(appointment)}
                        >
                          View Details
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="whitespace-nowrap"
                          onClick={() => handleViewHistory(appointment)}
                        >
                          View History
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
        onPaymentStatusChange={handlePaymentStatusChange}
        onEdit={handleEditAppointment}
        onCancel={handleCancelAppointment}
      />

      {/* Patient History Modal */}
      <PatientHistoryModal
        isOpen={showHistoryModal}
        onClose={() => {
          setShowHistoryModal(false);
          setSelectedAppointment(null);
        }}
        appointment={selectedAppointment}
        onViewDetails={(apt) => {
          // Keep history modal open when viewing details
          setSelectedAppointment(apt);
          setShowDetailsModal(true);
        }}
      />
    </div>
  );
}
