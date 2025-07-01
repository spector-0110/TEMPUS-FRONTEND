'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle,
  XCircle,
  Clock,
  Coffee,
  Home,
  Target
} from 'lucide-react';
import { STAFF_CONSTANTS, getDisplayName } from '@/lib/api/staffAPI';
import { useStaffAttendance } from '@/hooks/useStaff';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';

export function StaffAttendanceCalendar({ staffId, staffName }) {
  const isMobile = useIsMobile();
  const {
    attendance,
    loading,
    error,
    currentMonth,
    navigateMonth,
    attendanceStats,
    markAttendance
  } = useStaffAttendance(staffId);
  
  const [showMarkDialog, setShowMarkDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' | 'list'
  
  // Generate calendar data
  const calendarData = useMemo(() => {
    const year = currentMonth.year;
    const month = currentMonth.month;
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Previous month's days
    const prevMonth = new Date(year, month - 1, 0);
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: prevMonth.getDate() - i,
        isCurrentMonth: false,
        isPrevMonth: true
      });
    }
    
    // Current month's days
    for (let date = 1; date <= daysInMonth; date++) {
      const attendanceRecord = attendance.find(record => {
        const recordDate = new Date(record.attendanceDate);
        return recordDate.getFullYear() === year &&
               recordDate.getMonth() === month &&
               recordDate.getDate() === date;
      });
      
      days.push({
        date,
        isCurrentMonth: true,
        attendance: attendanceRecord,
        isToday: new Date().toDateString() === new Date(year, month, date).toDateString()
      });
    }
    
    // Next month's days
    const remainingDays = 42 - days.length; // 6 rows × 7 days
    for (let date = 1; date <= remainingDays; date++) {
      days.push({
        date,
        isCurrentMonth: false,
        isNextMonth: true
      });
    }
    
    return days;
  }, [currentMonth, attendance]);
  
  const getStatusIcon = (status) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'absent':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'paid_leave':
        return <Home className="w-4 h-4 text-blue-500" />;
      case 'half_day':
        return <Clock className="w-4 h-4 text-orange-500" />;
      case 'week_holiday':
        return <Coffee className="w-4 h-4 text-purple-500" />;
      default:
        return <Minus className="w-4 h-4 text-muted-foreground" />;
    }
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'absent':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'paid_leave':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'half_day':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'week_holiday':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };
  
  const handleDateClick = (day) => {
    if (!day.isCurrentMonth) return;
    
    const dateToMark = new Date(currentMonth.year, currentMonth.month, day.date);
    setSelectedDate(dateToMark);
    setSelectedStatus(day.attendance?.status || '');
    setShowMarkDialog(true);
  };
  
  const handleMarkAttendance = async () => {
    if (!selectedDate || !selectedStatus) return;
    
    try {
      // Format date as YYYY-MM-DD to avoid timezone issues
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;
      
      await markAttendance({
        staffId,
        attendanceDate: formattedDate,
        status: selectedStatus
      });
      
      setShowMarkDialog(false);
      setSelectedDate(null);
      setSelectedStatus('');
      toast.success('Attendance marked successfully');
    } catch (error) {
      toast.error('Failed to mark attendance');
    }
  };
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  if (loading && attendance.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center space-y-2">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="text-sm text-muted-foreground">Loading attendance...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {/* Header with Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Present</p>
                <p className="text-lg font-bold text-green-600">{attendanceStats.presentDays}</p>
              </div>
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Absent</p>
                <p className="text-lg font-bold text-red-600">{attendanceStats.absentDays}</p>
              </div>
              <XCircle className="w-6 h-6 text-red-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Rate</p>
                <p className="text-lg font-bold">{attendanceStats.attendanceRate}%</p>
              </div>
              <Target className="w-6 h-6 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Days</p>
                <p className="text-lg font-bold">{attendanceStats.workingDays}</p>
              </div>
              <CalendarIcon className="w-6 h-6 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Calendar Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth(-1)}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <h3 className="text-lg font-semibold min-w-[140px] text-center">
              {monthNames[currentMonth.month]} {currentMonth.year}
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth(1)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'calendar' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('calendar')}
          >
            Calendar
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            List
          </Button>
        </div>
      </div>
      
      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <Card>
          <CardContent className="p-4">
            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Day Headers */}
              {dayNames.map(day => (
                <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                  {isMobile ? day.charAt(0) : day}
                </div>
              ))}
              
              {/* Calendar Days */}
              {calendarData.map((day, index) => (
                <div
                  key={index}
                  className={`
                    relative aspect-square p-1 text-center cursor-pointer rounded-md transition-colors
                    ${day.isCurrentMonth 
                      ? 'hover:bg-muted' 
                      : 'text-muted-foreground opacity-50'
                    }
                    ${day.isToday ? 'bg-primary/10 border border-primary/20' : ''}
                  `}
                  onClick={() => handleDateClick(day)}
                >
                  <div className="text-sm font-medium mb-1">
                    {day.date}
                  </div>
                  
                  {day.attendance && (
                    <div className="flex justify-center">
                      <Badge 
                        variant="secondary" 
                        className={`${getStatusColor(day.attendance.status)} text-xs px-1 py-0`}
                      >
                        {getStatusIcon(day.attendance.status)}
                      </Badge>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Legend */}
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-sm font-medium mb-2">Legend:</p>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                {Object.entries(STAFF_CONSTANTS.ATTENDANCE_STATUS).map(([key, value]) => (
                  <div key={value} className="flex items-center gap-1">
                    {getStatusIcon(value)}
                    <span className="capitalize">{value.replace('_', ' ')}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* List View */}
      {viewMode === 'list' && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              {attendance.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No attendance records for this month
                </p>
              ) : (
                attendance.map((record, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(record.status)}
                      <div>
                        <p className="font-medium">
                          {new Date(record.attendanceDate).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(record.attendanceDate).toLocaleDateString('en-US', { weekday: 'long' })}
                        </p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(record.status)}>
                      {record.status.replace('_', ' ')}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Mark Attendance Dialog */}
      <Dialog open={showMarkDialog} onOpenChange={setShowMarkDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Mark Attendance</DialogTitle>
            <DialogDescription>
              Mark attendance for {staffName} on {selectedDate?.toLocaleDateString()}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="status">Attendance Status</Label>
              <Select
                value={selectedStatus}
                onValueChange={setSelectedStatus}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(STAFF_CONSTANTS.ATTENDANCE_STATUS).map(([key, value]) => (
                    <SelectItem key={value} value={value}>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(value)}
                        <span className="capitalize">{value.replace('_', ' ')}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowMarkDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleMarkAttendance}
              disabled={!selectedStatus}
            >
              Mark Attendance
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}