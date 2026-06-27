import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useCalendar } from '../context/CalendarContext';
import MonthView from './MonthView';
import WeekView from './WeekView';
import DayView from './DayView';
import TasksView from './TasksView';
import YearView from './YearView';
import FourDayView from './FourDayView';
import ScheduleView from './ScheduleView';

interface CalendarViewProps {
  onEventClick: (event: any) => void;
  onCellClick: (date: Date) => void;
  onDropDraft?: (date: Date, draft: any) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ onEventClick, onCellClick, onDropDraft }) => {
  const { viewMode } = useCalendar();

  const variants = {
    initial: { opacity: 0, scale: 0.99 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.99 },
  };

  return (
    <div className="h-full w-full overflow-hidden bg-white">
      <AnimatePresence mode="wait">
        <motion.div
          key={viewMode}
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="h-full w-full"
        >
          {viewMode === 'month' && (
            <MonthView 
              onEventClick={onEventClick} 
              onCellClick={onCellClick} 
              onDropDraft={onDropDraft}
            />
          )}
          {viewMode === 'week' && <WeekView onEventClick={onEventClick} />}
          {viewMode === 'day' && <DayView onEventClick={onEventClick} />}
          {viewMode === 'year' && <YearView onCellClick={onCellClick} />}
          {viewMode === '4days' && <FourDayView onEventClick={onEventClick} />}
          {viewMode === 'schedule' && <ScheduleView onEventClick={onEventClick} />}
          {viewMode === 'tasks' && <TasksView />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default CalendarView;
