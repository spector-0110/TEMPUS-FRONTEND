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
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
            <Clock className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-xl font-semibold">Loading Available Slots</CardTitle>
          <p className="text-sm text-gray-400 mt-2">
            Fetching available appointment times for Dr. {selectedDoctor?.name}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex space-x-4">
              <Skeleton className="h-12 w-24" />
              <div className="flex space-x-2 flex-1">
                {[1, 2, 3, 4].map((j) => (
                  <Skeleton key={j} className="h-12 w-20" />
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
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
            <Calendar className="h-6 w-6 text-gray-400" />
          </div>
          <CardTitle className="text-xl font-semibold text-gray-600">
            No Available Slots
          </CardTitle>
          <p className="text-sm text-gray-500 mt-2">
            Dr. {selectedDoctor?.name} has no available appointment slots.
          </p>
        </CardHeader>
        <CardContent className="text-center">
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              This could be because:
            </p>
            <ul className="text-left text-sm text-gray-600 space-y-1 max-w-md mx-auto">
              <li>• All slots are currently booked</li>
              <li>• The doctor's schedule hasn't been set up</li>
              <li>• The doctor is not available during this period</li>
            </ul>
            <Button variant="outline" className="gap-2 mt-4">
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
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Available Dates</CardTitle>
          <p className="text-sm text-gray-400 mt-2">
            Choose an available Date and Time slot for consulting with Dr. {selectedDoctor?.name}
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {availableDates.map((date) => (
              <Button
                key={date}
                variant={selectedDate === date ? "default" : "outline"}
                onClick={() => setSelectedDate(date)}
                className="h-auto py-3 px-2 flex flex-col items-center space-y-1"
              >
                <span className="text-xs font-medium">
                  {formatDate(date)}
                </span>
                <span className="text-lg font-bold text-gray-500">
                  {new Date(date).getDate()} {new Date(date).toLocaleDateString('en-IN', { month: 'short' })}
                </span>
                <Badge variant="secondary" className="text-xs px-1">
                  {groupedSlots[date].filter(slots => slots.available).length} slots
                </Badge>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Time Slots for Selected Date */}
      {selectedDate && groupedSlots[selectedDate] && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Available Times - {formatDateFull(selectedDate)}
            </CardTitle>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <p className="text-sm text-gray-300">
                {groupedSlots[selectedDate].filter(slots => slots.available).length} slots available
              </p>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 border border-gray-300 rounded"></div>
                  <span>Available</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-600 rounded"></div>
                  <span>Selected</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-gray-200 rounded opacity-50"></div>
                  <span>Booked</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {['Morning', 'Afternoon', 'Evening'].map((period) => {
                const periodSlots = groupedSlots[selectedDate].filter(slot => 
                  getTimeOfDay(slot.start || slot.time) === period
                );
                
                if (periodSlots.length === 0) return null;

                return (
                  <div key={period}>
                    <h4 className="font-medium text-gray-100 mb-3 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
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
                          className={`h-auto py-2 px-3 text-xs relative ${
                            !slot.available ? 'opacity-50 cursor-not-allowed' : ''
                          } ${
                            isSelected 
                              ? 'bg-green-600 hover:bg-green-700 border-green-600 text-white' 
                              : 'hover:bg-gray-800'
                          }`}
                          disabled={!slot.available}
                        >
                          <div className="text-center group relative">
                            <div className={`font-medium ${isSelected ? 'text-white' : 'text-gray-50'}`}>
                              {`${slot.start.split(':')[0]}:00 - ${parseInt(slot.start.split(':')[0]) + 1}:00`}
                            </div>
                          
                            <div className={`text-[10px] opacity-75 mt-1 ${isSelected ? 'text-white' : 'text-gray-50'}`}>
                              {slot.available ? "available" : 'Full'}
                            </div>
                            
                            {/* Message-like Tooltip */}
                            <div className="absolute -top-[4.5rem] left-1/2 transform -translate-x-1/2 hidden group-hover:block min-w-[200px] z-50">
                              <div className="bg-gray-900 text-white p-3 rounded-lg shadow-lg relative">
                                <div className="text-sm font-medium mb-1">Slot Capacity</div>
                                <div className="text-xs text-gray-300">
                                  {`${slot.patientCount} patients booked`}
                                  <br />
                                  {`${slot.maxCapacity - slot.patientCount} slots remaining`}
                                </div>
                                {/* Arrow */}
                                <div className="absolute bottom-[-8px] left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-gray-900"></div>
                              </div>
                            </div>
                            
                            {!slot.available && (
                              <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-800 rounded">
                                <span className="text-[8px] text-white font-medium">Booked</span>
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
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">Selected Appointment</h4>
                <div className="text-blue-800 text-sm space-y-1">
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
      <Card className="bg-gray-50">
        <CardContent className="pt-6">
          <h4 className="font-medium text-gray-900 mb-3">Booking Instructions</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-400">
            <div>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <div className="w-1 h-1 rounded-full bg-gray-400 mt-2 flex-shrink-0"></div>
                  <span>Select your preferred date from the available options</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1 h-1 rounded-full bg-gray-400 mt-2 flex-shrink-0"></div>
                  <span>Choose a convenient time slot for your appointment</span>
                </li>
              </ul>
            </div>
            <div>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <div className="w-1 h-1 rounded-full bg-gray-400 mt-2 flex-shrink-0"></div>
                  <span>Appointments are typically 5-10 minutes long</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1 h-1 rounded-full bg-gray-400 mt-2 flex-shrink-0"></div>
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