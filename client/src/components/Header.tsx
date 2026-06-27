import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Menu,
  Search,
  Plus,
  Calendar,
  X,
  Check,
  ChevronDown,
  Target,
  Zap,
  Clock
} from 'lucide-react';
import { useCalendar } from '../context/CalendarContext';
import {
  format,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
  addYears,
  subYears
} from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import CreateTypePicker, { EventType } from './CreateTypePicker';

interface HeaderProps {
  onOpenModal: (type: EventType) => void;
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ onOpenModal, onToggleSidebar, sidebarOpen }) => {
  const { currentDate, setCurrentDate, viewMode, setViewMode, settings, setSettings, searchQuery, setSearchQuery } = useCalendar();
  const [searchOpen, setSearchOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [viewDropdownOpen, setViewDropdownOpen] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const createBtnRef = useRef<HTMLButtonElement>(null);
  const viewBtnRef = useRef<HTMLDivElement>(null);

  const navigate = (direction: 'prev' | 'next') => {
    let fn: any;
    switch (viewMode) {
      case 'month': fn = direction === 'prev' ? subMonths : addMonths; break;
      case 'week': 
      case '4days': fn = direction === 'prev' ? subWeeks : addWeeks; break; // Approximating jump
      case 'day': fn = direction === 'prev' ? subDays : addDays; break;
      case 'year': fn = direction === 'prev' ? subYears : addYears; break;
      default: fn = direction === 'prev' ? subDays : addDays;
    }
    setCurrentDate(fn(currentDate, 1));
  };

  const viewOptions = [
    { key: 'day', label: 'Day', shortcut: 'D' },
    { key: 'week', label: 'Week', shortcut: 'W' },
    { key: 'month', label: 'Month', shortcut: 'M' },
    { key: 'year', label: 'Year', shortcut: 'Y' },
    { key: 'schedule', label: 'Schedule', shortcut: 'A' },
    { key: '4days', label: '4 days', shortcut: 'X' },
  ];

  const handleSelect = (type: EventType) => {
    setPickerOpen(false);
    onOpenModal(type);
  };

  const getViewLabel = () => {
    const opt = viewOptions.find(o => o.key === viewMode);
    return opt ? opt.label : 'Month';
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (viewBtnRef.current && !viewBtnRef.current.contains(e.target as Node)) {
        setViewDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <>
      <header className="h-[64px] flex items-center px-4 gap-2 flex-shrink-0 bg-white border-b border-[#dadce0]">
        <div className="flex items-center gap-1 mr-2">
           <button 
             onClick={onToggleSidebar}
             className="p-2.5 rounded-full hover:bg-gray-100 text-[#5f6368] transition-colors"
             title={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
           >
              <Menu size={20} />
           </button>
           <div className="flex items-center gap-2 ml-1 cursor-pointer">
              <Calendar size={28} className="text-[#1a73e8]" />
              <span className="text-[22px] text-[#5f6368] font-normal tracking-tight">Calendar</span>
           </div>
        </div>

        <button
          onClick={() => setCurrentDate(new Date())}
          className="ml-4 px-4 py-1.5 rounded border border-[#dadce0] text-[14px] font-medium text-[#3c4043] hover:bg-gray-50 transition-colors"
        >
          Today
        </button>

        <div className="flex items-center gap-1 ml-2">
           <button onClick={() => navigate('prev')} className="p-2 rounded-full hover:bg-gray-100 text-[#5f6368]">
              <ChevronLeft size={18} />
           </button>
           <button onClick={() => navigate('next')} className="p-2 rounded-full hover:bg-gray-100 text-[#5f6368]">
              <ChevronRight size={18} />
           </button>
        </div>

        <h2 className="text-[22px] text-[#3c4043] font-normal ml-2">
          {format(currentDate, viewMode === 'day' ? 'MMMM d, yyyy' : 'MMMM yyyy')}
        </h2>

        <div className="flex-1 max-w-2xl mx-8">
           <div className={`relative flex items-center transition-all duration-300 ${searchOpen ? 'w-full' : 'w-48'} group`}>
              <Search size={18} className="absolute left-3 text-[#5f6368] group-focus-within:text-[#1a73e8]" />
              <input 
                type="text"
                placeholder="Search events, people, goals..."
                value={searchQuery}
                onFocus={() => setSearchOpen(true)}
                onBlur={() => !searchQuery && setSearchOpen(false)}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#f1f3f4] border-none rounded-lg py-2.5 pl-11 pr-4 text-sm focus:bg-white focus:ring-2 focus:ring-[#1a73e8]/20 focus:shadow-sm outline-none transition-all"
              />
           </div>
        </div>

        <div className="flex items-center gap-2 pr-2">
           {/* Daily Progress */}
           <div className="hidden lg:flex flex-col items-end mr-4">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#5f6368] uppercase tracking-wider">
                <Clock size={12} />
                Day Progress
              </div>
              <div className="w-32 h-1.5 bg-gray-100 rounded-full mt-1.5 overflow-hidden border border-gray-200">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '65%' }} // Mocked progress
                  className="h-full bg-gradient-to-r from-[#1a73e8] to-[#6366f1]"
                />
              </div>
           </div>

           {/* Focus Mode Toggle */}
           <button 
             onClick={() => setFocusMode(!focusMode)}
             className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${focusMode ? 'bg-[#1a73e8] border-[#1a73e8] text-white shadow-lg' : 'bg-white border-[#dadce0] text-[#3c4043] hover:bg-gray-50'}`}
             title="Toggle Focus Mode"
           >
              <Target size={16} className={focusMode ? 'animate-pulse' : ''} />
              <span className="text-[13px] font-semibold">{focusMode ? 'Focusing' : 'Focus Mode'}</span>
           </button>

           <div className="w-px h-8 bg-gray-200 mx-2" />
           
           {/* View Selector Dropdown */}
           <div className="relative" ref={viewBtnRef}>
              <button 
                onClick={() => setViewDropdownOpen(!viewDropdownOpen)}
                className="flex items-center gap-1 px-3 py-1.5 rounded border border-[#dadce0] hover:bg-gray-50 text-[14px] font-medium text-[#3c4043]"
              >
                <span>{getViewLabel()}</span>
                <ChevronDown size={14} className="mt-0.5" />
              </button>

              <AnimatePresence>
                {viewDropdownOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 top-full mt-1 w-[240px] bg-white shadow-xl rounded-lg border border-[#dadce0] py-2 z-[100]"
                  >
                    {viewOptions.map((opt) => (
                      <button
                        key={opt.key}
                        onClick={() => { setViewMode(opt.key as any); setViewDropdownOpen(false); }}
                        className="w-full flex items-center justify-between px-4 py-2 hover:bg-gray-100 text-[14px] text-[#3c4043]"
                      >
                        <span>{opt.label}</span>
                        <span className="text-[#70757a] text-[12px]">{opt.shortcut}</span>
                      </button>
                    ))}
                    
                    <div className="h-[1px] bg-[#dadce0] my-2" />
                    
                    <button 
                      onClick={() => setSettings({ showWeekends: !settings.showWeekends })}
                      className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 text-[14px] text-[#3c4043]"
                    >
                      <div className="w-4 h-4 flex items-center justify-center">
                        {settings.showWeekends && <Check size={14} className="text-[#1a73e8]" />}
                      </div>
                      <span>Show weekends</span>
                    </button>
                    
                    <button 
                      onClick={() => setSettings({ showDeclinedEvents: !settings.showDeclinedEvents })}
                      className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 text-[14px] text-[#3c4043]"
                    >
                      <div className="w-4 h-4 flex items-center justify-center">
                        {settings.showDeclinedEvents && <Check size={14} className="text-[#1a73e8]" />}
                      </div>
                      <span>Show declined events</span>
                    </button>
                    
                    <button 
                      onClick={() => setSettings({ showCompletedTasks: !settings.showCompletedTasks })}
                      className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 text-[14px] text-[#3c4043]"
                    >
                      <div className="w-4 h-4 flex items-center justify-center">
                        {settings.showCompletedTasks && <Check size={14} className="text-[#1a73e8]" />}
                      </div>
                      <span>Show completed tasks</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
           </div>

           <button
             ref={createBtnRef}
             onClick={() => setPickerOpen((p) => !p)}
             className="flex items-center gap-2 ml-4 pl-2 pr-5 py-2.5 bg-white border border-[#dadce0] rounded-full shadow hover:shadow-md transition-all group"
           >
             <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white group-hover:bg-gray-50 text-[#1a73e8]">
                 <Plus size={24} strokeWidth={2.5} />
             </div>
             <span className="text-[14px] font-medium text-[#3c4043]">Create</span>
           </button>
        </div>
      </header>

      {/* Type Picker dropdown */}
      {pickerOpen && (
        <CreateTypePicker
          anchorRef={createBtnRef}
          onSelect={handleSelect}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </>
  );
};

export default Header;
