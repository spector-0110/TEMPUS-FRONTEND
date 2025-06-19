'use client';

import { Clock } from 'lucide-react';

/**
 * Component to display a doctor's schedule in a read-only view
 */
const DoctorScheduleViewer = ({ schedules }) => {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  return (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto p-2">
      {schedules.map((schedule) => (
        <div key={schedule.id} className="border rounded-lg p-3 bg-card">
          <div className="font-medium text-lg mb-2">{dayNames[schedule.dayOfWeek]}</div>
          <div className="text-sm text-muted-foreground mb-2">
            Average consultation: {schedule.avgConsultationTime} min
          </div>
          <div className="space-y-2">
            {schedule.timeRanges.map((range, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-primary" />
                <span>{range.start} - {range.end}</span>
              </div>
            ))}
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            Status: <span className={schedule.status === 'active' ? 'text-success' : 'text-destructive'}>
              {schedule.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DoctorScheduleViewer;
