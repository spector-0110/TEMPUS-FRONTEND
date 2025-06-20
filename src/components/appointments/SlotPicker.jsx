'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Clock, RefreshCw } from 'lucide-react';
import { DateTime } from 'luxon';


/**
 * Time Slot Picker Component
 * Step 3 of the appointment booking flow
 */
const SlotPicker = ({ 
  availableSlots = [], 
  selectedSlot, 
  onSlotSelect, 
  selectedDoctor,
  isLoading = false 
}) => {
  const [groupedSlots, setGroupedSlots] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    if (availableSlots.length > 0) {
      groupSlotsByDate();
    }
  }, [availableSlots]);

 const groupSlotsByDate = () => {
  const nowInIST = DateTime.now().setZone('Asia/Kolkata');

  const grouped = availableSlots.reduce((acc, slot) => {
    const slotStart = DateTime.fromISO(`${slot.date}T${slot.start}`, { zone: 'Asia/Kolkata' });
    const slotEnd = DateTime.fromISO(`${slot.date}T${slot.end}`, { zone: 'Asia/Kolkata' });

    // Include both future and currently running slots
    if (slotStart > nowInIST || (nowInIST >= slotStart && nowInIST < slotEnd)) {
      const date = slot.date;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(slot);
    }

    return acc;
  }, {});

  // Sort slots by time for each date
  Object.keys(grouped).forEach(date => {
    grouped[date].sort((a, b) => {
      return a.start.localeCompare(b.start);
    });
  });

  setGroupedSlots(grouped);

  // Auto-select first available date
  const firstDate = Object.keys(grouped).sort()[0];
  if (firstDate && !selectedDate) {
    setSelectedDate(firstDate);
  }
};

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dateStr = date.toDateString();
    const todayStr = today.toDateString();
    const tomorrowStr = tomorrow.toDateString();

    if (dateStr === todayStr) {
      return 'Today';
    } else if (dateStr === tomorrowStr) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-IN', {
        weekday: 'short',
        month: 'short'
      });
    }
  };

  const formatDateFull = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getSlotDisplayTime = (slot) => {
    // Use the timeDisplay property if available, otherwise fall back to formatted time
    return slot.timeDisplay || formatTime(slot.time);
  };

  const getTimeOfDay = (timeString) => {
    const hour = parseInt(timeString.split(':')[0]);
    if (hour < 12) return 'Morning';
    if (hour < 17) return 'Afternoon';
    return 'Evening';
  };

  const handleSlotSelect = (slot) => {
    onSlotSelect(slot);
  };

  const availableDates = Object.keys(groupedSlots).sort();

  if (isLoading) {
    return (
      <Card className="w-full max-w-4xl mx-auto bg-card dark:bg-card border-border dark:border-border shadow-lg dark:shadow-xl transition-all duration-300">
        <CardHeader className="text-center border-b border-border/50 dark:border-border/30 transition-colors duration-300">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 dark:bg-primary/15 border-2 border-primary/20 dark:border-primary/30 flex items-center justify-center transition-colors duration-300">
            <Clock className="h-6 w-6 text-primary dark:text-primary" />
          </div>
          <CardTitle className="text-xl font-semibold text-foreground dark:text-foreground transition-colors duration-300">Loading Available Slots</CardTitle>
          <p className="text-sm text-muted-foreground dark:text-muted-foreground mt-2 transition-colors duration-300">
            Fetching available appointment times for Dr. {selectedDoctor?.name}
          </p>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex space-x-4">
              <Skeleton className="h-12 w-24 bg-muted dark:bg-muted/70" />
              <div className="flex space-x-2 flex-1">
                {[1, 2, 3, 4].map((j) => (
                  <Skeleton key={j} className="h-12 w-20 bg-muted dark:bg-muted/70" />
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (availableSlots.length === 0) {
    return (
      <Card className="w-full max-w-4xl mx-auto bg-card dark:bg-card border-border dark:border-border shadow-lg dark:shadow-xl transition-all duration-300">
        <CardHeader className="text-center border-b border-border/50 dark:border-border/30 transition-colors duration-300">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-muted dark:bg-muted/70 border-2 border-border dark:border-border/70 flex items-center justify-center transition-colors duration-300">
            <Calendar className="h-6 w-6 text-muted-foreground dark:text-muted-foreground" />
          </div>
          <CardTitle className="text-xl font-semibold text-foreground dark:text-foreground transition-colors duration-300">
            No Available Slots
          </CardTitle>
          <p className="text-sm text-muted-foreground dark:text-muted-foreground mt-2 transition-colors duration-300">
            Dr. {selectedDoctor?.name} has no available appointment slots.
          </p>
        </CardHeader>
        <CardContent className="text-center pt-6">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground dark:text-muted-foreground transition-colors duration-300">
              This could be because:
            </p>
            <ul className="text-left text-sm text-muted-foreground dark:text-muted-foreground space-y-2 max-w-md mx-auto transition-colors duration-300">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground dark:bg-muted-foreground mt-2 flex-shrink-0"></div>
                <span>All slots are currently booked</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground dark:bg-muted-foreground mt-2 flex-shrink-0"></div>
                <span>The doctor's schedule hasn't been set up</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground dark:bg-muted-foreground mt-2 flex-shrink-0"></div>
                <span>The doctor is not available during this period</span>
              </li>
            </ul>
            <Button variant="outline" className="gap-2 mt-4 border-border dark:border-border hover:bg-accent dark:hover:bg-accent hover:text-accent-foreground dark:hover:text-accent-foreground transition-all duration-300">
              <RefreshCw className="w-4 h-4" />
              Refresh Availability
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Date Selection */}
      <Card className="bg-card dark:bg-card border-border dark:border-border shadow-lg dark:shadow-xl transition-all duration-300">
        <CardHeader className="border-b border-border/50 dark:border-border/30 transition-colors duration-300">
          <CardTitle className="text-lg text-foreground dark:text-foreground transition-colors duration-300">Available Dates</CardTitle>
          <p className="text-sm text-muted-foreground dark:text-muted-foreground mt-2 transition-colors duration-300">
            Choose an available date and time slot for consulting with Dr. {selectedDoctor?.name}
          </p>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {availableDates.map((date) => (
              <Button
                key={date}
                variant={selectedDate === date ? "default" : "outline"}
                onClick={() => setSelectedDate(date)}
                className={`h-auto py-3 px-2 flex flex-col items-center space-y-1 transition-all duration-300 ${
                  selectedDate === date 
                    ? 'bg-primary dark:bg-primary text-primary-foreground dark:text-primary-foreground shadow-lg hover:shadow-xl' 
                    : 'bg-card dark:bg-card text-foreground dark:text-foreground hover:bg-muted dark:hover:bg-muted border-border dark:border-border hover:border-primary/50 dark:hover:border-primary/40'
                }`}
              >
                <span className="text-xs font-medium">
                  {formatDate(date)}
                </span>
                <span className={`text-lg font-bold ${
                  selectedDate === date ? 'text-primary-foreground' : 'text-foreground'
                }`}>
                  {new Date(date).getDate()} {new Date(date).toLocaleDateString('en-IN', { month: 'short' })}
                </span>
                <Badge 
                  variant={selectedDate === date ? "secondary" : "outline"} 
                  className={`text-xs px-1 ${
                    selectedDate === date 
                      ? 'bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30' 
                      : 'bg-muted text-muted-foreground border-border'
                  }`}
                >
                  {groupedSlots[date].filter(slots => slots.available).length} slots
                </Badge>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Time Slots for Selected Date */}
      {selectedDate && groupedSlots[selectedDate] && (
        <Card className="bg-card dark:bg-card border-border dark:border-border shadow-lg dark:shadow-xl transition-all duration-300">
          <CardHeader className="border-b border-border/50 dark:border-border/30 transition-colors duration-300">
            <CardTitle className="text-lg text-foreground dark:text-foreground transition-colors duration-300">
              Available Times - {formatDateFull(selectedDate)}
            </CardTitle>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <p className="text-sm text-muted-foreground dark:text-muted-foreground transition-colors duration-300">
                {groupedSlots[selectedDate].filter(slots => slots.available).length} slots available
              </p>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-xs text-muted-foreground dark:text-muted-foreground transition-colors duration-300">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 border border-border dark:border-border rounded bg-card dark:bg-card"></div>
                  <span>Available</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-success dark:bg-success rounded"></div>
                  <span>Selected</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-muted dark:bg-muted rounded opacity-50"></div>
                  <span>Booked</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              {['Morning', 'Afternoon', 'Evening'].map((period) => {
                const periodSlots = groupedSlots[selectedDate].filter(slot => 
                  getTimeOfDay(slot.start || slot.time) === period
                );
                
                if (periodSlots.length === 0) return null;

                return (
                  <div key={period}>
                    <h4 className="font-medium text-foreground dark:text-foreground mb-3 flex items-center gap-2 transition-colors duration-300">
                      <Clock className="w-4 h-4 text-primary dark:text-primary" />
                      {period}
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                      {periodSlots.map((slot) => {
                        const isSelected = selectedSlot && 
                          (selectedSlot.id === slot.id || 
                           (selectedSlot.date === slot.date && selectedSlot.time === slot.time));
                        
                        return (
                        <Button
                          key={slot.id || `${slot.date}-${slot.time}`}
                          variant="outline"
                          onClick={() => handleSlotSelect(slot)}
                          className={`h-auto py-3 px-3 text-xs relative transition-all duration-300 group ${
                            !slot.available 
                              ? 'opacity-50 cursor-not-allowed bg-muted dark:bg-muted/50 border-border dark:border-border/50' 
                              : isSelected 
                              ? 'bg-success dark:bg-success hover:bg-success/90 dark:hover:bg-success/90 border-success dark:border-success text-success-foreground dark:text-success-foreground shadow-lg hover:shadow-xl' 
                              : 'bg-card dark:bg-card hover:bg-muted dark:hover:bg-muted border-border dark:border-border hover:border-primary/50 dark:hover:border-primary/40 text-foreground dark:text-foreground hover:shadow-md'
                          }`}
                          disabled={!slot.available}
                        >
                          <div className="text-center group relative">
                            <div className={`font-medium transition-colors duration-300 ${
                              isSelected ? 'text-success-foreground dark:text-success-foreground' : 'text-foreground dark:text-foreground'
                            }`}>
                              {`${slot.start.split(':')[0]}:00 - ${parseInt(slot.start.split(':')[0]) + 1}:00`}
                            </div>
                          
                            <div className={`text-[10px] opacity-75 mt-1 transition-colors duration-300 ${
                              isSelected ? 'text-success-foreground dark:text-success-foreground' : 'text-muted-foreground dark:text-muted-foreground'
                            }`}>
                              {slot.available ? "available" : 'Full'}
                            </div>
                            
                            {/* Message-like Tooltip */}
                            <div className="absolute -top-[4.5rem] left-1/2 transform -translate-x-1/2 hidden group-hover:block min-w-[200px] z-50">
                              <div className="bg-popover dark:bg-popover text-popover-foreground dark:text-popover-foreground border border-popover-border dark:border-popover-border p-3 rounded-lg shadow-lg dark:shadow-xl relative transition-colors duration-300">
                                <div className="text-sm font-medium mb-1">Slot Capacity</div>
                                <div className="text-xs text-muted-foreground dark:text-muted-foreground">
                                  {`${slot.patientCount} patients booked`}
                                  <br />
                                  {`${slot.maxCapacity - slot.patientCount} slots remaining`}
                                </div>
                                {/* Arrow */}
                                <div className="absolute bottom-[-8px] left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-popover dark:border-t-popover"></div>
                              </div>
                            </div>
                            
                            {!slot.available && (
                              <div className="absolute inset-0 flex items-center justify-center bg-muted/90 dark:bg-muted/80 rounded border border-border dark:border-border">
                                <span className="text-[8px] text-muted-foreground dark:text-muted-foreground font-medium">Booked</span>
                              </div>
                            )}
                          </div>
                        </Button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {selectedSlot && (
              <div className="mt-6 p-4 bg-primary/10 dark:bg-primary/15 rounded-lg border border-primary/20 dark:border-primary/30 transition-colors duration-300">
                <h4 className="font-medium text-primary dark:text-primary mb-2 transition-colors duration-300">Selected Appointment</h4>
                <div className="text-primary/80 dark:text-primary/90 text-sm space-y-1 transition-colors duration-300">
                  <p><span className="font-medium">Date:</span> {formatDateFull(selectedSlot.date)}</p>
                  <p><span className="font-medium">Time:</span> {selectedSlot.timeDisplay || formatTime(selectedSlot.time)}</p>
                  <p><span className="font-medium">Doctor:</span> Dr. {selectedDoctor?.name}</p>
                  {selectedSlot.datetime && (
                    <p className="text-xs opacity-75 mt-2">
                      Appointment ID: {selectedSlot.id}
                    </p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card className="bg-muted/50 dark:bg-muted/30 border-border dark:border-border transition-colors duration-300">
        <CardContent className="pt-6">
          <h4 className="font-medium text-foreground dark:text-foreground mb-3 transition-colors duration-300">Booking Instructions</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground dark:text-muted-foreground transition-colors duration-300">
            <div>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <div className="w-1 h-1 rounded-full bg-muted-foreground dark:bg-muted-foreground mt-2 flex-shrink-0"></div>
                  <span>Select your preferred date from the available options</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1 h-1 rounded-full bg-muted-foreground dark:bg-muted-foreground mt-2 flex-shrink-0"></div>
                  <span>Choose a convenient time slot for your appointment</span>
                </li>
              </ul>
            </div>
            <div>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <div className="w-1 h-1 rounded-full bg-muted-foreground dark:bg-muted-foreground mt-2 flex-shrink-0"></div>
                  <span>Appointments are typically 5-10 minutes long</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1 h-1 rounded-full bg-muted-foreground dark:bg-muted-foreground mt-2 flex-shrink-0"></div>
                  <span>Please arrive 30 minutes early for check-in</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SlotPicker;