'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Plus, Minus, Save, Check } from 'lucide-react';

/**
 * Component for editing a doctor's schedule with time ranges for each day
 */
const ScheduleEditor = ({ doctorId, initialSchedules, onSave, onCancel }) => {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const [schedules, setSchedules] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  // Initialize with doctor's existing schedules
  useEffect(() => {
    if (initialSchedules) {
      // Sort by day of week for consistency
      const sortedSchedules = [...initialSchedules].sort((a, b) => a.dayOfWeek - b.dayOfWeek);
      setSchedules(sortedSchedules);
    }
  }, [initialSchedules]);

  // Add a new time range to a specific day schedule
  const addTimeRange = (dayIndex) => {
    setSchedules(prev => 
      prev.map(schedule => {
        if (schedule.dayOfWeek === dayIndex) {
          return {
            ...schedule,
            timeRanges: [...schedule.timeRanges, { start: "09:00", end: "17:00" }]
          };
        }
        return schedule;
      })
    );
  };

  // Remove a time range from a specific day schedule
  const removeTimeRange = (dayIndex, rangeIndex) => {
    setSchedules(prev => 
      prev.map(schedule => {
        if (schedule.dayOfWeek === dayIndex) {
          const newTimeRanges = [...schedule.timeRanges];
          newTimeRanges.splice(rangeIndex, 1);
          return {
            ...schedule,
            timeRanges: newTimeRanges
          };
        }
        return schedule;
      })
    );
  };

  // Update time range values
  const updateTimeRange = (dayIndex, rangeIndex, field, value) => {
    setSchedules(prev => 
      prev.map(schedule => {
        if (schedule.dayOfWeek === dayIndex) {
          const newTimeRanges = [...schedule.timeRanges];
          newTimeRanges[rangeIndex] = {
            ...newTimeRanges[rangeIndex],
            [field]: value
          };
          return {
            ...schedule,
            timeRanges: newTimeRanges
          };
        }
        return schedule;
      })
    );
  };

  // Update consultation time
  const updateConsultationTime = (dayIndex, value) => {
    setSchedules(prev => 
      prev.map(schedule => {
        if (schedule.dayOfWeek === dayIndex) {
          return {
            ...schedule,
            avgConsultationTime: parseInt(value) || 15
          };
        }
        return schedule;
      })
    );
  };

  // Update status
  const updateStatus = (dayIndex, value) => {
    setSchedules(prev => 
      prev.map(schedule => {
        if (schedule.dayOfWeek === dayIndex) {
          return {
            ...schedule,
            status: value
          };
        }
        return schedule;
      })
    );
  };

  // Handle save action
  const handleSave = () => {
    // Construct the data object to be sent
    const scheduleData = {
      doctor_id: doctorId,
      schedules: schedules
    };
    
    onSave(scheduleData);
    setShowConfirmation(false);
  };

  // If in confirmation mode, show confirmation UI
  if (showConfirmation) {
    return (
      <div className="p-4 space-y-6">
        <DialogDescription className="text-center">
          Are you sure you want to update this doctor's schedule? 
          This will affect all future appointments.
        </DialogDescription>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowConfirmation(false)}>
            Go Back
          </Button>
          <Button onClick={handleSave}>
            <Check className="h-4 w-4 mr-1" /> Confirm Update
          </Button>
        </DialogFooter>
      </div>
    );
  }

  // Otherwise show the schedule editor UI
  return (
    <div className="space-y-6 max-h-[70vh] overflow-y-auto p-2">
      {schedules.map((schedule) => (
        <div key={schedule.dayOfWeek} className="border rounded-lg p-4 bg-card">
          <div className="font-medium text-lg mb-3 flex justify-between items-center">
            <span>{dayNames[schedule.dayOfWeek]}</span>
            <div className="flex items-center gap-2">
              <Label htmlFor={`status-${schedule.dayOfWeek}`} className="text-xs">Status:</Label>
              <select
                id={`status-${schedule.dayOfWeek}`}
                value={schedule.status}
                onChange={(e) => updateStatus(schedule.dayOfWeek, e.target.value)}
                className="text-xs p-1 rounded-md border border-input bg-background"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 mb-4">
            <Label htmlFor={`consultation-${schedule.dayOfWeek}`} className="text-sm">
              Avg. consultation time (min):
            </Label>
            <Input
              id={`consultation-${schedule.dayOfWeek}`}
              type="number"
              min="5"
              max="60"
              value={schedule.avgConsultationTime}
              onChange={(e) => updateConsultationTime(schedule.dayOfWeek, e.target.value)}
              className="w-20 h-8 text-sm"
            />
          </div>
          
          <div className="space-y-3">
            {schedule.timeRanges.map((range, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Input
                  type="time"
                  value={range.start}
                  onChange={(e) => updateTimeRange(schedule.dayOfWeek, index, 'start', e.target.value)}
                  className="w-24 h-8"
                />
                <span>to</span>
                <Input
                  type="time"
                  value={range.end}
                  onChange={(e) => updateTimeRange(schedule.dayOfWeek, index, 'end', e.target.value)}
                  className="w-24 h-8"
                />
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => removeTimeRange(schedule.dayOfWeek, index)}
                  className="h-8 w-8 p-0"
                  disabled={schedule.timeRanges.length === 1}
                >
                  <Minus className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => addTimeRange(schedule.dayOfWeek)}
              className="mt-2"
            >
              <Plus className="h-4 w-4 mr-1" /> Add Time Slot
            </Button>
          </div>
        </div>
      ))}
      
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={() => setShowConfirmation(true)}>
          <Save className="h-4 w-4 mr-1" /> Save Changes
        </Button>
      </DialogFooter>
    </div>
  );
};

export default ScheduleEditor;
