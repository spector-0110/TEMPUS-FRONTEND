'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MoreVertical,
  Edit,
  Trash2,
  Phone,
  Calendar,
  CreditCard,
  Eye,
  MapPin,
  Mail,
  Clock,
  TrendingUp,
  Badge as BadgeIcon,
  IndianRupee,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Coffee
} from 'lucide-react';
import { getDisplayName ,STAFF_CONSTANTS} from '@/lib/api/staffAPI';
import { useStaff } from '@/context/StaffContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { StaffPaymentsManager } from './StaffPaymentsManager';
import { StaffAttendanceCalendar } from './StaffAttendanceCalendar';


export function StaffCard({ staff, onEdit, onDelete, onMarkAttendance, viewMode }) {
  const isMobile = useIsMobile();
  const [showDetails, setShowDetails] = useState(false);
  const { fetchStaffPayments, fetchStaffAttendance } = useStaff();
  
  const getAttendanceStatus = (attendance) => {
    if (!attendance) return { color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200', label: 'Not Marked' };
    
    switch(attendance.status) {
      case 'present':
        return { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', label: 'Present' };
      case 'absent':
        return { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', label: 'Absent' };
      case 'paid_leave':
        return { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', label: 'Paid Leave' };
      case 'half_day':
        return { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', label: 'Half Day' };
      case 'week_holiday':
        return { color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200', label: 'Holiday' };
      default:
        return { color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200', label: 'Not Marked' };
    }
  };

  const getAttendanceIcon = (status) => {
    switch(status) {
      case 'present':
        return <CheckCircle2 className="w-3 h-3" />;
      case 'absent':
        return <XCircle className="w-3 h-3" />;
      case 'half_day':
        return <Coffee className="w-3 h-3" />;
      default:
        return <AlertCircle className="w-3 h-3" />;
    }
  };
  
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };
  
  const getStatusColor = (isActive) => {
    return isActive 
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  };
  
  const handleViewDetails = () => {
    setShowDetails(true);
    fetchStaffPayments(staff.id);
    fetchStaffAttendance(staff.id);
  };
  
  const ImageComponent = ({ size = 'sm', priority = false }) => {
  const [imageError, setImageError] = useState(false);
  const dimensions = size === 'sm' ? 'w-12 h-12' : 'w-24 h-24';
  const imgSize = size === 'sm' ? 48 : 96;

  return (
    <div
      className={`relative ${dimensions} shrink-0 rounded-full overflow-hidden ring-2 ring-background group-hover:ring-primary/20 transition-all`}
    >
      {staff.photoUrl && !imageError ? (
        <img
          src={staff.photoUrl}
          alt={staff.name}
          className="h-full w-full object-cover"
          width={imgSize}
          height={imgSize}
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="w-full h-full bg-primary/10 text-primary font-semibold flex items-center justify-center">
          <span className={size === 'sm' ? 'text-sm' : 'text-2xl'}>
            {getInitials(staff.name)}
          </span>
        </div>
      )}
    </div>
  );
};

  const renderAttendanceButtons = () => (
    <div className="flex gap-2 mt-4">
      <Button
        size="sm"
        variant="outline"
        className="flex-1 text-green-600 hover:text-green-700 hover:bg-green-50"
        onClick={() => onMarkAttendance(staff, 'present')}
      >
        <CheckCircle2 className="w-4 h-4 mr-1" />
        Present
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
        onClick={() => onMarkAttendance(staff, 'absent')}
      >
        <XCircle className="w-4 h-4 mr-1" />
        Absent
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="flex-1 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
        onClick={() => onMarkAttendance(staff, 'half_day')}
      >
        <Clock className="w-4 h-4 mr-1" />
        Half Day
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="flex-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
        onClick={() => onMarkAttendance(staff, 'leave')}
      >
        <Coffee className="w-4 h-4 mr-1" />
        Leave
      </Button>
    </div>
  );

  return (
    <>
      <Card 
        className="transition-all duration-200 group"
        onClick={handleViewDetails}
        variant="interactive"
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-4">

            <div className="flex items-center justify-between flex-1">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <ImageComponent size="sm" />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                      {staff.name}
                    </h3>
                    <Badge 
                      variant="secondary"
                      className={getStatusColor(staff.isActive)}
                    >
                      {staff.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <BadgeIcon className="w-3 h-3" />
                      <span className="font-medium">{getDisplayName.role(staff.staffRole)}</span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        <span>{staff.mobileNumber}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>Age {staff.age}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Attendance Section */}
            <div className="flex flex-col items-center justify-center gap-2">              <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-semibold text-lg
                ${staff.todayAttendance?.status === 'present' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
                  staff.todayAttendance?.status === 'absent' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                  staff.todayAttendance?.status === 'half_day' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                  staff.todayAttendance?.status === 'paid_leave' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                  staff.todayAttendance?.status === 'week_holiday' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                  'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'}`}
              >
                {staff.todayAttendance?.status === 'present' ? 'P' :
                 staff.todayAttendance?.status === 'absent' ? 'A' :
                 staff.todayAttendance?.status === 'half_day' ? 'H' :
                 staff.todayAttendance?.status === 'paid_leave' ? 'L' :
                 staff.todayAttendance?.status === 'week_holiday' ? 'H' : 
                 'N/A' }
              </div>
              
              <div className="flex gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarkAttendance?.(staff.id, 'present');
                  }}
                  className="w-6 h-6 rounded flex items-center justify-center text-xs font-medium hover:bg-green-100 hover:text-green-800 dark:hover:bg-green-900 dark:hover:text-green-200 transition-colors"
                  title="Mark Present"
                >
                  P
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarkAttendance?.(staff.id, 'absent');
                  }}
                  className="w-6 h-6 rounded flex items-center justify-center text-xs font-medium hover:bg-red-100 hover:text-red-800 dark:hover:bg-red-900 dark:hover:text-red-200 transition-colors"
                  title="Mark Absent"
                >
                  A
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarkAttendance?.(staff.id, 'half_day');
                  }}
                  className="w-6 h-6 rounded flex items-center justify-center text-xs font-medium hover:bg-yellow-100 hover:text-yellow-800 dark:hover:bg-yellow-900 dark:hover:text-yellow-200 transition-colors"
                  title="Mark Half Day"
                >
                  H
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarkAttendance?.(staff.id, 'paid_leave');
                  }}
                  className="w-6 h-6 rounded flex items-center justify-center text-xs font-medium hover:bg-blue-100 hover:text-blue-800 dark:hover:bg-blue-900 dark:hover:text-blue-200 transition-colors"
                  title="Mark as Paid Leave"
                >
                  L
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarkAttendance?.(staff.id, 'week_holiday');
                  }}
                  className="w-6 h-6 rounded flex items-center justify-center text-xs font-medium hover:bg-purple-100 hover:text-purple-800 dark:hover:bg-purple-900 dark:hover:text-purple-200 transition-colors"
                  title="Mark as Holiday"
                >
                  W
                </button>
              </div>
            </div>
              
              {/* <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleViewDetails}>
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit(staff)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Staff
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => onDelete(staff)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Staff
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu> */}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Staff Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className={`${isMobile ? 'w-[95vw] max-w-none h-[95vh]' : 'max-w-4xl max-h-[90vh]'} overflow-hidden p-4 md:p-6`}>
          <DialogHeader className="pb-2 md:pb-4">
            <div className="flex items-start justify-between md:items-center gap-3 md:gap-4">
              <div className="flex items-start md:items-center gap-3 md:gap-4">
                <ImageComponent size="lg" priority />
                <div className="flex-1 min-w-0">
                  <DialogTitle className="text-lg md:text-xl mb-1">{staff.name}</DialogTitle>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <BadgeIcon className="w-3 h-3" />
                      {getDisplayName.role(staff.staffRole)}
                    </div>
                    <Badge 
                      variant="secondary"
                      className={`${getStatusColor(staff.isActive)}`}
                    >
                      {staff.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowDetails(false);
                    onEdit(staff);
                  }}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => {
                    setShowDetails(false);
                    onDelete(staff);
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </DialogHeader>
          
          <Tabs defaultValue="info" className="flex-1 overflow-hidden mt-2">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="info">Information</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
              <TabsTrigger value="attendance">Attendance</TabsTrigger>
            </TabsList>
            
            <TabsContent value="info" className="mt-2 space-y-2 overflow-auto h-[calc(90vh-12rem)] md:h-[60vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {/* Personal Information */}
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-2.5">
                    <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wide mb-2">
                      Personal Information
                    </h3>
                    <div className="grid gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Calendar className="w-3.5 h-3.5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-muted-foreground text-xs">Age</span>
                          <p className="font-medium text-sm truncate">{staff.age} years</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Phone className="w-3.5 h-3.5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-muted-foreground text-xs">Mobile</span>
                          <p className="font-medium text-sm truncate">{staff.mobileNumber}</p>
                        </div>
                      </div>
                      {staff.aadhaarCard && (
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                            <CreditCard className="w-3.5 h-3.5 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-muted-foreground text-xs">Aadhaar</span>
                            <p className="font-medium text-sm truncate">
                              {staff.aadhaarCard.replace(/(.{4})/g, '$1 ').trim()}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                {/* Employment Information */}
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-2.5">
                    <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wide mb-2">
                      Employment Details
                    </h3>
                    <div className="grid gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                          <BadgeIcon className="w-3.5 h-3.5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-muted-foreground text-xs">Role</span>
                          <p className="font-medium text-sm truncate">{getDisplayName.role(staff.staffRole)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                          <IndianRupee className="w-3.5 h-3.5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-muted-foreground text-xs">Salary</span>
                          <p className="font-medium text-sm truncate">
                            ₹{staff.salaryAmount?.toLocaleString()} / {getDisplayName.salaryType(staff.salaryType)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Clock className="w-3.5 h-3.5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-muted-foreground text-xs">Pay Cycle</span>
                          <p className="font-medium text-sm truncate">Every {staff.salaryCreditCycle} days</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* System Information */}
              {(staff.createdAt || staff.updatedAt) && (
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-2.5">
                    <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wide mb-2">
                      System Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {staff.createdAt && (
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                            <TrendingUp className="w-3.5 h-3.5 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-muted-foreground text-xs">Created</span>
                            <p className="font-medium text-sm truncate">{new Date(staff.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      )}
                      {staff.updatedAt && (
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Clock className="w-3.5 h-3.5 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-muted-foreground text-xs">Last Updated</span>
                            <p className="font-medium text-sm truncate">{new Date(staff.updatedAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="payments" className="mt-4 overflow-auto h-[60vh]">
              <StaffPaymentsManager staffId={staff.id} staffName={staff.name} />
            </TabsContent>
            
            <TabsContent value="attendance" className="mt-4 overflow-auto h-[60vh]">
              <StaffAttendanceCalendar staffId={staff.id} staffName={staff.name} />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
}
