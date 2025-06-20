'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Calendar, Clock, User, Phone, Mail, MapPin, Stethoscope, AlertCircle, CheckCircle, XCircle, CreditCard, Smartphone, IndianRupee, FileText, Download } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";

const statusConfig = {
  booked: { 
    label: "Booked", 
    variant: "default", 
    icon: Calendar,
    color: "text-primary bg-primary/10 border-primary/20"
  },
  completed: { 
    label: "Completed", 
    variant: "secondary", 
    icon: CheckCircle,
    color: "text-success bg-success/10 border-success/20"
  },
  cancelled: { 
    label: "Cancelled", 
    variant: "destructive", 
    icon: XCircle,
    color: "text-destructive bg-destructive/10 border-destructive/20"
  },
  missed: { 
    label: "Missed", 
    variant: "destructive", 
    icon: AlertCircle,
    color: "text-warning bg-warning/10 border-warning/20"
  }
};

const paymentStatusConfig = {
  paid: {
    label: "Paid",
    variant: "secondary",
    icon: CheckCircle,
    color: "text-success bg-success/10 border-success/20"
  },
  unpaid: {
    label: "Unpaid",
    variant: "outline",
    icon: CreditCard,
    color: "text-muted-foreground bg-muted/50 border-border"
  }
};

const paymentMethodConfig = {
  cash: {
    label: "Cash",
    icon: IndianRupee,
    color: "text-success"
  },
  upi: {
    label: "UPI",
    icon: Smartphone,
    color: "text-primary"
  },
  card: {
    label: "Card",
    icon: CreditCard,
    color: "text-accent"
  }
};

export default function AppointmentDetailsModal({ appointment, isOpen, onClose, onStatusChange, onEdit, onCancel, onPaymentStatusChange }) {
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isUpdatingPayment, setIsUpdatingPayment] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [showPaymentMethodSelector, setShowPaymentMethodSelector] = useState(false);
  const [confirmationDialog, setConfirmationDialog] = useState({
    isOpen: false,
    type: '', // 'status' or 'payment'
    newValue: '',
    title: '',
    description: ''
  });
  const [downloadingFiles, setDownloadingFiles] = useState({});

  if (!appointment) return null;

  // Function to download file to local device

  const downloadFile = async (url, fileName) => {
    try {
      // Track this specific file download
      setDownloadingFiles(prev => ({ ...prev, [fileName]: true }));
      
      // Fetch the file
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to download file');
      }
      
      // Get the blob from the response
      const blob = await response.blob();
      
      // Determine MIME type for PDF or images
      const fileExtension = fileName.split('.').pop()?.toLowerCase();
      let mimeType;
      
      switch (fileExtension) {
        case 'pdf':
          mimeType = 'application/pdf';
          break;
        case 'jpg':
        case 'jpeg':
          mimeType = 'image/jpeg';
          break;
        case 'png':
          mimeType = 'image/png';
          break;
        case 'gif':
          mimeType = 'image/gif';
          break;
        case 'webp':
          mimeType = 'image/webp';
          break;
        default:
          // Use the blob's type or default to octet-stream
          mimeType = blob.type || 'application/octet-stream';
      }
      
      // Create a blob with the correct MIME type
      const typedBlob = new Blob([blob], { type: mimeType });
      
      // Create a URL for the blob
      const blobUrl = window.URL.createObjectURL(typedBlob);
      
      // Create a temporary anchor element
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName; // Set the file name
      
      // Append to the document
      document.body.appendChild(link);
      
      // Programmatically click the link to trigger download
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      
      // Mark download as complete for this file
      setDownloadingFiles(prev => ({ ...prev, [fileName]: false }));
    } catch (error) {
      console.error('Error downloading file:', error);
      setDownloadingFiles(prev => ({ ...prev, [fileName]: false }));
      alert(`Failed to download ${fileName}. Please try again.`);
    }
  };

  const statusInfo = statusConfig[appointment.status?.toLowerCase()];
  const StatusIcon = statusInfo.icon;
  const paymentInfo = paymentStatusConfig[appointment.paymentStatus?.toLowerCase()];
  const PaymentIcon = paymentInfo.icon;

  const handleStatusUpdate = async (newStatus) => {
    if (!onStatusChange) return;
    
    const statusInfo = statusConfig[newStatus];
    setConfirmationDialog({
      isOpen: true,
      type: 'status',
      newValue: newStatus,
      title: `Confirm Status Update`,
      description: `Are you sure you want to mark this appointment as "${statusInfo.label}"? This action will update the appointment status.`
    });
  };

  const handlePaymentStatusUpdate = async (newPaymentStatus) => {
    if (!onPaymentStatusChange) return;
    
    if (newPaymentStatus === 'paid') {
      // Show payment method selector for 'paid' status
      setShowPaymentMethodSelector(true);
      setSelectedPaymentMethod('');
      return;
    }
    
    const paymentInfo = paymentStatusConfig[newPaymentStatus];
    setConfirmationDialog({
      isOpen: true,
      type: 'payment',
      newValue: newPaymentStatus,
      title: `Confirm Payment Status Update`,
      description: `Are you sure you want to mark this appointment payment as "${paymentInfo.label}"? This action will update the payment status.`
    });
  };

  const handlePaymentMethodConfirm = () => {
    if (!selectedPaymentMethod) return;
    
    // Validate payment amount is a positive integer
    const amount = parseInt(paymentAmount, 10);
    if (!amount || amount <= 0 || isNaN(amount)) {
      alert("Please enter a valid positive amount");
      return;
    }
    
    const paymentMethodInfo = paymentMethodConfig[selectedPaymentMethod];
    setShowPaymentMethodSelector(false);
    setConfirmationDialog({
      isOpen: true,
      type: 'payment',
      newValue: 'paid',
      paymentMethod: selectedPaymentMethod,
      amount: amount,
      title: `Confirm Payment`,
      description: `Are you sure you want to mark this appointment as paid ₹${amount} via ${paymentMethodInfo.label}? This action will update the payment status and method.`
    });
  };

  const handleCancelPaymentMethod = () => {
    setShowPaymentMethodSelector(false);
    setSelectedPaymentMethod('');
    setPaymentAmount('');
  };

  const handleConfirmUpdate = async () => {
    const { type, newValue, paymentMethod, amount } = confirmationDialog;
    
    setConfirmationDialog(prev => ({ ...prev, isOpen: false }));
    
    if (type === 'status') {
      setIsUpdatingStatus(true);
      try {
        await onStatusChange(appointment.id, newValue);
        // Close the appointment details modal after successful update
        onClose();
      } finally {
        setIsUpdatingStatus(false);
      }
    } else if (type === 'payment') {
      setIsUpdatingPayment(true);
      try {
        // Pass payment method along with status when marking as paid
        if (newValue === 'paid' && paymentMethod) {
          await onPaymentStatusChange(appointment.id, newValue, paymentMethod, amount);
        } else {
          await onPaymentStatusChange(appointment.id, newValue);
        }
        // Close the appointment details modal after successful update
        onClose();
      } finally {
        setIsUpdatingPayment(false);
      }
    }
  };

  const handleCancelConfirmation = () => {
    setConfirmationDialog({
      isOpen: false,
      type: '',
      newValue: '',
      paymentMethod: '',
      title: '',
      description: ''
    });
  };

  const formatAppointmentDate = (date) => {
    return format(new Date(date), "EEEE, MMMM d, yyyy");
  };

  const formatAppointmentTime = (date) => {
    return date.split('T')[1].slice(0, 5); // Extract time part from ISO string
  };
  
  const formatCreationDate = (dateString) => {
      const monthMap = {
      '01': 'Jan',
      '02': 'Feb',
      '03': 'Mar',
      '04': 'Apr',
      '05': 'May',
      '06': 'Jun',
      '07': 'Jul',
      '08': 'Aug',
      '09': 'Sep',
      '10': 'Oct',
      '11': 'Nov',
      '12': 'Dec',
    };

    const [datePart, timePart] = dateString.split('T');
    const [year, month, day] = datePart.split('-');
    const [hour, minute] = timePart.split(':');

    const formattedDate = `${day}-${monthMap[month]}-${year} ${hour}:${minute}`;
    return formattedDate;
  };

  const canUpdateStatus = (currentStatus) => {
    const allowedTransitions = {
      booked: ['completed', 'cancelled','missed'],
      completed: [],
      cancelled: [],
      missed: ['completed', 'cancelled'],
    };
    return allowedTransitions[currentStatus] || [];
  };

  const canUpdatePaymentStatus = (currentPaymentStatus, appointmentStatus) => {
    // Don't allow payment updates for cancelled or missed appointments
    if (appointmentStatus === 'cancelled') {
      return [];
    }
    
    const currentStatus = currentPaymentStatus?.toLowerCase();
    const allowedTransitions = {
      unpaid: ['paid'], // for those coming rom website::
    };
    return allowedTransitions[currentStatus] || [];
  };

  const allowedStatuses = canUpdateStatus(appointment.status);
  const allowedPaymentStatuses = canUpdatePaymentStatus(appointment.paymentStatus, appointment.status);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-background dark:bg-background border-border dark:border-border transition-colors duration-300">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-foreground dark:text-foreground transition-colors duration-300">
            <Calendar className="h-5 w-5 text-primary dark:text-primary" />
            Appointment Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Badge variant={statusInfo.variant} className={`${statusInfo.color} transition-colors duration-300`}>
                  {statusInfo.label}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={paymentInfo.variant} className={`${paymentInfo.color} transition-colors duration-300`}>
                  {paymentInfo.label}
                </Badge>
              </div>
            </div>
            {/* <div className="flex gap-2">
              {appointment.status !== 'completed' && appointment.status !== 'cancelled' && (
                <>
                  {onEdit && (
                    <Button variant="outline" size="sm" onClick={() => onEdit(appointment)}>
                      Edit
                    </Button>
                  )}
                  {onCancel && appointment.status !== 'cancelled' && (
                    <Button variant="destructive" size="sm" onClick={() => onCancel(appointment.id)}>
                      Cancel
                    </Button>
                  )}
                </>
              )}
            </div> */}
          </div>

          <Separator />

          {/* Appointment Information */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Date & Time */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Date & Time
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{formatAppointmentDate(appointment.appointmentDate)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{formatAppointmentTime(appointment.startTime)}</span>
                </div>
                {appointment.endTime && (
                  <div className="text-sm text-muted-foreground">
                    Duration: {Math.round((new Date(appointment.endTime) - new Date(appointment.startTime)) / (1000 * 60))} minutes
                  </div>
                )}
                {appointment.createdAt && (
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      Created on: {formatCreationDate(appointment.createdAt)}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Doctor Information */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Stethoscope className="h-5 w-5 text-success" />
                  Doctor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  {/* Doctor Photo on the left */}
                  <div className="flex-shrink-0">
                    {appointment.doctor?.photo ? (
                      <img 
                        src={appointment.doctor.photo} 
                        alt={`Dr. ${appointment.doctor.name}`}
                        className="w-16 h-16 rounded-xl object-cover border border-border"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                        <User className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  {/* Doctor Details on the right */}
                  <div className="flex-grow space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Dr. {appointment.doctor?.name}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {appointment.doctor?.specialization}
                    </div>
                    {appointment.doctor?.department && (
                      <div className="text-sm text-muted-foreground">
                        {appointment.doctor.department}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Patient Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Patient Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{appointment.patient?.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{appointment.patient?.mobile}</span>
                </div>
                {appointment.patient?.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{appointment.patient.email}</span>
                  </div>
                )}
              </div>
              <div className="space-y-3">
                {appointment.patient?.age && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Age:</span> {appointment.patient.age} years
                  </div>
                )}
                {appointment.patient?.gender && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Gender:</span> {appointment.patient.gender}
                  </div>
                )}
                {appointment.patient?.address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span className="text-sm">{appointment.patient.address}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          {(appointment.reason || appointment.notes) && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Additional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {appointment.reason && (
                  <div>
                    <span className="text-sm font-medium text-foreground">Reason for Visit:</span>
                    <p className="text-sm text-muted-foreground mt-1">{appointment.reason}</p>
                  </div>
                )}
                {appointment.notes && (
                  <div>
                    <span className="text-sm font-medium text-foreground">Notes:</span>
                    <p className="text-sm text-muted-foreground mt-1">{appointment.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          {/* Status Update Actions */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Appointment Status Updates */}
            {allowedStatuses.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Update Appointment Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {allowedStatuses.map((status) => {
                      const config = statusConfig[status];
                      const StatusIcon = config.icon;
                      return (
                        <Button
                          key={status}
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusUpdate(status)}
                          disabled={isUpdatingStatus || isUpdatingPayment}
                          className="flex items-center gap-2 hover:bg-card-hover hover:shadow-md cursor-pointer transition-colors"
                        >
                          <StatusIcon className="h-4 w-4" />
                          Mark as {config.label}
                        </Button>
                      );
                    })}
                  </div>
                  {isUpdatingStatus && (
                    <p className="text-sm text-muted-foreground mt-2">Updating appointment status...</p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Payment Status Updates */}
            {allowedPaymentStatuses.length > 0 && onPaymentStatusChange && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <IndianRupee className="h-5 w-5 text-success" />
                    Update Payment Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {allowedPaymentStatuses.map((paymentStatus) => {
                      const config = paymentStatusConfig[paymentStatus];
                      const PaymentIcon = config.icon;
                      return (
                        <Button
                          key={paymentStatus}
                          variant="outline"
                          size="sm"
                          onClick={() => handlePaymentStatusUpdate(paymentStatus)}
                          disabled={isUpdatingPayment || isUpdatingStatus}
                          className="flex items-center gap-2 hover:bg-card-hover hover:shadow-md cursor-pointer transition-colors"
                        >
                          <PaymentIcon className="h-4 w-4" />
                          Mark as {config.label}
                        </Button>
                      );
                    })}
                  </div>
                  {isUpdatingPayment && (
                    <p className="text-sm text-muted-foreground mt-2">Updating payment status...</p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Show message when no updates are available */}
          {allowedStatuses.length === 0 && allowedPaymentStatuses.length === 0 && (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">No status updates available for this appointment.</p>
              </CardContent>
            </Card>
          )}
        </div>


        {/* Documents Section */}
          {appointment.documents && appointment.documents.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-accent" />
                  Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {appointment.documents.map((doc, index) => {
                    const fileName = doc.split('/').pop();
                    const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName);
                    const isPdf = /\.pdf$/i.test(fileName);
                    
                    return (
                      <div key={index} className="flex items-center justify-between border rounded-md p-3 hover:bg-muted transition-colors">
                        <div className="flex items-center gap-3">
                          {isImage ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-info">
                              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                              <circle cx="8.5" cy="8.5" r="1.5"></circle>
                              <polyline points="21 15 16 10 5 21"></polyline>
                            </svg>
                          ) : isPdf ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-destructive">
                              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                              <polyline points="14 2 14 8 20 8"></polyline>
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                              <polyline points="14 2 14 8 20 8"></polyline>
                            </svg>
                          )}
                          <span className="text-sm truncate max-w-[150px]">{fileName}</span>
                        </div>
                        <button 
                          onClick={() => downloadFile(doc, fileName)}
                          disabled={downloadingFiles[fileName]}
                          className="flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-md px-2 py-1 transition-colors disabled:opacity-50"
                        >
                          {downloadingFiles[fileName] ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Downloading...
                            </>
                          ) : (
                            <>
                              <Download className="h-3 w-3" />
                              Download
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={confirmationDialog.isOpen}
        onClose={handleCancelConfirmation}
        onConfirm={handleConfirmUpdate}
        title={confirmationDialog.title}
        description={confirmationDialog.description}
        confirmText="Yes, Update"
        cancelText="Cancel"
        variant={confirmationDialog.type === 'status' && 
          (confirmationDialog.newValue === 'cancelled' || confirmationDialog.newValue === 'missed') 
          ? 'destructive' : 'default'}
        isLoading={isUpdatingStatus || isUpdatingPayment}
      />

      {/* Payment Method Selection Dialog */}
      <Dialog open={showPaymentMethodSelector} onOpenChange={setShowPaymentMethodSelector}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <IndianRupee className="h-5 w-5 text-success" />
              Select Payment Method
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Choose the payment method used for this appointment:
            </p>
            
            <Select value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(paymentMethodConfig).map(([key, config]) => {
                  const Icon = config.icon;
                  return (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2 ">
                        <Icon className={`h-4 w-4 ${config.color} cursor-pointer` } />
                        {config.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            
            <div className="space-y-2">
              <label htmlFor="paymentAmount" className="text-sm font-medium">
                Payment Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2">
                  <IndianRupee className="h-4 w-4 text-muted-foreground" />
                </span>
                <input
                  id="paymentAmount"
                  type="number"
                  min="1"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-9 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Enter amount"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={handleCancelPaymentMethod}>
                Cancel
              </Button>
              <Button 
                onClick={handlePaymentMethodConfirm}
                disabled={!selectedPaymentMethod || !paymentAmount || parseInt(paymentAmount, 10) <= 0}
                className="gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                Mark as Paid
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
