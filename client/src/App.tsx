import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import CalendarView from './components/CalendarView';
import EventModal from './components/EventModal';
import AppointmentPanel from './components/AppointmentPanel';
import BookingPage from './components/BookingPage';
import AIAssistant from './components/AIAssistant';
import { CalendarProvider } from './context/CalendarContext';
import { EventType } from './components/CreateTypePicker';
import { Sparkles, UserCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const App: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [prefilledDate, setPrefilledDate] = useState<Date | null>(null);
  const [isAppointmentPanelOpen, setIsAppointmentPanelOpen] = useState(false);
  const [eventType, setEventType] = useState<EventType>('event');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [bookingPageOpen, setBookingPageOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  // Prefilled data when AI suggests a slot
  const [aiPrefilledStart, setAiPrefilledStart] = useState<Date | null>(null);
  const [aiPrefilledEnd, setAiPrefilledEnd] = useState<Date | null>(null);
  const [aiPrefilledTitle, setAiPrefilledTitle] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setSidebarOpen(false);
      else setSidebarOpen(true);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleOpenModal = (type: string = 'event', event?: any, date?: Date) => {
    if (type === 'appointment_panel' || (type === 'appointment' && !event && !date)) {
      setIsAppointmentPanelOpen(true);
      setIsModalOpen(false);
      return;
    }
    setEventType(type as EventType);
    setSelectedEvent(event || null);
    setPrefilledDate(date || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
    setPrefilledDate(null);
    setAiPrefilledStart(null);
    setAiPrefilledEnd(null);
    setAiPrefilledTitle('');
  };

  // Called when user clicks "Book this slot" in AI panel
  const handleAICreateEvent = (title: string, start: Date, end: Date) => {
    setAiPrefilledTitle(title);
    setAiPrefilledStart(start);
    setAiPrefilledEnd(end);
    setPrefilledDate(start);
    setSelectedEvent({ title, startTime: start.toISOString(), endTime: end.toISOString() });
    setEventType('event');
    setIsModalOpen(true);
  };

  // Habit Alarm System
  useEffect(() => {
    const checkAlarms = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/habits`);
        const habits = await res.json();
        
        const now = new Date();
        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        
        habits.forEach((habit: any) => {
          if (habit.isAlarmEnabled && habit.alarmTime === currentTime) {
            // Check if already notified for this minute
            const lastNotified = localStorage.getItem(`alarm_${habit._id}`);
            const todayStr = now.toDateString() + currentTime;
            
            if (lastNotified !== todayStr) {
               // Play simple beep or sound
               try {
                 const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
                 const oscillator = audioCtx.createOscillator();
                 const gainNode = audioCtx.createGain();
                 oscillator.connect(gainNode);
                 gainNode.connect(audioCtx.destination);
                 oscillator.type = 'sine';
                 oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
                 gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
                 oscillator.start();
                 oscillator.stop(audioCtx.currentTime + 0.5);
               } catch (e) {}

               alert(`⏰ Habit Reminder: Time for "${habit.name}" ${habit.emoji}`);
               localStorage.setItem(`alarm_${habit._id}`, todayStr);
            }
          }
        });
      } catch (err) {
        console.error('Alarm check failed', err);
      }
    };

    const interval = setInterval(checkAlarms, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Prevent accidental tab closure when editing
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // If a modal is open or something is being edited, warn the user
      if (isModalOpen || isAppointmentPanelOpen || aiOpen) {
        e.preventDefault();
        e.returnValue = ''; // Required for most browsers to show the dialog
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isModalOpen, isAppointmentPanelOpen, aiOpen]);

  const handleDropDraft = (date: Date, draft: any) => {
    // Round to nearest hour
    const start = new Date(date);
    start.setHours(9, 0, 0, 0); // Default to 9 AM
    const end = new Date(start);
    end.setHours(start.getHours() + 1);

    setEventType('event');
    setSelectedEvent({
      title: draft.title,
      color: draft.color || '#1a73e8',
      startTime: start.toISOString(),
      endTime: end.toISOString()
    });
    setPrefilledDate(start);
    setIsModalOpen(true);
  };

  return (
    <CalendarProvider>
      <div className="flex h-screen flex-col overflow-hidden bg-white relative">
        <Header
          onOpenModal={(type) => handleOpenModal(type)}
          onToggleSidebar={() => setSidebarOpen(o => !o)}
          sidebarOpen={sidebarOpen}
        />

        <div className="flex flex-1 overflow-hidden relative">
          {/* Mobile Overlay */}
          <AnimatePresence>
            {isMobile && sidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSidebarOpen(false)}
                className="fixed inset-0 z-[150] bg-black/30 backdrop-blur-[2px] lg:hidden"
              />
            )}
          </AnimatePresence>

          {/* Sidebar Container */}
          <div
            className={`transition-all duration-300 ease-in-out shrink-0 z-[160] 
                ${isMobile ? 'fixed inset-y-0 left-0 bg-white shadow-2xl' : 'relative'}
            `}
            style={{ 
                width: (sidebarOpen && !isAppointmentPanelOpen) ? (isMobile ? '280px' : '256px') : '0px',
                transform: (isMobile && (!sidebarOpen || isAppointmentPanelOpen)) ? 'translateX(-100%)' : 'translateX(0)'
            }}
          >
            <Sidebar 
                onOpenBookingPage={() => setBookingPageOpen(true)} 
                onClose={() => setSidebarOpen(false)}
            />
          </div>

          {/* Main calendar area */}
          <main
            className="flex-1 overflow-hidden relative transition-all duration-300"
            style={{ 
                marginRight: !isMobile && aiOpen ? '420px' : '0px'
            }}
          >
            <div className="w-full h-full">
                <CalendarView
                    onEventClick={(event: any) => handleOpenModal('event', event)}
                    onCellClick={(date: Date) => handleOpenModal('event', undefined, date)}
                    onDropDraft={handleDropDraft}
                />
            </div>
          </main>
        </div>

        {/* Floating AI Button */}
        <AnimatePresence>
          {!aiOpen && (
            <motion.button
              initial={{ scale: 0, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0, opacity: 0, y: 20 }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setAiOpen(true)}
              className="fixed bottom-8 right-8 z-[200] flex items-center gap-2.5 pl-4 pr-6 py-3 rounded-full text-white text-[14px] font-medium shadow-lg"
              style={{
                background: '#1a73e8',
                boxShadow: '0 4px 12px rgba(26,115,232,0.4)',
              }}
            >
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mr-0.5">
                <UserCheck size={18} />
              </div>
              <span>Schedule Helper</span>
            </motion.button>
          )}
        </AnimatePresence>

        {/* AI Assistant Panel */}
        <AnimatePresence>
          {aiOpen && (
            <AIAssistant
              onClose={() => setAiOpen(false)}
              onCreateEvent={handleAICreateEvent}
            />
          )}
        </AnimatePresence>

        {/* Other Modals */}
        {isAppointmentPanelOpen && (
          <AppointmentPanel onClose={() => setIsAppointmentPanelOpen(false)} />
        )}
        {isModalOpen && (
          <EventModal
            event={selectedEvent}
            eventType={eventType}
            prefilledDate={prefilledDate}
            onClose={handleCloseModal}
            onOpenAppointmentPanel={() => handleOpenModal('appointment_panel')}
          />
        )}
        {bookingPageOpen && (
          <BookingPage onClose={() => setBookingPageOpen(false)} />
        )}
      </div>
    </CalendarProvider>
  );
};

export default App;
