import React from 'react';
import {
  format,
  startOfYear,
  eachMonthOfInterval,
  endOfYear,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  isSameDay,
  isSameMonth,
  isToday,
} from 'date-fns';
import { useCalendar } from '../context/CalendarContext';

interface YearViewProps {
  onCellClick: (date: Date) => void;
}

const YearView: React.FC<YearViewProps> = ({ onCellClick }) => {
  const { currentDate, setCurrentDate, events } = useCalendar();
  const year = currentDate.getFullYear();

  const months = eachMonthOfInterval({
    start: startOfYear(currentDate),
    end: endOfYear(currentDate),
  });

  const getDayDots = (day: Date) => {
    const dayEvents = events.filter(e => isSameDay(new Date(e.startTime), day));
    if (dayEvents.length === 0) return null;
    const hasHoliday = dayEvents.some(e => e.isHoliday);
    const hasOther = dayEvents.some(e => !e.isHoliday);
    return (
      <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-0.5">
        {hasHoliday && <span className="w-1 h-1 rounded-full bg-[#10b981] inline-block" />}
        {hasOther && <span className="w-1 h-1 rounded-full bg-[#1a73e8] inline-block" />}
      </div>
    );
  };

  return (
    <div className="h-full overflow-y-auto bg-white p-4">
      <div className="grid grid-cols-4 gap-6 max-w-5xl mx-auto">
        {months.map(monthStart => {
          const days = eachDayOfInterval({
            start: startOfWeek(startOfMonth(monthStart)),
            end: endOfWeek(endOfMonth(monthStart)),
          });

          return (
            <div key={monthStart.toString()} className="select-none">
              <h3
                className="text-[13px] font-medium text-[#3c4043] mb-2 cursor-pointer hover:text-[#1a73e8]"
                onClick={() => { setCurrentDate(monthStart); }}
              >
                {format(monthStart, 'MMMM')}
              </h3>
              
              <div className="grid grid-cols-7 mb-1">
                {['S','M','T','W','T','F','S'].map((d, i) => (
                  <div key={i} className="text-center text-[9px] text-[#70757a] pb-0.5">{d}</div>
                ))}
              </div>

              <div className="grid grid-cols-7">
                {days.map((day, idx) => {
                  const inMonth = isSameMonth(day, monthStart);
                  const today = isToday(day);
                  return (
                    <div
                      key={idx}
                      onClick={() => onCellClick(day)}
                      className={`relative flex items-center justify-center text-[10px] cursor-pointer rounded-full transition-colors
                        h-6 w-6 mx-auto
                        ${!inMonth ? 'text-[#ccc]' : 'text-[#3c4043] hover:bg-blue-50'}
                        ${today ? 'bg-[#1a73e8] text-white font-bold hover:bg-[#1a73e8]' : ''}
                      `}
                    >
                      {format(day, 'd')}
                      {inMonth && getDayDots(day)}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default YearView;
