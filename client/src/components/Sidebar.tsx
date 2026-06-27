import React, { useState } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  isSameDay,
  isSameMonth,
  addMonths,
  subMonths,
  isToday,
} from 'date-fns';
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Plus, 
  ExternalLink, 
  ChevronDown,
  Flame,
  Cloud,
  Thermometer,
  Zap,
  Coffee,
  UserCheck,
  GripVertical,
  Check,
  Target,
  X,
  Bell,
  BellOff,
  Clock8
} from 'lucide-react';
import { useCalendar } from '../context/CalendarContext';
import { AnimatePresence, motion } from 'framer-motion';

interface SidebarProps {
  onOpenBookingPage?: () => void;
}

const CALENDAR_COLORS = [
  '#1a73e8', '#039be5', '#33b679', '#0b8043', '#8e24aa',
  '#e67c73', '#f6bf26', '#f4511e', '#616161',
];

const Sidebar: React.FC<SidebarProps> = ({ onOpenBookingPage }) => {
  const { currentDate, setCurrentDate, events, viewMode, setViewMode, toggleCalendar, hiddenCalendars } = useCalendar();
  const [searchQuery, setSearchQuery] = useState('');
  const [myCalendarsOpen, setMyCalendarsOpen] = useState(true);
  const [otherCalendarsOpen, setOtherCalendarsOpen] = useState(true);
  const [showAddCalendarModal, setShowAddCalendarModal] = useState(false);
  const [newCalendarName, setNewCalendarName] = useState('');
  const [newCalendarColor, setNewCalendarColor] = useState('#1a73e8');
  const [otherCalendars, setOtherCalendars] = useState([
    { name: 'Holidays in India', color: '#10b981' },
    { name: 'Family', color: '#f4511e' },
  ]);

  const deleteOtherCalendar = (name: string) => {
    setOtherCalendars(prev => prev.filter(c => c.name !== name));
  };
  const [habits, setHabits] = useState<any[]>([]);
  const [showHabitModal, setShowHabitModal] = useState(false);
  const [editingHabit, setEditingHabit] = useState<any>(null);
  const [habitForm, setHabitForm] = useState({ name: '', emoji: '✨', alarmTime: '', isAlarmEnabled: false });

  React.useEffect(() => {
    const fetchHabits = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/habits`);
        const data = await res.json();
        if (data.length === 0) {
            // Seed habits if none exist
            await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/habits/seed`, { method: 'POST' });
            const reRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/habits`);
            setHabits(await reRes.json());
        } else {
            setHabits(data);
        }
      } catch (err) {
        console.error('Failed to fetch habits', err);
      }
    };
    fetchHabits();
  }, []);

  const toggleHabit = async (habitId: string) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/habits/${habitId}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: new Date().toISOString() })
      });
      if (res.ok) {
        const updated = await res.json();
        setHabits(prev => prev.map(h => h._id === habitId ? updated : h));
      }
    } catch (err) {
      console.error('Failed to toggle habit', err);
    }
  };

  const handleSaveHabit = async () => {
    if (!habitForm.name.trim()) return;
    try {
      const url = editingHabit ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/habits/${editingHabit._id}` : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/habits`;
      const method = editingHabit ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(habitForm)
      });
      if (res.ok) {
        const saved = await res.json();
        if (editingHabit) {
            setHabits(prev => prev.map(h => h._id === editingHabit._id ? saved : h));
        } else {
            setHabits(prev => [...prev, saved]);
        }
        setShowHabitModal(false);
        setEditingHabit(null);
        setHabitForm({ name: '', emoji: '✨', alarmTime: '', isAlarmEnabled: false });
      }
    } catch (err) {
      console.error('Failed to save habit', err);
    }
  };

  const deleteHabit = async (id: string) => {
    if (!window.confirm('Delete this habit?')) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/habits/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setHabits(prev => prev.filter(h => h._id !== id));
      }
    } catch (err) {
      console.error('Failed to delete habit', err);
    }
  };

  const miniDays = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentDate)),
    end: endOfWeek(endOfMonth(currentDate)),
  });

  const getDayIndicator = (day: Date) => {
    const dayEvents = events.filter(e => isSameDay(new Date(e.startTime), day));
    if (dayEvents.length === 0) return null;
    const hasHoliday = dayEvents.some(e => e.isHoliday);
    const hasOther = dayEvents.some(e => !e.isHoliday);
    return (
      <div className="absolute bottom-1 flex gap-0.5 justify-center w-full">
        {hasHoliday && <div className="w-1 h-1 rounded-full bg-[#10b981]" />}
        {hasOther && <div className="w-1 h-1 rounded-full bg-[#1a73e8]" />}
      </div>
    );
  };

  const handleAddCalendar = () => {
    if (!newCalendarName.trim()) return;
    setOtherCalendars(prev => [...prev, { name: newCalendarName.trim(), color: newCalendarColor }]);
    setNewCalendarName('');
    setNewCalendarColor('#1a73e8');
    setShowAddCalendarModal(false);
  };

  return (
    <>
      <aside
        className="w-[256px] h-full shrink-0 flex flex-col py-4 gap-3 overflow-y-auto"
        style={{ background: '#ffffff', borderRight: '1px solid #dadce0' }}
      >
        {/* Mini Calendar (Now First) */}
        <div className="px-3">
          <div className="flex items-center justify-between mb-1 px-1">
            <span className="text-[14px] font-medium text-[#3c4043]">
              {format(currentDate, 'MMMM yyyy')}
            </span>
            <div className="flex">
              <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-1.5 rounded-full hover:bg-gray-100 text-[#5f6368]">
                <ChevronLeft size={16} />
              </button>
              <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-1.5 rounded-full hover:bg-gray-100 text-[#5f6368]">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 mb-0.5">
            {['S','M','T','W','T','F','S'].map((d, i) => (
              <div key={i} className="text-center text-[11px] py-1 text-[#70757a] font-medium">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-y-0.5">
            {miniDays.map((day, idx) => {
              const isSel = isSameDay(day, currentDate);
              const today = isToday(day);
              const inMonth = isSameMonth(day, currentDate);
              return (
                <button
                  key={idx}
                  onClick={() => setCurrentDate(day)}
                  className={`relative h-7 w-7 mx-auto flex items-center justify-center rounded-full text-[11px] transition-all
                    ${!inMonth ? 'text-[#ccc]' : 'text-[#3c4043]'}
                    ${today ? 'bg-[#1a73e8] !text-white font-bold' : (isSel ? 'bg-[#d2e3fc] text-[#185abc] font-medium' : 'hover:bg-gray-100')}
                  `}
                >
                  {format(day, 'd')}
                  {inMonth && getDayIndicator(day)}
                </button>
              );
            })}
          </div>
        </div>

        <div className="h-px bg-[#e8eaed] mx-3" />

        {/* Search People */}
        <div className="px-3">
          <div className="relative group">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5f6368]" />
            <input
              type="text"
              placeholder="Search for people"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-[#f1f3f4] hover:bg-[#e8eaed] focus:bg-white focus:shadow-md rounded-full pl-9 pr-4 py-1.5 text-[13px] text-[#3c4043] focus:outline-none placeholder:text-[#5f6368] transition-all"
            />
          </div>
        </div>

        {/* Booking Pages */}
        <div className="px-3">
          <div
            className="flex items-center justify-between px-2 py-1 cursor-pointer rounded-md hover:bg-gray-50"
            onClick={() => onOpenBookingPage?.()}
          >
            <span className="text-[13px] font-medium text-[#3c4043]">Booking pages</span>
            <Plus size={16} className="text-[#5f6368]" />
          </div>
          <div
            onClick={() => onOpenBookingPage?.()}
            className="flex items-center gap-2 px-3 py-2 mt-0.5 rounded-lg hover:bg-gray-100 cursor-pointer"
          >
            <div className="w-4 h-4 rounded-full bg-[#1a73e8] flex items-center justify-center text-white text-[8px] font-bold">P</div>
            <span className="text-[13px] text-[#3c4043] flex-1">My booking page</span>
            <ExternalLink size={13} className="text-[#5f6368]" />
          </div>
        </div>

        <div className="h-px bg-[#e8eaed] mx-3" />

        {/* Quick Drafts */}
        <div className="px-3">
           <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-[12px] font-bold text-[#5f6368] uppercase tracking-widest">Quick Drafts</span>
              <GripVertical size={14} className="text-[#dadce0]" />
           </div>
           <div className="flex flex-wrap gap-2">
              {[
                { label: 'Coffee Sync', icon: <Coffee size={13} />, color: '#f59e0b' },
                { label: 'Briefing', icon: <UserCheck size={13} />, color: '#10b981' },
                { label: 'Deep Work', icon: <Target size={13} />, color: '#6366f1' },
              ].map((draft, i) => (
                <div 
                  key={i}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('draft', JSON.stringify({
                      title: draft.label,
                      color: draft.color,
                      type: 'event'
                    }));
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#dadce0] bg-white hover:border-[#1a73e8] hover:text-[#1a73e8] text-[#5f6368] text-[11px] font-medium transition-all cursor-grab active:cursor-grabbing shadow-sm hover:shadow"
                >
                   {draft.icon}
                   {draft.label}
                </div>
              ))}
           </div>
        </div>

        {/* Habit Tracker (Now After Quick Drafts) */}
        <div className="px-3">
           <div className="bg-[#f8f9fa] rounded-xl p-3 border border-[#dadce0]">
               <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <Flame size={16} className="text-orange-500" />
                    <span className="text-[12px] font-bold text-[#3c4043] uppercase tracking-wider">Daily Habits</span>
                  </div>
                  <button 
                    onClick={() => {
                        setEditingHabit(null);
                        setHabitForm({ name: '', emoji: '✨', alarmTime: '', isAlarmEnabled: false });
                        setShowHabitModal(true);
                    }}
                    className="p-1 rounded-full hover:bg-gray-200 text-[#5f6368]"
                  >
                    <Plus size={14} />
                  </button>
               </div>
              <div className="space-y-2">
                 {habits.map((habit) => {
                    const isDone = habit.completedDates?.some((d: string) => 
                      isSameDay(new Date(d), new Date())
                    );
                    return (
                      <div 
                        key={habit._id} 
                        className="group relative flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-all cursor-pointer"
                        onClick={() => toggleHabit(habit._id)}
                      >
                         <span className="text-sm shrink-0">{habit.emoji}</span>
                         <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                               <span className={`text-[12px] truncate ${isDone ? 'text-[#1f1f1f] font-medium line-through opacity-50' : 'text-[#3c4043]'}`}>
                                  {habit.name}
                               </span>
                               <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingHabit(habit);
                                        setHabitForm({ 
                                            name: habit.name, 
                                            emoji: habit.emoji, 
                                            alarmTime: habit.alarmTime || '', 
                                            isAlarmEnabled: habit.isAlarmEnabled || false 
                                        });
                                        setShowHabitModal(true);
                                    }}
                                    className="p-1 rounded-full hover:bg-gray-200 text-[#5f6368]"
                                  >
                                    <ChevronRight size={12} />
                                  </button>
                               </div>
                            </div>
                            {habit.alarmTime && (
                                <div className="flex items-center gap-1 mt-0.5">
                                    {habit.isAlarmEnabled ? <Bell size={10} className="text-[#1a73e8]" /> : <BellOff size={10} className="text-[#5f6368]" />}
                                    <span className="text-[10px] text-[#5f6368] font-medium">{habit.alarmTime}</span>
                                </div>
                            )}
                         </div>
                         <div className={`shrink-0 w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${isDone ? 'bg-[#1a73e8] border-[#1a73e8]' : 'border-gray-300'}`}>
                            {isDone && <Check size={10} className="text-white" />}
                         </div>
                      </div>
                    );
                 })}
              </div>
           </div>
        </div>

        <div className="h-px bg-[#e8eaed] mx-3" />

        {/* My Calendars */}
        <div className="px-3">
          <button
            onClick={() => setMyCalendarsOpen(o => !o)}
            className="w-full flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-gray-100 transition-colors"
          >
            <span className="text-[13px] font-medium text-[#3c4043]">My calendars</span>
            <ChevronDown
              size={16}
              className={`text-[#5f6368] transition-transform duration-200 ${myCalendarsOpen ? 'rotate-0' : '-rotate-90'}`}
            />
          </button>

          <AnimatePresence initial={false}>
            {myCalendarsOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="mt-0.5 space-y-0.5">
                  {[
                    { name: 'Pranjal Srivastava', color: '#1a73e8' },
                    { name: 'Tasks', color: '#039be5', view: 'tasks' },
                    { name: 'Birthdays', color: '#8e24aa' },
                  ].map(cat => (
                    <label
                      key={cat.name}
                      className={`flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-gray-100 cursor-pointer
                        ${viewMode === (cat as any).view ? 'bg-[#e8f0fe]' : ''}
                      `}
                    >
                      <div className="relative shrink-0">
                        <input
                          type="checkbox"
                          checked={!hiddenCalendars.includes(cat.name)}
                          onChange={() => toggleCalendar(cat.name)}
                          className="sr-only"
                        />
                        <div
                          className="w-4 h-4 rounded flex items-center justify-center cursor-pointer"
                          style={{ background: hiddenCalendars.includes(cat.name) ? 'transparent' : cat.color, border: `2px solid ${cat.color}` }}
                          onClick={() => toggleCalendar(cat.name)}
                        >
                          {!hiddenCalendars.includes(cat.name) && (
                            <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                              <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </div>
                      </div>
                      <span
                        className={`text-[13px] flex-1 ${viewMode === (cat as any).view ? 'text-[#185abc] font-medium' : 'text-[#3c4043]'}`}
                        onClick={() => (cat as any).view ? setViewMode((cat as any).view) : setViewMode('month')}
                      >
                        {cat.name}
                      </span>
                    </label>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="h-px bg-[#e8eaed] mx-3" />

        {/* Other Calendars */}
        <div className="px-3 pb-4">
          <div className="flex items-center justify-between px-2 py-1.5">
            <button
              onClick={() => setOtherCalendarsOpen(o => !o)}
              className="flex items-center gap-1 text-[13px] font-medium text-[#3c4043] hover:text-[#1a73e8]"
            >
              <ChevronDown
                size={16}
                className={`text-[#5f6368] transition-transform duration-200 ${otherCalendarsOpen ? 'rotate-0' : '-rotate-90'}`}
              />
              Other calendars
            </button>
            <button
              onClick={() => setShowAddCalendarModal(true)}
              className="p-1 rounded-full hover:bg-gray-100 text-[#5f6368] hover:text-[#1a73e8] transition-colors"
              title="Add other calendar"
            >
              <Plus size={16} />
            </button>
          </div>

          <AnimatePresence initial={false}>
            {otherCalendarsOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="mt-0.5 space-y-0.5">
                  {otherCalendars.map(cal => (
                    <div key={cal.name} className="group flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-gray-100 cursor-pointer">
                      <div
                        className="w-4 h-4 rounded flex items-center justify-center cursor-pointer shrink-0"
                        style={{ background: hiddenCalendars.includes(cal.name) ? 'transparent' : cal.color, border: `2px solid ${cal.color}` }}
                        onClick={() => toggleCalendar(cal.name)}
                      >
                        {!hiddenCalendars.includes(cal.name) && (
                          <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                            <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                      <span className="text-[13px] text-[#3c4043] flex-1" onClick={() => toggleCalendar(cal.name)}>{cal.name}</span>
                      {cal.name !== 'Holidays in India' && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); deleteOtherCalendar(cal.name); }}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded-full hover:bg-gray-200 text-[#5f6368] transition-all"
                        >
                           <X size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </aside>

      {/* Habit Editor Modal */}
      <AnimatePresence>
        {showHabitModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={e => e.target === e.currentTarget && setShowHabitModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl p-6 w-[400px] border border-gray-100"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[20px] font-bold text-[#1f1f1f]">{editingHabit ? 'Edit Habit' : 'Create New Habit'}</h3>
                {editingHabit && (
                  <button 
                    onClick={() => deleteHabit(editingHabit._id)}
                    className="px-3 py-1 text-[12px] font-semibold text-red-500 hover:bg-red-50 rounded-full transition-colors"
                  >
                    Delete
                  </button>
                )}
              </div>
              
              <div className="space-y-5">
                <div className="flex gap-4">
                    <div className="w-16">
                        <label className="text-[12px] font-bold text-[#5f6368] uppercase mb-1 block">Emoji</label>
                        <input
                            type="text"
                            value={habitForm.emoji}
                            onChange={e => setHabitForm({ ...habitForm, emoji: e.target.value })}
                            className="w-full bg-[#f1f3f4] border-none rounded-xl py-3 text-center text-xl focus:ring-2 focus:ring-[#1a73e8]"
                        />
                    </div>
                    <div className="flex-1">
                        <label className="text-[12px] font-bold text-[#5f6368] uppercase mb-1 block">Habit Name</label>
                        <input
                            autoFocus
                            type="text"
                            value={habitForm.name}
                            onChange={e => setHabitForm({ ...habitForm, name: e.target.value })}
                            placeholder="e.g. Morning Run..."
                            className="w-full bg-[#f1f3f4] border-none rounded-xl px-4 py-3 text-[15px] focus:ring-2 focus:ring-[#1a73e8]"
                        />
                    </div>
                </div>

                <div className="bg-[#f8f9fa] rounded-2xl p-4 border border-[#e8eaed]">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                             <Bell size={18} className={habitForm.isAlarmEnabled ? 'text-[#1a73e8]' : 'text-[#5f6368]'} />
                             <span className="text-[14px] font-semibold text-[#3c4043]">Daily Alarm</span>
                        </div>
                        <button 
                            onClick={() => setHabitForm({ ...habitForm, isAlarmEnabled: !habitForm.isAlarmEnabled })}
                            className={`w-10 h-5 rounded-full relative transition-colors ${habitForm.isAlarmEnabled ? 'bg-[#1a73e8]' : 'bg-[#dadce0]'}`}
                        >
                            <motion.div 
                                animate={{ x: habitForm.isAlarmEnabled ? 22 : 2 }}
                                className="absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm"
                            />
                        </button>
                    </div>

                    {habitForm.isAlarmEnabled && (
                        <div className="flex items-center gap-3 bg-white rounded-xl p-3 shadow-sm border border-[#e8eaed]">
                            <Clock8 size={18} className="text-[#1a73e8]" />
                            <input
                                type="time"
                                value={habitForm.alarmTime}
                                onChange={e => setHabitForm({ ...habitForm, alarmTime: e.target.value })}
                                className="flex-1 bg-transparent border-none text-[16px] font-medium text-[#1f1f1f] focus:ring-0 outline-none"
                            />
                        </div>
                    )}
                    <p className="text-[11px] text-[#70757a] mt-3">Receive a reminder notification at this time every day.</p>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <button
                  onClick={() => setShowHabitModal(false)}
                  className="px-6 py-2.5 rounded-2xl text-[14px] font-bold text-[#5f6368] hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveHabit}
                  disabled={!habitForm.name.trim()}
                  className="px-8 py-2.5 rounded-2xl text-[14px] font-bold text-white bg-[#1a73e8] hover:bg-[#1557b0] shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50"
                >
                  Save Habit
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Calendar Modal */}
      <AnimatePresence>
        {showAddCalendarModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/30"
            onClick={e => e.target === e.currentTarget && setShowAddCalendarModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl p-6 w-[360px]"
            >
              <h3 className="text-[18px] font-medium text-[#1f1f1f] mb-5">Add other calendar</h3>
              
              <div className="mb-4">
                <label className="text-[13px] text-[#5f6368] mb-1.5 block">Calendar name</label>
                <input
                  autoFocus
                  type="text"
                  value={newCalendarName}
                  onChange={e => setNewCalendarName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddCalendar()}
                  placeholder="e.g. Family, Work..."
                  className="w-full border-b-2 border-[#dadce0] focus:border-[#1a73e8] pb-1 text-[15px] text-[#1f1f1f] outline-none bg-transparent transition-colors"
                />
              </div>

              <div className="mb-6">
                <label className="text-[13px] text-[#5f6368] mb-2 block">Color</label>
                <div className="flex gap-2 flex-wrap">
                  {CALENDAR_COLORS.map(color => (
                    <button
                      key={color}
                      onClick={() => setNewCalendarColor(color)}
                      className="w-7 h-7 rounded-full transition-transform hover:scale-110"
                      style={{
                        background: color,
                        outline: newCalendarColor === color ? `3px solid ${color}` : 'none',
                        outlineOffset: '2px',
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowAddCalendarModal(false)}
                  className="px-5 py-2 rounded-full text-[14px] font-medium text-[#444746] hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCalendar}
                  disabled={!newCalendarName.trim()}
                  className="px-5 py-2 rounded-full text-[14px] font-medium text-white bg-[#1a73e8] hover:bg-[#1557b0] transition-colors disabled:opacity-50"
                >
                  Add
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
