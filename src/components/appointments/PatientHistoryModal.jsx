'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { History, CheckCircle, XCircle, Clock, ExternalLink, FileText } from 'lucide-react';
import { fetchPatientHistoryUsingMobileNumber } from '@/lib/api/api';

export default function PatientHistoryModal({ 
  isOpen, 
  onClose, 
  appointment, 
  onViewDetails 
}) {
  const [patientHistory, setPatientHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [patientInfo, setPatientInfo] = useState(null);
  const [error, setError] = useState(null);
  
  // Fetch patient history when the modal opens
  useEffect(() => {
    if (isOpen && appointment) {
      loadPatientHistory();
    }
  }, [isOpen, appointment]);
  
  // Load patient history
  const loadPatientHistory = async () => {
    const mobileNumber = appointment?.mobile || appointment?.patientMobile;
    
    if (!mobileNumber) {
      setError("Cannot fetch patient history without a mobile number");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetchPatientHistoryUsingMobileNumber(mobileNumber);
      
      if (response && response.data) {
        // Format appointments before setting them in state
        const formattedAppointments = response.data.appointments.map(apt => formatAppointment(apt)) || [];
        setPatientHistory(formattedAppointments);
        
        // Extract and enhance patient info with status breakdown
        const patientInfoData = response.data.summary?.patientInfo || null;
        const statusBreakdown = response.data.summary?.statusBreakdown || {};
        
        if (patientInfoData) {
          setPatientInfo({
            ...patientInfoData,
            statusBreakdown
          });
        } else {
          setPatientInfo(null);
        }
      } else {
        setPatientHistory([]);
        setPatientInfo(null);
      }
    } catch (err) {
      console.error("Error fetching patient history:", err);
      setError(err.message || "Failed to load patient history");
      setPatientHistory([]);
      setPatientInfo(null);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper functions for formatting and styling
  const getStatusColor = (status) => {
    switch (status) {
      case 'booked': return 'bg-primary/10 text-primary border-primary/20';
      case 'completed': return 'bg-success/10 text-success border-success/20';
      case 'missed': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'cancelled': return 'bg-muted text-muted-foreground border-border';
      case 'confirmed': return 'bg-accent/10 text-accent border-accent/20';
      default: return 'bg-muted text-muted-foreground border-border';
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
      case 'paid': return 'bg-success/10 text-success border-success/20';
      case 'unpaid': return 'bg-warning/10 text-warning border-warning/20';
      default: return 'bg-muted text-muted-foreground border-border';
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
  
  const extractTimeFromISO = (isoString) => {
    return isoString.split('T')[1].slice(0, 5);
  };

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
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto bg-background dark:bg-background border-border dark:border-border transition-colors duration-300">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground dark:text-foreground transition-colors duration-300">
            Patient Appointment History:
            {patientInfo && (
              <div className="mt-1">
                <span className="block text-lg font-medium">
                  {patientInfo.patientName}
                </span>
                <span className="block text-sm text-muted-foreground dark:text-muted-foreground transition-colors duration-300">
                  {patientInfo.mobileNumber}
                </span>
              </div>
            )}
          </DialogTitle>
        </DialogHeader>
        
        {error && (
          <div className="bg-destructive/10 dark:bg-destructive/5 border border-destructive/20 dark:border-destructive/30 text-destructive dark:text-destructive px-4 py-3 rounded-md transition-colors duration-300">
            <p>{error}</p>
          </div>
        )}
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Spinner size="lg" />
          </div>
        ) : patientHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <History className="mx-auto h-12 w-12 text-muted-foreground dark:text-muted-foreground mb-4 transition-colors duration-300" />
            <h3 className="text-lg font-medium text-muted-foreground dark:text-muted-foreground transition-colors duration-300">No previous appointments found</h3>
            <p className="text-sm text-muted-foreground dark:text-muted-foreground mt-2 transition-colors duration-300">This patient has no appointment history</p>
          </div>
        ) : (
          <div className="space-y-6 my-4">
            <div className="flex flex-col gap-2 mb-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-foreground dark:text-foreground transition-colors duration-300">
                  All Appointments ({patientHistory.length})
                </h3>
              </div>
              {patientInfo && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.entries(patientInfo.statusBreakdown || {}).map(([status, count]) => (
                    <Badge key={status} className={`text-xs py-1.5 px-3 font-medium justify-center ${getStatusColor(status)} transition-colors duration-300`}>
                      {getStatusIcon(status)}
                      <span className="ml-1">{status.toUpperCase()}: {count}</span>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            
            {patientHistory.map((apt) => (
              <Card key={apt.id} className="overflow-hidden bg-card dark:bg-card border-border dark:border-border transition-colors duration-300">
                <CardContent className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-3">
                        <h4 className="text-md font-semibold">
                          {apt.patientName}
                        </h4>
                        <Badge className={`text-xs font-medium flex items-center gap-1 ${getStatusColor(apt.status)}`}>
                          {getStatusIcon(apt.status)}
                          {apt.status.toUpperCase()}
                        </Badge>
                        <Badge className={`text-xs font-medium flex items-center gap-1 ${getPaymentStatusColor(apt.paymentStatus || 'unpaid')}`}>
                          {getPaymentStatusIcon(apt.paymentStatus || 'unpaid')}
                          {(apt.paymentStatus || 'unpaid').toUpperCase()}{getPaymentMethodDisplay(apt.paymentMethod)}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-y-2 gap-x-4 text-sm">
                        <div>
                          <span className="font-medium">Doctor:</span> Dr. {apt.doctor?.name}
                        </div>
                        <div>
                          <span className="font-medium">Date:</span> {formatDate(apt.appointmentDate)}
                        </div>
                        <div>
                          <span className="font-medium">Time:</span> {apt.appointmentTime || formatTime(apt.startTime)}
                        </div>
                        <div>
                          <span className="font-medium">Phone:</span> {apt.mobile}
                        </div>
                        <div>
                          {apt.documents && apt.documents.length > 0 && (
                          <div className="text-sm">
                            <span className="font-medium flex items-center gap-1">
                              <FileText className="h-3.5 w-3.5 text-secondary" />
                              Documents:
                            </span> {apt.documents.length} file{apt.documents.length !== 1 ? 's' : ''}
                          </div>
                        )}
                        </div>
                      </div>
                      {/* {apt.doctor?.specialization && (
                        <div className="mt-2 text-sm">
                          <span className="font-medium">Specialization:</span> {apt.doctor.specialization}
                        </div>
                      )} */}
                    </div>
                    <div className="flex sm:flex-col gap-2 sm:items-end">
                      <Button
                        variant="outline"
                        size="sm"
                        className="whitespace-nowrap"
                        onClick={() => onViewDetails(apt)}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        <div className="flex justify-end mt-6">
          <Button onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
