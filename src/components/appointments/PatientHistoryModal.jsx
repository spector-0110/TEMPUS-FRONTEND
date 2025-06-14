'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { History, CheckCircle, XCircle, Clock, ExternalLink, FileText } from 'lucide-react';
import { fetchPatientHistoryUsingMobileNumber } from '@/lib/api';

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
      case 'booked': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'missed': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      case 'confirmed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
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
      case 'paid': return 'bg-emerald-100 text-emerald-800';
      case 'unpaid': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
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
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Patient Appointment History:
            {patientInfo && (
              <div className="mt-1">
                <span className="block text-lg font-medium">
                  {patientInfo.patientName}
                </span>
                <span className="block text-sm text-muted-foreground">
                  {patientInfo.mobileNumber}
                </span>
              </div>
            )}
          </DialogTitle>
        </DialogHeader>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            <p>{error}</p>
          </div>
        )}
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Spinner size="lg" />
          </div>
        ) : patientHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <History className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-500">No previous appointments found</h3>
            <p className="text-sm text-gray-500 mt-2">This patient has no appointment history</p>
          </div>
        ) : (
          <div className="space-y-6 my-4">
            <div className="flex flex-col gap-2 mb-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">
                  All Appointments ({patientHistory.length})
                </h3>
              </div>
              {patientInfo && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.entries(patientInfo.statusBreakdown || {}).map(([status, count]) => (
                    <Badge key={status} className={`text-xs py-1.5 px-3 font-medium justify-center ${getStatusColor(status)}`}>
                      {getStatusIcon(status)}
                      <span className="ml-1">{status.toUpperCase()}: {count}</span>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            
            {patientHistory.map((apt) => (
              <Card key={apt.id} className="overflow-hidden">
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
                              <FileText className="h-3.5 w-3.5 text-purple-600" />
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
