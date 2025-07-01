'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Plus,
  User,
  Loader2,
  Calendar as CalendarIcon,
  CheckCircle,
  XCircle,
  Coffee,
  Clock,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { StaffCard } from './StaffCard';
import { StaffForm } from './StaffForm';
import { useStaff } from '@/hooks/useStaff';
import { useIsMobile } from '@/hooks/use-mobile';

export function StaffList() {
  const isMobile = useIsMobile();
  const {
    staffList,
    isLoading,
    hasError,
    isEmpty,
    staffError,
    refreshStaffList,
    deleteStaffMember,
    markStaffAttendance
  } = useStaff();

  const [showForm, setShowForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, staff: null });
  const [viewMode, setViewMode] = useState('card');
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    // Ensure we have a valid date object
    return isNaN(today.getTime()) ? new Date() : today;
  });
  const [attendanceDialog, setAttendanceDialog] = useState({ isOpen: false, staff: null, status: null });
  
  const observerRef = useRef();
  const loadMoreRef = useRef();
  
  // Helper function to format date consistently
  const formatDate = useCallback((date) => {
    if (!date) return '';
    return date.getFullYear() + '-' + 
      String(date.getMonth() + 1).padStart(2, '0') + '-' + 
      String(date.getDate()).padStart(2, '0');
  }, []);

  // Refresh staff list with date
  const refreshStaffWithDate = useCallback(() => {
    if (!selectedDate) return;
    try {
      const formattedDate = formatDate(selectedDate);
      refreshStaffList({ date: formattedDate });
    } catch (error) {
      console.error('Error refreshing staff list:', error);
      toast.error('Failed to refresh staff list');
    }
  }, [selectedDate, refreshStaffList, formatDate]);

  // Fetch staff list when date changes and on mount
  useEffect(() => {
    if (!selectedDate) return;
    refreshStaffWithDate();
  }, [selectedDate, refreshStaffWithDate]);

  const handleEdit = (staff) => {
    setEditingStaff(staff);
    setShowForm(true);
  };
  
  const handleDelete = (staff) => {
    setDeleteConfirm({ isOpen: true, staff });
  };
  
  const confirmDelete = async () => {
    if (deleteConfirm.staff) {
      const success = await deleteStaffMember(deleteConfirm.staff.id);
      if (success) {
        setDeleteConfirm({ isOpen: false, staff: null });
      }
    }
  };
  
  const handleFormClose = () => {
    setShowForm(false);
    setEditingStaff(null);
  };
  
  const handleAttendanceClick = (staff) => {
    setAttendanceDialog({ isOpen: true, staff, status: staff.attendanceStatus });
  };
  
  const handleAttendance = (staff, status) => {
    setAttendanceDialog({ isOpen: true, staff, status });
  };

  const confirmAttendance = async () => {
    if (attendanceDialog.staff && attendanceDialog.status && selectedDate) {
      try {
        const formattedDate = formatDate(selectedDate);
        await markStaffAttendance({
          staffId: attendanceDialog.staff,
          attendanceDate: formattedDate,
          status: attendanceDialog.status
        });
        // Refresh the staff list with current date after marking attendance
        refreshStaffWithDate();
        setAttendanceDialog({ isOpen: false, staff: null, status: null });
      } catch (error) {
        console.error('Error marking attendance:', error);
        toast.error('Failed to mark attendance. Please try again.');
      }
    }
  };

  // Error state
  if (hasError) {
    return (
      <Card className="border-destructive">
        <CardContent className="p-8 text-center">
          <div className="text-destructive mb-4">
            <User className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <h3 className="text-lg font-semibold">Error Loading Staff</h3>
            <p className="text-sm">{staffError}</p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => {
              const formattedDate = selectedDate.getFullYear() + '-' + 
                String(selectedDate.getMonth() + 1).padStart(2, '0') + '-' + 
                String(selectedDate.getDate()).padStart(2, '0');
              refreshStaffList({ date: formattedDate });
            }}
            className="mt-4"
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  // Empty state
  if (isEmpty) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            No Staff Members Yet
          </h3>
          <p className="text-muted-foreground mb-4">
            Get started by adding your first staff member to the system.
          </p>
          <Button onClick={() => setShowForm(true)} className="mx-auto">
            <Plus className="w-4 h-4 mr-2" />
            Add First Staff Member
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <>
      {/* Staff List Container */}
      <div className="space-y-4">
        {/* Date Picker and View Mode Selector */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "justify-start text-left font-normal w-[240px]",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={refreshStaffWithDate}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              {!isMobile && "Refresh"}
            </Button>

            {!isMobile && (
              <p className="text-sm text-muted-foreground">
                Showing {staffList.length} staff members
              </p>
            )}
          </div>
        </div>
        
        {/* Staff Cards */}
        <div className={`space-y-4 ${viewMode === 'grid' ? 'sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-4 sm:space-y-0' : ''}`}>
          {staffList.map((staff) => (
            <div
              key={staff.id}
              className={viewMode === 'grid' ? '' : 'w-full'}
            >
              <StaffCard
                staff={staff}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onMarkAttendance={handleAttendance}
                viewMode={viewMode}
              />
            </div>
          ))}
        </div>
        
        {/* Loading States */}
        {isLoading && staffList.length === 0 && (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <StaffCardSkeleton key={i} />
            ))}
          </div>
        )}
      </div>
      
      {/* Staff Form Modal */}
      <StaffForm
        isOpen={showForm}
        onClose={handleFormClose}
        staff={editingStaff}
        mode={editingStaff ? 'edit' : 'create'}
      />
      
      {/* Delete Confirmation Modal */}
      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-2">Delete Staff Member</h3>
              <p className="text-muted-foreground mb-4">
                Are you sure you want to delete <strong>{deleteConfirm.staff?.name}</strong>? 
                This action cannot be undone and will remove all associated data.
              </p>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setDeleteConfirm({ isOpen: false, staff: null })}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={confirmDelete}
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Attendance Confirmation Modal */}
      {attendanceDialog.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-2">Mark Attendance</h3>
              <p className="text-muted-foreground mb-4">
                Mark <strong>{attendanceDialog.staff?.name}</strong> as{' '}
                <strong>{attendanceDialog.status}</strong> for{' '}
                {format(selectedDate, "PPP")}?
              </p>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setAttendanceDialog({ isOpen: false, staff: null, status: null })}
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmAttendance}
                  className={cn(
                    attendanceDialog.status === 'present' && 'bg-green-600 hover:bg-green-700',
                    attendanceDialog.status === 'absent' && 'bg-red-600 hover:bg-red-700',
                    attendanceDialog.status === 'half_day' && 'bg-orange-600 hover:bg-orange-700',
                    attendanceDialog.status === 'leave' && 'bg-blue-600 hover:bg-blue-700'
                  )}
                >
                  Confirm
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}

// Skeleton loader component for better UX
function StaffCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-muted rounded-full animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
            <div className="h-3 bg-muted rounded w-1/2 animate-pulse" />
            <div className="flex gap-2">
              <div className="h-3 bg-muted rounded w-16 animate-pulse" />
              <div className="h-3 bg-muted rounded w-20 animate-pulse" />
            </div>
          </div>
          <div className="w-8 h-8 bg-muted rounded animate-pulse" />
        </div>
      </CardContent>
    </Card>
  );
}
