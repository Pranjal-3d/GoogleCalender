import React from 'react';
import {
  format,
  addDays,
  isToday,
  isSameDay,
  isFuture,
  startOfDay,
  eachDayOfInterval,
  addMonths,
} from 'date-fns';
import { useCalendar } from '../context/CalendarContext';
import { MapPin, Clock } from 'lucide-react';

interface ScheduleViewProps {
  onEventClick: (event: any) => void;
}

const ScheduleView: React.FC<ScheduleViewProps> = ({ onEventClick }) => {
  const { currentDate, events } = useCalendar();

  // Show next 90 days starting from currentDate
  const days = eachDayOfInterval({
    start: startOfDay(currentDate),
    end: addDays(startOfDay(currentDate), 89),
  });

  // Days that have at least one event
  const daysWithEvents = days.filter(day =>
    events.some(e => isSameDay(new Date(e.startTime), day))
  );

  if (daysWithEvents.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-white text-[#5f6368]">
        <Clock size={48} className="mb-4 opacity-20" />
        <p className="text-lg font-normal">No upcoming events</p>
        <p className="text-sm mt-1">Create one to get started.</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-white">
      {daysWithEvents.map(day => {
        const dayEvents = events
          .filter(e => isSameDay(new Date(e.startTime), day))
          .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

        const today = isToday(day);
        
        return (
          <div key={day.toString()} className="flex border-b border-[#e8eaed] hover:bg-gray-50 transition-colors">
            {/* Date column */}
            <div className="w-[100px] shrink-0 flex flex-col items-center pt-4 pb-4 px-3">
              <p className="text-[11px] text-[#70757a] uppercase font-medium mb-1">
                {format(day, 'EEE')}
              </p>
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[16px] font-normal
                ${today ? 'bg-[#1a73e8] text-white' : 'text-[#3c4043]'}`}
              >
                {format(day, 'd')}
              </div>
              {today && (
                <span className="text-[10px] text-[#1a73e8] font-medium mt-0.5">Today</span>
              )}
            </div>

            {/* Events for this day */}
            <div className="flex-1 py-2 space-y-1.5">
              {dayEvents.map(event => {
                const start = new Date(event.startTime);
                const end = new Date(event.endTime);
                const isHoliday = event.isHoliday;
                const color = isHoliday ? '#10b981' : (event.color || '#1a73e8');

                return (
                  <div
                    key={event._id}
                    onClick={() => !isHoliday && onEventClick(event)}
                    className={`flex items-start gap-3 px-4 py-2 rounded-lg mx-2 ${isHoliday ? 'cursor-default' : 'cursor-pointer hover:bg-gray-100'} transition-colors`}
                  >
                    {/* Color bar */}
                    <div className="w-3 h-3 rounded-full mt-1 shrink-0" style={{ background: color }} />

                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-medium text-[#1f1f1f] truncate">
                        {event.title}
                        {isHoliday && <span className="ml-2 text-[11px] bg-green-100 text-green-700 rounded px-1.5 py-0.5">Holiday</span>}
                      </p>
                      
                      <div className="flex items-center gap-3 mt-0.5 text-[12px] text-[#70757a]">
                        {!isHoliday && (
                          <span className="flex items-center gap-1">
                            <Clock size={11} />
                            {format(start, 'h:mm a')} – {format(end, 'h:mm a')}
                          </span>
                        )}
                        {event.location && (
                          <span className="flex items-center gap-1">
                            <MapPin size={11} />
                            {event.location}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ScheduleView;
