'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  IndianRupee
} from 'lucide-react';
import { getDisplayName } from '@/lib/api/staffAPI';
import { useStaff } from '@/context/StaffContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { StaffPaymentsManager } from './StaffPaymentsManager';
import { StaffAttendanceCalendar } from './StaffAttendanceCalendar';

export function StaffCard({ staff, onEdit, onDelete }) {
  const isMobile = useIsMobile();
  const [showDetails, setShowDetails] = useState(false);
  const { fetchStaffPayments, fetchStaffAttendance } = useStaff();
  
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
    // // Pre-fetch data when dialog opens
    fetchStaffPayments(staff.id);
    fetchStaffAttendance(staff.id);
  };
  
  return (
    <>
      <Card className="hover:shadow-md transition-all duration-200 group">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <Avatar className="w-12 h-12 shrink-0 ring-2 ring-background group-hover:ring-primary/20 transition-all">
                <AvatarImage src={staff.photoUrl} alt={staff.name} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {getInitials(staff.name)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                    {staff.name}
                  </h3>
                  <Badge 
                    variant="secondary"
                    className={`${getStatusColor(staff.isActive)} text-xs`}
                  >
                    {staff.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>                  <div className="space-y-1">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <BadgeIcon className="w-3 h-3" />
                    <span className="font-medium">{getDisplayName.role(staff.staffRole)}</span>
                  </div>
                  
                  {isMobile ? (
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        <span>{staff.mobileNumber}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <IndianRupee className="w-3 h-3" />
                        <span>₹{staff.salaryAmount?.toLocaleString()} / {getDisplayName.salaryType(staff.salaryType)}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        <span>{staff.mobileNumber}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <IndianRupee className="w-3 h-3" />
                        <span>₹{staff.salaryAmount?.toLocaleString()} / {getDisplayName.salaryType(staff.salaryType)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>Age {staff.age}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
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
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>
      
      {/* Staff Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className={`${isMobile ? 'w-[95vw] max-w-none h-[95vh]' : 'max-w-4xl max-h-[90vh]'} overflow-hidden`}>
          <DialogHeader className="pb-4">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={staff.photoUrl} alt={staff.name} />
                <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                  {getInitials(staff.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle className="text-xl">{staff.name}</DialogTitle>
                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                  <BadgeIcon className="w-3 h-3" />
                  {getDisplayName.role(staff.staffRole)}
                  <Badge 
                    variant="secondary"
                    className={`${getStatusColor(staff.isActive)} ml-2`}
                  >
                    {staff.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </div>
          </DialogHeader>
          
          <Tabs defaultValue="info" className="flex-1 overflow-hidden">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="info">Information</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
              <TabsTrigger value="attendance">Attendance</TabsTrigger>
            </TabsList>
            
            <TabsContent value="info" className="mt-4 space-y-4 overflow-auto max-h-[60vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Personal Information */}
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                      Personal Information
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Age:</span>
                        <span className="font-medium">{staff.age} years</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Mobile:</span>
                        <span className="font-medium">{staff.mobileNumber}</span>
                      </div>
                      {staff.aadhaarCard && (
                        <div className="flex items-center gap-2 text-sm">
                          <CreditCard className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Aadhaar:</span>
                          <span className="font-medium">
                            {staff.aadhaarCard.replace(/(.{4})/g, '$1 ').trim()}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                {/* Employment Information */}
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                      Employment Details
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <BadgeIcon className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Role:</span>
                        <span className="font-medium">{getDisplayName.role(staff.staffRole)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <IndianRupee className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Salary:</span>
                        <span className="font-medium">
                          ₹{staff.salaryAmount?.toLocaleString()} / {getDisplayName.salaryType(staff.salaryType)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Pay Cycle:</span>
                        <span className="font-medium">Every {staff.salaryCreditCycle} days</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Additional Info */}
              {(staff.createdAt || staff.updatedAt) && (
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                      System Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      {staff.createdAt && (
                        <div>
                          <span className="text-muted-foreground">Created:</span>
                          <p className="font-medium">{new Date(staff.createdAt).toLocaleDateString()}</p>
                        </div>
                      )}
                      {staff.updatedAt && (
                        <div>
                          <span className="text-muted-foreground">Last Updated:</span>
                          <p className="font-medium">{new Date(staff.updatedAt).toLocaleDateString()}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="payments" className="mt-4 overflow-auto max-h-[60vh]">
              <StaffPaymentsManager staffId={staff.id} staffName={staff.name} />
            </TabsContent>
            
            <TabsContent value="attendance" className="mt-4 overflow-auto max-h-[60vh]">
              <StaffAttendanceCalendar staffId={staff.id} staffName={staff.name} />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
}
