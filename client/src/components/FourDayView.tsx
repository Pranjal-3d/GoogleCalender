import React, { useEffect, useRef } from 'react';
import {
  format,
  startOfDay,
  isSameDay,
  isToday,
  addDays,
} from 'date-fns';
import { useCalendar } from '../context/CalendarContext';

interface FourDayViewProps {
  onEventClick: (event: any) => void;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const CELL_HEIGHT = 60;

const FourDayView: React.FC<FourDayViewProps> = ({ onEventClick }) => {
  const { currentDate, events } = useCalendar();
  const scrollRef = useRef<HTMLDivElement>(null);

  const days = Array.from({ length: 4 }, (_, i) => addDays(currentDate, i));

  useEffect(() => {
    if (scrollRef.current) {
      const hour = new Date().getHours();
      scrollRef.current.scrollTop = Math.max(0, (hour - 1) * CELL_HEIGHT);
    }
  }, []);

  const getEventsForDay = (day: Date) =>
    events.filter(e => isSameDay(new Date(e.startTime), day));

  const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Sticky Header */}
      <div
        className="flex shrink-0 sticky top-0 z-20 bg-white border-b border-[#dadce0]"
      >
        <div className="w-16 shrink-0 border-r border-[#dadce0]" />
        {days.map((day) => (
          <div
            key={day.toString()}
            className="flex-1 py-3 text-center border-r border-[#dadce0]"
          >
            <p className={`text-[10px] font-bold uppercase tracking-widest ${isToday(day) ? 'text-[#1a73e8]' : 'text-[#70757a]'}`}>
              {format(day, 'EEE')}
            </p>
            <p className={`text-2xl font-normal mt-0.5 ${isToday(day) ? 'text-[#1a73e8]' : 'text-[#3c4043]'}`}>
              {format(day, 'd')}
            </p>
          </div>
        ))}
      </div>

      {/* Scrollable Body */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto flex">
        {/* Time labels */}
        <div className="w-16 shrink-0 border-r border-[#dadce0]">
          {HOURS.map(h => (
            <div key={h} className="flex items-start justify-end pr-3 pt-1" style={{ height: CELL_HEIGHT, borderBottom: '1px solid #dadce0' }}>
              <span className="text-[10px] text-[#70757a]">
                {h === 0 ? '' : format(new Date(2000, 0, 1, h), 'h a')}
              </span>
            </div>
          ))}
        </div>

        {/* Day columns */}
        {days.map(day => {
          const dayEvents = getEventsForDay(day);
          const isCurrentDay = isToday(day);
          return (
            <div key={day.toString()} className="flex-1 relative border-r border-[#dadce0]">
              {HOURS.map(h => (
                <div key={h} style={{ height: CELL_HEIGHT, borderBottom: '1px solid #e8eaed' }} />
              ))}

              {isCurrentDay && (
                <div
                  className="absolute left-0 right-0 z-10"
                  style={{ top: (nowMinutes / 60) * CELL_HEIGHT }}
                >
                  <div className="relative w-full h-[2px] bg-[#1a73e8]">
                    <div className="absolute -left-1 -top-[4px] w-[10px] h-[10px] rounded-full bg-[#1a73e8]" />
                  </div>
                </div>
              )}

              {dayEvents.filter(e => !e.isHoliday).map(event => {
                const start = new Date(event.startTime);
                const end = new Date(event.endTime);
                const topPx = (start.getHours() * 60 + start.getMinutes()) / 60 * CELL_HEIGHT;
                const durationMins = (end.getTime() - start.getTime()) / 60000;
                const heightPx = Math.max(22, (durationMins / 60) * CELL_HEIGHT);
                return (
                  <div
                    key={event._id}
                    onClick={() => onEventClick(event)}
                    style={{
                      position: 'absolute', top: topPx, left: 4, right: 4, height: heightPx,
                      background: event.color || '#1a73e8', borderRadius: 4, padding: '2px 6px',
                      cursor: 'pointer', zIndex: 10, overflow: 'hidden',
                    }}
                    className="hover:brightness-110 transition-all"
                  >
                    <p className="text-[10px] font-medium text-white truncate">{event.title}</p>
                    {heightPx > 30 && (
                      <p className="text-[9px] text-white/80">{format(start, 'h:mm a')}</p>
                    )}
                  </div>
                );
              })}

              {/* Holiday banner at top */}
              {dayEvents.filter(e => e.isHoliday).map(event => (
                <div
                  key={event._id}
                  className="absolute top-0 left-0 right-0 text-[9px] font-semibold text-[#10b981] px-2 py-0.5 truncate bg-green-50 border-b border-green-100"
                >
                  {event.title}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FourDayView;
