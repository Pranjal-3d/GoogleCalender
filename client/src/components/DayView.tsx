import React, { useEffect, useRef } from 'react';
import { format, isSameDay, isToday } from 'date-fns';
import { MapPin, AlignLeft } from 'lucide-react';
import { useCalendar } from '../context/CalendarContext';

interface DayViewProps {
  onEventClick: (event: any) => void;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const CELL_HEIGHT = 64;

const DayView: React.FC<DayViewProps> = ({ onEventClick }) => {
  const { currentDate, events } = useCalendar();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      const hour = new Date().getHours();
      scrollRef.current.scrollTop = Math.max(0, (hour - 2) * CELL_HEIGHT);
    }
  }, []);

  const dayEvents = events.filter((e) => isSameDay(new Date(e.startTime), currentDate));
  const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();

  return (
    <div className="h-full flex flex-col" style={{ background: 'var(--bg-primary)' }}>
      {/* Header */}
      <div
        className="px-6 py-4 shrink-0 flex items-end gap-4"
        style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}
      >
        <div>
          <p
            className="text-[10px] font-bold uppercase tracking-widest mb-0.5"
            style={{ color: isToday(currentDate) ? 'var(--accent)' : 'var(--text-muted)' }}
          >
            {format(currentDate, 'EEEE')}
          </p>
          <p
            className="text-4xl font-bold"
            style={{ color: isToday(currentDate) ? 'var(--accent)' : 'var(--text-primary)' }}
          >
            {format(currentDate, 'd')}
          </p>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {format(currentDate, 'MMMM yyyy')}
          </p>
        </div>
        <div className="ml-8 flex items-center gap-2 pb-1">
          <span
            className="text-xs font-medium px-3 py-1 rounded-full"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            {dayEvents.length} event{dayEvents.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Time grid */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto flex">
        {/* Hour labels */}
        <div className="w-20 shrink-0" style={{ borderRight: '1px solid var(--border)' }}>
          {HOURS.map((h) => (
            <div
              key={h}
              className="flex items-start justify-end pr-3 pt-1"
              style={{ height: CELL_HEIGHT, borderBottom: '1px solid var(--border)' }}
            >
              <span className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>
                {h === 0 ? '' : format(new Date(2000, 0, 1, h), 'HH:mm')}
              </span>
            </div>
          ))}
        </div>

        {/* Event area */}
        <div className="flex-1 relative">
          {HOURS.map((h) => (
            <div
              key={h}
              className="time-slot"
              style={{ height: CELL_HEIGHT, borderBottom: '1px solid var(--border)' }}
            />
          ))}

          {/* Now indicator */}
          {isToday(currentDate) && (
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
            const heightPx = Math.max(30, (durationMins / 60) * CELL_HEIGHT);
            const isHoliday = event.isHoliday;
            const eventColor = isHoliday ? '#10b981' : (event.color || 'var(--accent)');

            return (
              <div
                key={event._id}
                onClick={() => {
                  if (!isHoliday) onEventClick(event);
                }}
                style={{
                  position: 'absolute',
                  top: topPx,
                  left: 16,
                  right: 32,
                  height: heightPx,
                  background: `${eventColor}22`,
                  borderLeft: `3px solid ${eventColor}`,
                  borderRadius: '0 8px 8px 0',
                  padding: '6px 12px',
                  cursor: isHoliday ? 'default' : 'pointer',
                  zIndex: 10,
                  overflow: 'hidden',
                  backdropFilter: 'blur(4px)',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isHoliday) {
                    (e.currentTarget as HTMLElement).style.transform = 'scaleX(1.01)';
                    (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 20px ${eventColor}44`;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isHoliday) {
                    (e.currentTarget as HTMLElement).style.transform = 'scaleX(1)';
                    (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                  }
                }}
              >
                <div className="flex items-center justify-between">
                  <p
                    className="font-bold text-sm truncate"
                    style={{ color: eventColor }}
                  >
                    {isHoliday ? `Holiday: ${event.title}` : event.title}
                  </p>
                  <span className="text-[10px] shrink-0 ml-2" style={{ color: 'var(--text-muted)' }}>
                    {isHoliday ? 'All day' : `${format(start, 'HH:mm')} – ${format(end, 'HH:mm')}`}
                  </span>
                </div>
                {!isHoliday && heightPx > 50 && event.description && (
                  <div className="flex items-start gap-1.5 mt-1">
                    <AlignLeft size={11} style={{ color: 'var(--text-muted)', marginTop: 1 }} />
                    <p className="text-xs line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                      {event.description}
                    </p>
                  </div>
                )}
                {!isHoliday && heightPx > 70 && event.location && (
                  <div className="flex items-center gap-1.5 mt-1">
                    <MapPin size={11} style={{ color: 'var(--text-muted)' }} />
                    <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                      {event.location}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DayView;
