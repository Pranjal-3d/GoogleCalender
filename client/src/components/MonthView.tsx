import React from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  isSameDay,
  isSameMonth,
  isToday,
} from 'date-fns';
import { useCalendar } from '../context/CalendarContext';

interface MonthViewProps {
  onEventClick: (event: any) => void;
  onCellClick: (date: Date) => void;
  onDropDraft?: (date: Date, draft: any) => void;
}

const EVENT_COLORS: Record<string, string> = {
  '#6366f1': 'rgba(99,102,241,0.25)',
  '#ef4444': 'rgba(239,68,68,0.25)',
  '#10b981': 'rgba(16,185,129,0.25)',
  '#f59e0b': 'rgba(245,158,11,0.25)',
  '#3b82f6': 'rgba(59,130,246,0.25)',
  '#8b5cf6': 'rgba(139,92,246,0.25)',
  '#ec4899': 'rgba(236,72,153,0.25)',
};

const MonthView: React.FC<MonthViewProps> = ({ onEventClick, onCellClick, onDropDraft }) => {
  const { currentDate, events } = useCalendar();

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentDate)),
    end: endOfWeek(endOfMonth(currentDate)),
  });

  const getEventsForDay = (day: Date) =>
    events.filter((e) => isSameDay(new Date(e.startTime), day));

  return (
    <div className="h-full flex flex-col" style={{ background: 'var(--bg-primary)' }}>
      {/* Day Headers */}
      <div className="calendar-grid-header shrink-0">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div
            key={d}
            className="py-2.5 text-center text-[10px] sm:text-[11px] font-bold uppercase tracking-widest"
            style={{ color: 'var(--text-muted)' }}
          >
            <span className="hidden sm:inline">{d}</span>
            <span className="sm:hidden">{d[0]}</span>
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="calendar-grid-body flex-1 overflow-y-auto min-h-0">
        {days.map((day, i) => {
          const dayEvents = getEventsForDay(day);
          const inMonth = isSameMonth(day, currentDate);
          const today = isToday(day);

          return (
            <div
              key={i}
              className="calendar-cell flex flex-col p-1.5 transition-colors hover:bg-gray-50/50 group"
              style={{ opacity: inMonth ? 1 : 0.35 }}
              onClick={() => onCellClick(day)}
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.style.backgroundColor = 'rgba(26, 115, 232, 0.05)';
              }}
              onDragLeave={(e) => {
                e.currentTarget.style.backgroundColor = '';
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.style.backgroundColor = '';
                const draftData = e.dataTransfer.getData('draft');
                if (draftData && onDropDraft) {
                  onDropDraft(day, JSON.parse(draftData));
                }
              }}
            >
              {/* Date Number */}
              <div className="flex items-center justify-center mb-1">
                <span
                  className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold transition-all"
                  style={{
                    background: today ? 'var(--accent)' : 'transparent',
                    color: today ? '#fff' : 'var(--text-secondary)',
                    boxShadow: today ? '0 0 12px var(--accent-glow)' : 'none',
                  }}
                >
                  {format(day, 'd')}
                </span>
              </div>

              {/* Events */}
              <div className="flex-1 overflow-hidden space-y-0.5">
                {dayEvents.slice(0, 3).map((event) => {
                  const isHoliday = event.isHoliday;
                  return (
                    <div
                      key={event._id}
                      className="event-pill"
                      style={{
                        background: isHoliday ? '#10b981' : (event.color || 'var(--accent)'),
                        color: '#fff',
                        cursor: isHoliday ? 'default' : 'pointer',
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isHoliday) onEventClick(event);
                      }}
                      title={event.title}
                    >
                      {!isHoliday && format(new Date(event.startTime), 'HH:mm')} {event.title}
                    </div>
                  );
                })}
                {dayEvents.length > 3 && (
                  <div
                    className="text-[10px] font-semibold pl-2"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    +{dayEvents.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MonthView;
