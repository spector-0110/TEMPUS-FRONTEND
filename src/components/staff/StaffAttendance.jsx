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
  Coffee
} from 'lucide-react';
import { STAFF_CONSTANTS, getDisplayName } from '@/lib/api/staffAPI';
import { useStaff } from '@/context/StaffContext';
import { useIsMobile } from '@/hooks/use-mobile';

export function StaffAttendance({ staffId, staffName }) {
  const isMobile = useIsMobile();
  const {
    staffAttendance,
    attendanceLoading,
    attendanceError,
    fetchStaffAttendance,
    markStaffAttendance
  } = useStaff();
  
  const [showMarkAttendance, setShowMarkAttendance] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // 'month' or 'calendar'
  const [attendanceStatus, setAttendanceStatus] = useState('present');
  const [filters, setFilters] = useState({
    fromDate: '',
    toDate: '',
    status: ''
  });
  
  // Fetch attendance on mount and when filters change
  useEffect(() => {
    if (staffId) {
      const queryParams = {
        ...filters,
        fromDate: filters.fromDate || new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).toISOString().split('T')[0],
        toDate: filters.toDate || new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).toISOString().split('T')[0]
      };
      fetchStaffAttendance(staffId, queryParams);
    }
  }, [staffId, currentMonth, filters, fetchStaffAttendance]);
  
  // Create attendance map for easy lookup
  const attendanceMap = useMemo(() => {
    const map = new Map();
    staffAttendance.forEach(record => {
      const date = new Date(record.attendanceDate).toDateString();
      map.set(date, record);
    });
    return map;
  }, [staffAttendance]);
  
  // Calculate statistics
  const stats = useMemo(() => {
    const total = staffAttendance.length;
    const present = staffAttendance.filter(a => a.status === 'present').length;
    const absent = staffAttendance.filter(a => a.status === 'absent').length;
    const halfDay = staffAttendance.filter(a => a.status === 'half_day').length;
    const paidLeave = staffAttendance.filter(a => a.status === 'paid_leave').length;
    const weekHoliday = staffAttendance.filter(a => a.status === 'week_holiday').length;
    
    return {
      total,
      present,
      absent,
      halfDay,
      paidLeave,
      weekHoliday,
      presentPercentage: total > 0 ? Math.round((present / total) * 100) : 0
    };
  }, [staffAttendance]);
  
  const handleMarkAttendance = async () => {
    try {
      await markStaffAttendance({
        staffId,
        attendanceDate: selectedDate.toISOString().split('T')[0],
        status: attendanceStatus
      });
      setShowMarkAttendance(false);
    } catch (error) {
      console.error('Error marking attendance:', error);
    }
  };
  
  const handlePreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };
  
  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };
  
  const getAttendanceForDate = (date) => {
    return attendanceMap.get(date.toDateString());
  };
  
  const getStatusColor = (status) => {
    const colors = {
      present: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      absent: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      paid_leave: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      half_day: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      week_holiday: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };
  
  const getStatusIcon = (status) => {
    const icons = {
      present: CheckCircle,
      absent: XCircle,
      paid_leave: Coffee,
      half_day: Clock,
      week_holiday: Minus
    };
    const IconComponent = icons[status] || CheckCircle;
    return <IconComponent className="w-3 h-3" />;
  };
  
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const attendance = getAttendanceForDate(date);
      days.push({ date, attendance });
    }
    
    return days;
  };
  
  const calendarDays = generateCalendarDays();
  
  return (
    <div className="space-y-4">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-semibold">Attendance for {staffName}</h3>
          <p className="text-sm text-muted-foreground">
            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} - 
            {stats.present} days present ({stats.presentPercentage}%)
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={viewMode} onValueChange={setViewMode}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Month View</SelectItem>
              <SelectItem value="calendar">Calendar View</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => setShowMarkAttendance(true)} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Mark Attendance
          </Button>
        </div>
      </div>
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Present</p>
                <p className="text-lg font-bold text-green-600">{stats.present}</p>
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
                <p className="text-lg font-bold text-red-600">{stats.absent}</p>
              </div>
              <XCircle className="w-6 h-6 text-red-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Half Day</p>
                <p className="text-lg font-bold text-orange-600">{stats.halfDay}</p>
              </div>
              <Clock className="w-6 h-6 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Paid Leave</p>
                <p className="text-lg font-bold text-blue-600">{stats.paidLeave}</p>
              </div>
              <Coffee className="w-6 h-6 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Holidays</p>
                <p className="text-lg font-bold text-purple-600">{stats.weekHoliday}</p>
              </div>
              <Minus className="w-6 h-6 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Month Navigation */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={handlePreviousMonth}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <h3 className="text-lg font-semibold">
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h3>
            <Button variant="outline" size="sm" onClick={handleNextMonth}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Attendance View */}
      {viewMode === 'calendar' ? (
        // Calendar View
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-7 gap-2 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((dayData, index) => {
                if (!dayData) {
                  return <div key={index} className="p-2" />;
                }
                
                const { date, attendance } = dayData;
                const isToday = date.toDateString() === new Date().toDateString();
                
                return (
                  <div
                    key={index}
                    className={`
                      p-2 text-center text-sm border rounded-lg cursor-pointer transition-colors
                      ${isToday ? 'border-primary bg-primary/10' : 'border-border'}
                      ${attendance ? getStatusColor(attendance.status) : 'hover:bg-muted'}
                    `}
                    onClick={() => {
                      setSelectedDate(date);
                      setShowMarkAttendance(true);
                    }}
                  >
                    <div className="font-medium">{date.getDate()}</div>
                    {attendance && (
                      <div className="flex justify-center mt-1">
                        {getStatusIcon(attendance.status)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ) : (
        // List View
        <div className="space-y-3">
          {attendanceError && (
            <Card className="border-destructive">
              <CardContent className="p-4">
                <p className="text-destructive">Error: {attendanceError}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => fetchStaffAttendance(staffId)}
                  className="mt-2"
                >
                  Try Again
                </Button>
              </CardContent>
            </Card>
          )}
          
          {attendanceLoading && (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-muted rounded animate-pulse w-1/3" />
                        <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
                      </div>
                      <div className="h-6 bg-muted rounded animate-pulse w-20" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          {!attendanceLoading && staffAttendance.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <CalendarIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Attendance Records</h3>
                <p className="text-muted-foreground mb-4">
                  No attendance has been recorded for this staff member in the selected period.
                </p>
                <Button onClick={() => setShowMarkAttendance(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Mark First Attendance
                </Button>
              </CardContent>
            </Card>
          )}
          
          {staffAttendance.map((record) => (
            <Card key={record.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-lg font-bold">
                        {new Date(record.attendanceDate).getDate()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(record.attendanceDate).toLocaleDateString('en-US', { 
                          month: 'short' 
                        })}
                      </div>
                    </div>
                    <div>
                      <div className="font-medium">
                        {new Date(record.attendanceDate).toLocaleDateString('en-US', { 
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {record.createdAt && `Marked on ${new Date(record.createdAt).toLocaleDateString()}`}
                      </div>
                    </div>
                  </div>
                  
                  <Badge 
                    variant="secondary"
                    className={`${getStatusColor(record.status)} flex items-center gap-1`}
                  >
                    {getStatusIcon(record.status)}
                    {getDisplayName.attendanceStatus(record.status)}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* Mark Attendance Dialog */}
      <Dialog open={showMarkAttendance} onOpenChange={setShowMarkAttendance}>
        <DialogContent className={`${isMobile ? 'w-[95vw] max-w-none' : 'max-w-md'}`}>
          <DialogHeader>
            <DialogTitle>Mark Attendance</DialogTitle>
            <DialogDescription>
              Mark attendance for {staffName} on {selectedDate.toLocaleDateString()}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={selectedDate.toISOString().split('T')[0]}
                onChange={(e) => setSelectedDate(new Date(e.target.value))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Attendance Status</Label>
              <Select value={attendanceStatus} onValueChange={setAttendanceStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(STAFF_CONSTANTS.ATTENDANCE_STATUS).map(([key, value]) => (
                    <SelectItem key={value} value={value}>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(value)}
                        {getDisplayName.attendanceStatus(value)}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowMarkAttendance(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleMarkAttendance}>
              Mark Attendance
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
