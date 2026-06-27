import React, { useEffect, useRef } from 'react';
import {
  format,
  startOfWeek,
  eachDayOfInterval,
  addDays,
  isSameDay,
  isToday,
} from 'date-fns';
import { useCalendar } from '../context/CalendarContext';

interface WeekViewProps {
  onEventClick: (event: any) => void;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const CELL_HEIGHT = 60; // px per hour

const WeekView: React.FC<WeekViewProps> = ({ onEventClick }) => {
  const { currentDate, events } = useCalendar();
  const scrollRef = useRef<HTMLDivElement>(null);

  const weekStart = startOfWeek(currentDate);
  const days = eachDayOfInterval({ start: weekStart, end: addDays(weekStart, 6) });

  // Scroll to current hour on mount
  useEffect(() => {
    if (scrollRef.current) {
      const hour = new Date().getHours();
      scrollRef.current.scrollTop = Math.max(0, (hour - 1) * CELL_HEIGHT);
    }
  }, []);

  const getEventsForDay = (day: Date) =>
    events.filter((e) => isSameDay(new Date(e.startTime), day));

  const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();

  return (
    <div className="h-full flex flex-col" style={{ background: 'var(--bg-primary)' }}>
      {/* Sticky Header */}
      <div
        className="flex shrink-0 sticky top-0 z-20"
        style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}
      >
        <div className="w-16 shrink-0" style={{ borderRight: '1px solid var(--border)' }} />
        {days.map((day) => (
          <div
            key={day.toString()}
            className="flex-1 py-3 text-center"
            style={{ borderRight: '1px solid var(--border)' }}
          >
            <p
              className="text-[10px] font-bold uppercase tracking-widest"
              style={{ color: isToday(day) ? 'var(--accent)' : 'var(--text-muted)' }}
            >
              {format(day, 'EEE')}
            </p>
            <p
              className="text-2xl font-bold mt-0.5"
              style={{ color: isToday(day) ? 'var(--accent)' : 'var(--text-primary)' }}
            >
              {format(day, 'd')}
            </p>
          </div>
        ))}
      </div>

      {/* Scrollable body */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto flex" style={{ position: 'relative' }}>
        {/* Time labels */}
        <div className="w-16 shrink-0" style={{ borderRight: '1px solid var(--border)' }}>
          {HOURS.map((hour) => (
            <div
              key={hour}
              className="flex items-start justify-end pr-3 pt-1"
              style={{ height: CELL_HEIGHT, borderBottom: '1px solid var(--border)' }}
            >
              <span className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>
                {hour === 0 ? '' : format(new Date(2000, 0, 1, hour), 'HH:mm')}
              </span>
            </div>
          ))}
        </div>

        {/* Day columns */}
        {days.map((day) => {
          const dayEvents = getEventsForDay(day);
          const isCurrentDay = isToday(day);

          return (
            <div
              key={day.toString()}
              className="flex-1 relative"
              style={{ borderRight: '1px solid var(--border)' }}
            >
              {/* Hour rows */}
              {HOURS.map((hour) => (
                <div
                  key={hour}
                  className="time-slot"
                  style={{ height: CELL_HEIGHT, borderBottom: '1px solid var(--border)' }}
                />
              ))}

              {/* Now indicator */}
              {isCurrentDay && (
                <div
                  className="now-indicator"
                  style={{ top: (nowMinutes / 60) * CELL_HEIGHT }}
                />
              )}

              {/* Events */}
              {dayEvents.map((event) => {
                const start = new Date(event.startTime);
                const end = new Date(event.endTime);
                const topPx = (start.getHours() * 60 + start.getMinutes()) / 60 * CELL_HEIGHT;
                const durationMins = (end.getTime() - start.getTime()) / 60000;
                const heightPx = Math.max(22, (durationMins / 60) * CELL_HEIGHT);
                const isHoliday = event.isHoliday;

                return (
                  <div
                    key={event._id}
                    onClick={() => {
                      if (!isHoliday) onEventClick(event);
                    }}
                    style={{
                      position: 'absolute',
                      top: topPx,
                      left: 4,
                      right: 4,
                      height: heightPx,
                      background: isHoliday ? '#10b981' : (event.color || 'var(--accent)'),
                      borderRadius: 6,
                      padding: '3px 6px',
                      cursor: isHoliday ? 'default' : 'pointer',
                      zIndex: 10,
                      overflow: 'hidden',
                      boxShadow: `0 2px 8px ${isHoliday ? '#10b981' : (event.color || 'var(--accent)')}55`,
                      transition: 'filter 0.15s ease, transform 0.1s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!isHoliday) {
                        (e.currentTarget as HTMLElement).style.filter = 'brightness(1.15)';
                        (e.currentTarget as HTMLElement).style.zIndex = '20';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isHoliday) {
                        (e.currentTarget as HTMLElement).style.filter = 'brightness(1)';
                        (e.currentTarget as HTMLElement).style.zIndex = '10';
                      }
                    }}
                  >
                    <p className="text-[10px] font-bold text-white leading-tight truncate">{event.title}</p>
                    {heightPx > 30 && (
                      <p className="text-[9px] text-white/70 leading-tight">
                        {isHoliday ? 'All day holiday' : `${format(start, 'HH:mm')} – ${format(end, 'HH:mm')}`}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeekView;
