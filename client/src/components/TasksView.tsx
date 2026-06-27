import React from 'react';
import { format, isSameDay, isToday } from 'date-fns';
import { CheckCircle2, Circle, Clock, Tag } from 'lucide-react';
import { useCalendar } from '../context/CalendarContext';

const TasksView: React.FC = () => {
  const { rawEvents, settings } = useCalendar();

  const tasks = rawEvents.filter(e => e.eventType === 'task');
  
  const sortedTasks = [...tasks].sort((a, b) => 
    new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden">
      <div className="px-8 py-6 border-b border-gray-200">
        <h2 className="text-2xl font-normal text-[#1f1f1f]">My Tasks</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto px-8 py-4">
        {sortedTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-[#5f6368]">
             <CheckCircle2 size={48} className="mb-4 opacity-20" />
             <p>All tasks completed! Enjoy your day.</p>
          </div>
        ) : (
          <div className="max-w-3xl space-y-2">
            {sortedTasks.map((task) => {
              const start = new Date(task.startTime);
              const isPast = start < new Date() && !isToday(start);
              
              return (
                <div 
                  key={task._id}
                  className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all group"
                >
                  <button className="mt-1 text-[#5f6368] hover:text-[#1a73e8] transition-colors">
                     <Circle size={20} />
                  </button>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] text-[#1f1f1f] font-medium truncate group-hover:text-[#1a73e8]">
                      {task.title}
                    </p>
                    
                    <div className="flex items-center gap-4 mt-1 text-[13px] text-[#5f6368]">
                      <div className="flex items-center gap-1.5">
                        <Clock size={14} />
                        <span className={isPast ? 'text-red-500 font-medium' : ''}>
                          {format(start, 'EEE, MMM d')} • {format(start, 'p')}
                        </span>
                      </div>
                      
                      {task.description && (
                        <div className="flex items-center gap-1.5 truncate">
                          <Tag size={14} />
                          <span className="truncate">{task.description}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TasksView;
