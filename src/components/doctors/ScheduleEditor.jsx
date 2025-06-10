'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '../ui/label';
import { DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Plus, Minus, Save, Check } from 'lucide-react';

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const ScheduleEditor = ({ doctorId, initialSchedules, onSave, onCancel }) => {
  const [schedules, setSchedules] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    if (initialSchedules) {
      const sorted = [...initialSchedules].sort((a, b) => a.dayOfWeek - b.dayOfWeek);
      setSchedules(sorted);
    }
  }, [initialSchedules]);

  const addTimeRange = (dayIndex) => {
    setSchedules(prev =>
      prev.map(schedule =>
        schedule.dayOfWeek === dayIndex
          ? { ...schedule, timeRanges: [...schedule.timeRanges, { start: '09:00', end: '17:00' }] }
          : schedule
      )
    );
  };

  const removeTimeRange = (dayIndex, rangeIndex) => {
    setSchedules(prev =>
      prev.map(schedule =>
        schedule.dayOfWeek === dayIndex
          ? {
              ...schedule,
              timeRanges: schedule.timeRanges.filter((_, i) => i !== rangeIndex),
            }
          : schedule
      )
    );
  };

  const updateTimeRange = (dayIndex, rangeIndex, field, value) => {
    setSchedules(prev =>
      prev.map(schedule =>
        schedule.dayOfWeek === dayIndex
          ? {
              ...schedule,
              timeRanges: schedule.timeRanges.map((range, i) =>
                i === rangeIndex ? { ...range, [field]: value } : range
              ),
            }
          : schedule
      )
    );
  };

  const updateConsultationTime = (dayIndex, value) => {
    setSchedules(prev =>
      prev.map(schedule =>
        schedule.dayOfWeek === dayIndex
          ? { ...schedule, avgConsultationTime: parseInt(value, 10) || 15 }
          : schedule
      )
    );
  };

  const updateStatus = (dayIndex, value) => {
    setSchedules(prev =>
      prev.map(schedule =>
        schedule.dayOfWeek === dayIndex ? { ...schedule, status: value } : schedule
      )
    );
  };

  const handleSave = () => {
    const processed = schedules.map(s => ({
      ...s,
      dayOfWeek: Number(s.dayOfWeek),
      avgConsultationTime: parseInt(s.avgConsultationTime, 5),
      timeRanges: s.timeRanges.map(({ start, end }) => ({ start, end })),
    }));

    onSave({ doctor_id: doctorId, schedules: processed });
    setShowConfirmation(false);
  };

  if (showConfirmation) {
    return (
      <div className="p-4 space-y-6">
        <DialogDescription className="text-center">
          Are you sure you want to update this doctor's schedule? This will affect all future appointments.
        </DialogDescription>
        <DialogFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setShowConfirmation(false)}>
            Go Back
          </Button>
          <Button onClick={handleSave}>
            <Check className="h-4 w-4 mr-1" />
            Confirm Update
          </Button>
        </DialogFooter>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-h-[70vh] overflow-y-auto p-2 sm:p-4">
      {schedules.map(schedule => (
        <div key={schedule.dayOfWeek} className="border rounded-xl p-4 bg-card shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3">
            <h3 className="font-semibold text-base sm:text-lg">{dayNames[schedule.dayOfWeek]}</h3>
            <div className="flex items-center gap-2">
              <Label htmlFor={`status-${schedule.dayOfWeek}`} className="text-sm">
                Status:
              </Label>
              <select
                id={`status-${schedule.dayOfWeek}`}
                value={schedule.status}
                onChange={(e) => updateStatus(schedule.dayOfWeek, e.target.value)}
                className="text-sm p-1 rounded-md border border-input bg-background"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <Label htmlFor={`consultation-${schedule.dayOfWeek}`} className="text-sm whitespace-nowrap">
              Avg. Consultation (min):
            </Label>
            <Input
              id={`consultation-${schedule.dayOfWeek}`}
              type="number"
              min="2"
              max="60"
              value={schedule.avgConsultationTime}
              onChange={(e) => updateConsultationTime(schedule.dayOfWeek, e.target.value)}
              className="w-24 h-9 text-sm"
            />
          </div>

          <div className="space-y-3">
            {schedule.timeRanges.map((range, index) => (
              <div key={index} className="flex flex-wrap sm:flex-nowrap items-center gap-2">
                <Input
                  type="time"
                  value={range.start}
                  onChange={(e) => updateTimeRange(schedule.dayOfWeek, index, 'start', e.target.value)}
                  className="w-[6.5rem] sm:w-28 h-9 text-sm"
                />
                <span className="text-sm">to</span>
                <Input
                  type="time"
                  value={range.end}
                  onChange={(e) => updateTimeRange(schedule.dayOfWeek, index, 'end', e.target.value)}
                  className="w-[6.5rem] sm:w-28 h-9 text-sm"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeTimeRange(schedule.dayOfWeek, index)}
                  disabled={schedule.timeRanges.length === 1}
                  className="text-destructive"
                >
                  <Minus className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => addTimeRange(schedule.dayOfWeek)}
              className="mt-2"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Time Slot
            </Button>
          </div>
        </div>
      ))}

      <DialogFooter className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={() => setShowConfirmation(true)}>
          <Save className="h-4 w-4 mr-1" />
          Save Changes
        </Button>
      </DialogFooter>
    </div>
  );
};

export default ScheduleEditor;