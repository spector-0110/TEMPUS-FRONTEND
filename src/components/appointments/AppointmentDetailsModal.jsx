'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Calendar, Clock, User, Phone, Mail, MapPin, Stethoscope, AlertCircle, CheckCircle, XCircle, CreditCard, Smartphone, IndianRupee } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";

const statusConfig = {
  booked: { 
    label: "Booked", 
    variant: "default", 
    icon: Calendar,
    color: "text-blue-600 bg-blue-50 border-blue-200"
  },
  completed: { 
    label: "Completed", 
    variant: "secondary", 
    icon: CheckCircle,
    color: "text-emerald-600 bg-emerald-50 border-emerald-200"
  },
  cancelled: { 
    label: "Cancelled", 
    variant: "destructive", 
    icon: XCircle,
    color: "text-red-600 bg-red-50 border-red-200"
  },
  missed: { 
    label: "Missed", 
    variant: "destructive", 
    icon: AlertCircle,
    color: "text-orange-600 bg-orange-50 border-orange-200"
  }
};

const paymentStatusConfig = {
  paid: {
    label: "Paid",
    variant: "secondary",
    icon: CheckCircle,
    color: "text-green-600 bg-green-50 border-green-200"
  },
  unpaid: {
    label: "Unpaid",
    variant: "outline",
    icon: CreditCard,
    color: "text-gray-600 bg-gray-50 border-gray-200"
  }
};

const paymentMethodConfig = {
  cash: {
    label: "Cash",
    icon: IndianRupee,
    color: "text-green-600"
  },
  upi: {
    label: "UPI",
    icon: Smartphone,
    color: "text-blue-600"
  },
  card: {
    label: "Card",
    icon: CreditCard,
    color: "text-purple-600"
  }
};

export default function AppointmentDetailsModal({ appointment, isOpen, onClose, onStatusChange, onEdit, onCancel, onPaymentStatusChange }) {
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isUpdatingPayment, setIsUpdatingPayment] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [showPaymentMethodSelector, setShowPaymentMethodSelector] = useState(false);
  const [confirmationDialog, setConfirmationDialog] = useState({
    isOpen: false,
    type: '', // 'status' or 'payment'
    newValue: '',
    title: '',
    description: ''
  });

  if (!appointment) return null;

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
    
    const paymentMethodInfo = paymentMethodConfig[selectedPaymentMethod];
    setShowPaymentMethodSelector(false);
    setConfirmationDialog({
      isOpen: true,
      type: 'payment',
      newValue: 'paid',
      paymentMethod: selectedPaymentMethod,
      title: `Confirm Payment`,
      description: `Are you sure you want to mark this appointment as paid via ${paymentMethodInfo.label}? This action will update the payment status and method.`
    });
  };

  const handleCancelPaymentMethod = () => {
    setShowPaymentMethodSelector(false);
    setSelectedPaymentMethod('');
  };

  const handleConfirmUpdate = async () => {
    const { type, newValue, paymentMethod } = confirmationDialog;
    
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
          await onPaymentStatusChange(appointment.id, newValue, paymentMethod);
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
    return format(new Date(date), "h:mm a");
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-blue-600" />
            Appointment Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Badge variant={statusInfo.variant} className={statusInfo.color}>
                  {statusInfo.label}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={paymentInfo.variant} className={paymentInfo.color}>
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
                  <Calendar className="h-5 w-5 text-blue-600" />
                  Date & Time
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">{formatAppointmentDate(appointment.appointmentDate)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>{formatAppointmentTime(appointment.appointmentDate)}</span>
                </div>
                {appointment.duration && (
                  <div className="text-sm text-gray-600">
                    Duration: {appointment.duration} minutes
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Doctor Information */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Stethoscope className="h-5 w-5 text-green-600" />
                  Doctor
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Dr. {appointment.doctor?.name}</span>
                </div>
                <div className="text-sm text-gray-600">
                  {appointment.doctor?.specialization}
                </div>
                {appointment.doctor?.department && (
                  <div className="text-sm text-gray-600">
                    {appointment.doctor.department}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Patient Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-purple-600" />
                Patient Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">{appointment.patient?.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span>{appointment.patient?.mobile}</span>
                </div>
                {appointment.patient?.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span>{appointment.patient.email}</span>
                  </div>
                )}
              </div>
              <div className="space-y-3">
                {appointment.patient?.age && (
                  <div className="text-sm">
                    <span className="text-gray-500">Age:</span> {appointment.patient.age} years
                  </div>
                )}
                {appointment.patient?.gender && (
                  <div className="text-sm">
                    <span className="text-gray-500">Gender:</span> {appointment.patient.gender}
                  </div>
                )}
                {appointment.patient?.address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
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
                    <span className="text-sm font-medium text-gray-700">Reason for Visit:</span>
                    <p className="text-sm text-gray-600 mt-1">{appointment.reason}</p>
                  </div>
                )}
                {appointment.notes && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Notes:</span>
                    <p className="text-sm text-gray-600 mt-1">{appointment.notes}</p>
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
                    <Calendar className="h-5 w-5 text-blue-600" />
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
                          className="flex items-center gap-2 hover:bg-neutral-900 hover:shadow-md cursor-pointer transition-colors"
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
                    <IndianRupee className="h-5 w-5 text-green-600" />
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
                          className="flex items-center gap-2 hover:bg-neutral-900 hover:shadow-md cursor-pointer transition-colors"
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
              <IndianRupee className="h-5 w-5 text-green-600" />
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
            
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={handleCancelPaymentMethod}>
                Cancel
              </Button>
              <Button 
                onClick={handlePaymentMethodConfirm}
                disabled={!selectedPaymentMethod}
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
