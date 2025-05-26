'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, User, Phone, Mail, MapPin, Stethoscope, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";

const statusConfig = {
  scheduled: { 
    label: "Scheduled", 
    variant: "default", 
    icon: Calendar,
    color: "text-blue-600 bg-blue-50 border-blue-200"
  },
  confirmed: { 
    label: "Confirmed", 
    variant: "secondary", 
    icon: CheckCircle,
    color: "text-green-600 bg-green-50 border-green-200"
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

export default function AppointmentDetailsModal({ appointment, isOpen, onClose, onStatusChange, onEdit, onCancel }) {
  if (!appointment) return null;

  const statusInfo = statusConfig[appointment.status] || statusConfig.scheduled;
  const StatusIcon = statusInfo.icon;

  const handleStatusUpdate = (newStatus) => {
    if (onStatusChange) {
      onStatusChange(appointment.id, newStatus);
    }
  };

  const formatAppointmentDate = (date) => {
    return format(new Date(date), "EEEE, MMMM d, yyyy");
  };

  const formatAppointmentTime = (date) => {
    return format(new Date(date), "h:mm a");
  };

  const canUpdateStatus = (currentStatus) => {
    const allowedTransitions = {
      scheduled: ['confirmed', 'cancelled'],
      confirmed: ['completed', 'cancelled', 'missed'],
      completed: [],
      cancelled: ['scheduled'],
      missed: ['scheduled']
    };
    return allowedTransitions[currentStatus] || [];
  };

  const allowedStatuses = canUpdateStatus(appointment.status);

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
            <div className="flex items-center gap-2">
              <StatusIcon className="h-5 w-5" />
              <Badge variant={statusInfo.variant} className={statusInfo.color}>
                {statusInfo.label}
              </Badge>
            </div>
            <div className="flex gap-2">
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
            </div>
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
          {allowedStatuses.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Update Status</CardTitle>
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
                        className="flex items-center gap-2"
                      >
                        <StatusIcon className="h-4 w-4" />
                        Mark as {config.label}
                      </Button>
                    );
                  })}
                </div>
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
    </Dialog>
  );
}
