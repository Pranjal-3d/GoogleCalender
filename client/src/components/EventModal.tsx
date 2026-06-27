import React, { useEffect, useState } from 'react';
import { X, Clock, MapPin, AlignLeft, Calendar as CalendarIcon, Users, Video, Target, List, Info, GripHorizontal } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useCalendar } from '../context/CalendarContext';
import { EventType } from './CreateTypePicker';

interface EventModalProps {
  event?: any;
  eventType?: EventType;
  prefilledDate?: Date | null;
  onClose: () => void;
  onOpenAppointmentPanel?: () => void;
}

const API = 'http://localhost:5000/api/events';

const EventModal: React.FC<EventModalProps> = ({ event, eventType = 'event', prefilledDate, onClose, onOpenAppointmentPanel }) => {
  const { fetchEvents } = useCalendar();

  const makeDefault = (date?: Date | null) => {
    const base = date || new Date();
    const start = new Date(base);
    start.setMinutes(0, 0, 0);
    const end = new Date(start.getTime() + 3600000);
    return {
      title: '',
      // For display
      displayDate: format(start, "EEEE, MMMM d"),
      displayStartTime: format(start, "h:mma").toLowerCase(),
      displayEndTime: format(end, "h:mma").toLowerCase(),
      
      startTime: format(start, "yyyy-MM-dd'T'HH:mm"),
      endTime: format(end, "yyyy-MM-dd'T'HH:mm"),
      description: '',
      location: '',
      guests: '',
      meetLink: '',
      color: '#0b57d0',
      recurrence: '',
    };
  };

  const [form, setForm] = useState(makeDefault(prefilledDate));
  const [type, setType] = useState<EventType>(eventType);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (event) {
      setType(event.eventType as EventType || 'event');
      setForm({
        title: event.title,
        displayDate: format(new Date(event.startTime), "EEEE, MMMM d"),
        displayStartTime: format(new Date(event.startTime), "h:mma").toLowerCase(),
        displayEndTime: format(new Date(event.endTime), "h:mma").toLowerCase(),
        startTime: format(new Date(event.startTime), "yyyy-MM-dd'T'HH:mm"),
        endTime: format(new Date(event.endTime), "yyyy-MM-dd'T'HH:mm"),
        description: event.description || '',
        location: event.location || '',
        guests: event.guests?.join(', ') || '',
        meetLink: event.meetLink || '',
        color: event.color || '#0b57d0',
        recurrence: event.recurrenceRule?.frequency || '',
      });
    }
  }, [event]);

  const handleDelete = async () => {
    if (!event) return;
    if (!confirm('Are you sure you want to delete this event?')) return;
    setLoading(true);
    try {
      await axios.delete(`${API}/${event._id}`);
      await fetchEvents();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete event.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e?: React.FormEvent, force = false) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);

    let finalEndTime = form.endTime;
    if (type === 'task') {
        const d = new Date(form.startTime);
        d.setMinutes(d.getMinutes() + 30);
        finalEndTime = format(d, "yyyy-MM-dd'T'HH:mm");
    }

    const payload: any = {
      title: form.title || '(No title)',
      startTime: new Date(form.startTime).toISOString(),
      endTime: new Date(finalEndTime).toISOString(),
      description: form.description,
      location: form.location,
      guests: form.guests.split(',').map(g => g.trim()).filter(g => g),
      meetLink: form.meetLink,
      color: type === 'event' ? form.color : (type === 'task' ? '#0b57d0' : '#f59e0b'),
      eventType: type,
      isRecurring: !!form.recurrence && type === 'event',
      ...(form.recurrence && type === 'event' && { recurrenceRule: { frequency: form.recurrence, interval: 1 } }),
    };

    try {
      if (event && event._id && !event._id.startsWith('draft-')) {
        await axios.patch(`${API}/${event._id}${force ? '?force=true' : ''}`, payload);
      } else {
        await axios.post(`${API}${force ? '?force=true' : ''}`, payload);
      }
      await fetchEvents();
      onClose();
    } catch (err: any) {
        if (err.response?.status === 409) {
            if (confirm("🚨 Schedules Overlap!\n\n" + (err.response.data.message || "Another event is already scheduled for this time.") + "\n\nDo you want to Save anyway?")) {
                handleSubmit(undefined, true);
                return;
            }
        }
      setError(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-start justify-center pt-24 pb-4 px-4 overflow-y-auto"
        style={{ background: 'rgba(0,0,0,0.1)' }} // Lighter backdrop for this style
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          className="w-full max-w-[480px] shadow-2xl relative"
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.2 }}
          style={{
            background: '#f0f4f9', // Google Material light gray-blue
            borderRadius: '24px',
            color: '#1f1f1f',
          }}
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between px-3 py-2 bg-[#f0f4f9] rounded-t-3xl">
             <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 text-[#5f6368] transition-colors">
                <GripHorizontal size={18} />
             </button>
             <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 text-[#5f6368] transition-colors">
                <X size={20} />
             </button>
          </div>

          <div className="px-6 pb-6 pt-1">
             {/* Title Input */}
             <div className="pl-14 pr-2 mb-4">
                <input
                  autoFocus
                  type="text"
                  placeholder="Add title"
                  value={form.title}
                  onChange={(e) => setForm(f => ({...f, title: e.target.value}))}
                  className="w-full text-[22px] bg-transparent border-b-[2px] pb-[4px] focus:outline-none placeholder-[#5f6368]"
                  style={{
                    borderColor: '#0b57d0',
                    color: '#1f1f1f'
                  }}
                />
             </div>

             {/* Type Tabs */}
             {!event && (
                 <div className="pl-14 flex items-center gap-2 mb-6">
                    {(['event', 'task', 'appointment'] as EventType[]).map(t => (
                       <button
                         key={t}
                         onClick={() => {
                           if (t === 'appointment') {
                             onOpenAppointmentPanel?.();
                             onClose();
                           } else {
                             setType(t);
                           }
                         }}
                         className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${type === t ? 'bg-[#c2e7ff] text-[#001d35]' : 'bg-transparent text-[#444746] hover:bg-black/5'}`}
                       >
                          {t === 'appointment' ? 'Appointment schedule' : t === 'event' ? 'Event' : 'Task'}
                       </button>
                    ))}
                 </div>
             )}

             {/* Error Message */}
             {error && (
                 <div className="pl-14 mb-4 text-sm text-[#b3261e] font-medium">
                     {error}
                 </div>
             )}

             <div className="flex flex-col gap-5">
                 
                 {/* EVENT VIEW */}
                 {type === 'event' && (
                     <>
                        {/* Time */}
                         <div className="flex items-start gap-5">
                            <Clock size={22} className="text-[#5f6368] mt-1 shrink-0" />
                            <div className="flex flex-col gap-2">
                               <div className="flex items-center gap-3">
                                  <input 
                                    type="date"
                                    value={form.startTime.split('T')[0]}
                                    onChange={(e) => {
                                        const time = form.startTime.split('T')[1];
                                        setForm(f => ({...f, startTime: `${e.target.value}T${time}`}));
                                    }}
                                    className="bg-[#f0f4f9] px-3 py-1.5 rounded-lg text-sm text-[#1f1f1f] border-none outline-none focus:ring-2 focus:ring-[#0b57d0]/20"
                                  />
                                  <div className="flex items-center gap-1 bg-[#f0f4f9] px-2 py-1.5 rounded-lg">
                                    <input 
                                      type="time"
                                      value={form.startTime.split('T')[1]}
                                      onChange={(e) => {
                                          const date = form.startTime.split('T')[0];
                                          setForm(f => ({...f, startTime: `${date}T${e.target.value}`}));
                                      }}
                                      className="bg-transparent border-none text-sm text-[#1f1f1f] outline-none w-[90px]"
                                    />
                                    <span className="text-gray-400"> – </span>
                                    <input 
                                      type="time"
                                      value={form.endTime.split('T')[1]}
                                      onChange={(e) => {
                                          const date = form.endTime.split('T')[0];
                                          setForm(f => ({...f, endTime: `${date}T${e.target.value}`}));
                                      }}
                                      className="bg-transparent border-none text-sm text-[#1f1f1f] outline-none w-[90px]"
                                    />
                                  </div>
                               </div>
                               <div className="text-[13px] text-[#444746]">
                                  Time zone · Does not repeat
                               </div>
                            </div>
                         </div>

                        {/* Guests */}
                        <div className="flex items-center gap-5">
                           <Users size={22} className="text-[#5f6368] shrink-0" />
                           <input 
                                type="text"
                                placeholder="Add guests (comma separated emails)"
                                value={form.guests}
                                onChange={(e) => setForm(f => ({...f, guests: e.target.value}))}
                                className="w-full bg-transparent border-none focus:ring-0 text-[15px] text-[#444746] outline-none"
                           />
                        </div>

                        {/* Google Meet */}
                        <div className="flex items-center gap-5">
                           <div className="shrink-0 w-[22px] h-[22px] bg-yellow-400 rounded flex items-center justify-center">
                              <Video size={14} className="text-white" />
                           </div>
                           <input 
                                type="text"
                                placeholder="Add Google Meet link"
                                value={form.meetLink}
                                onChange={(e) => setForm(f => ({...f, meetLink: e.target.value}))}
                                className="w-full bg-transparent border-none focus:ring-0 text-[15px] text-[#444746] outline-none"
                           />
                        </div>

                        {/* Location */}
                        <div className="flex items-center gap-5">
                           <MapPin size={22} className="text-[#5f6368] shrink-0" />
                           <input 
                                type="text"
                                placeholder="Add location"
                                value={form.location}
                                onChange={(e) => setForm(f => ({...f, location: e.target.value}))}
                                className="w-full bg-transparent border-none focus:ring-0 text-[15px] text-[#444746] outline-none"
                           />
                        </div>

                        {/* Description */}
                        <div className="flex items-start gap-5">
                           <AlignLeft size={22} className="text-[#5f6368] shrink-0 mt-1" />
                           <textarea 
                                placeholder="Add description"
                                value={form.description}
                                onChange={(e) => setForm(f => ({...f, description: e.target.value}))}
                                className="w-full bg-transparent border-none focus:ring-0 text-[15px] text-[#444746] outline-none resize-none"
                                rows={2}
                           />
                        </div>
                     </>
                 )}

                 {/* TASK VIEW */}
                 {type === 'task' && (
                     <>
                        {/* Time */}
                         <div className="flex items-start gap-5">
                            <Clock size={22} className="text-[#5f6368] mt-1 shrink-0" />
                            <div className="flex flex-col gap-2">
                               <div className="flex items-center gap-3">
                                  <input 
                                    type="date"
                                    value={form.startTime.split('T')[0]}
                                    onChange={(e) => {
                                        const time = form.startTime.split('T')[1];
                                        setForm(f => ({...f, startTime: `${e.target.value}T${time}`}));
                                    }}
                                    className="bg-[#f0f4f9] px-3 py-1.5 rounded-lg text-sm text-[#1f1f1f] border-none outline-none focus:ring-2 focus:ring-[#0b57d0]/20"
                                  />
                                  <input 
                                    type="time"
                                    value={form.startTime.split('T')[1]}
                                    onChange={(e) => {
                                        const date = form.startTime.split('T')[0];
                                        setForm(f => ({...f, startTime: `${date}T${e.target.value}`}));
                                    }}
                                    className="bg-[#f0f4f9] px-3 py-1.5 rounded-lg text-sm text-[#1f1f1f] border-none outline-none focus:ring-2 focus:ring-[#0b57d0]/20"
                                  />
                               </div>
                               <div className="text-[13px] text-[#444746]">
                                  Does not repeat
                               </div>
                            </div>
                         </div>

                        {/* Target */}
                        <div className="flex items-center gap-5">
                           <Target size={22} className="text-[#5f6368] shrink-0" />
                           <span className="text-[15px] text-[#444746]">Add deadline</span>
                        </div>

                        {/* Description */}
                        <div className="flex items-start gap-5">
                           <AlignLeft size={22} className="text-[#5f6368] mt-1 shrink-0" />
                           <textarea 
                                placeholder="Add description"
                                value={form.description}
                                onChange={(e) => setForm(f => ({...f, description: e.target.value}))}
                                className="w-full bg-transparent border-none focus:ring-0 text-[15px] text-[#444746] outline-none resize-none"
                                rows={2}
                           />
                        </div>
                        
                        {/* List Select */}
                        <div className="flex items-center gap-5">
                           <List size={22} className="text-[#5f6368] shrink-0" />
                           <select className="bg-[#e2e7ec] border-none px-3 py-1.5 rounded-lg text-sm text-[#444746] font-medium outline-none">
                               <option>My Tasks</option>
                           </select>
                        </div>
                     </>
                 )}

                 {/* APPOINTMENT SCHEDULE VIEW */}
                 {type === 'appointment' && (
                     <>
                        {/* Time Slots Area */}
                        <div className="flex items-start gap-5">
                           <Clock size={22} className="text-[#5f6368] mt-2 shrink-0" />
                           <div className="flex gap-2 items-center flex-wrap">
                               <div className="bg-[#e1e3e1] rounded text-[14px] px-3 py-1.5 text-[#1f1f1f]">{form.displayDate}</div>
                               <div className="bg-[#e1e3e1] rounded text-[14px] px-3 py-1.5 text-[#1f1f1f]">{form.displayStartTime}</div>
                               <span className="text-[#444746]">–</span>
                               <div className="bg-[#e1e3e1] rounded text-[14px] px-3 py-1.5 text-[#1f1f1f]">{form.displayEndTime}</div>
                           </div>
                        </div>

                        {/* Info Block */}
                        <div className="pl-[42px]">
                           <div className="bg-white rounded-xl border border-[#c7c7c7] p-4 flex gap-4 mt-2">
                               <Info size={20} className="text-[#5f6368] shrink-0 mt-0.5" />
                               <div>
                                  <p className="text-[15px] text-[#1f1f1f] leading-snug mb-3">
                                     Create a booking page you can share with others so they can book time with you themselves
                                  </p>
                                  <div className="flex gap-4">
                                     <button className="text-[#0b57d0] font-medium text-sm hover:underline focus:outline-none">See how it works</button>
                                     <button className="text-[#0b57d0] font-medium text-sm hover:underline focus:outline-none">Learn more</button>
                                  </div>
                               </div>
                           </div>
                        </div>

                        {/* Divider for Appointment */}
                        <div className="pl-[42px]">
                            <div className="h-[1px] bg-[#c7c7c7] w-full mt-4 mb-2"></div>
                        </div>
                     </>
                 )}

                 {/* COMMON BOTTOM: Profile Picker */}
                 <div className="flex items-start gap-5 mt-2">
                     <CalendarIcon size={22} className="text-[#5f6368] mt-1 shrink-0" />
                     <div>
                        <div className="flex items-center gap-2">
                            <span className="text-[15px] text-[#1f1f1f]">Pranjal Srivastava</span>
                            <div className="w-3.5 h-3.5 rounded-full bg-[#1a73e8]"></div>
                        </div>
                        {type === 'event' && <div className="text-[13px] text-[#444746] mt-0.5">Busy · Default visibility · Notify 30 minutes before</div>}
                        {type === 'task' && <div className="text-[13px] text-[#444746] mt-0.5">Free · Private</div>}
                     </div>
                 </div>
                 
             </div>
          </div>
          
          {/* Action Footer */}
          <div className="px-5 py-4 flex justify-end items-center gap-4 bg-[#f0f4f9] rounded-b-3xl">
              {event && (
                  <button 
                    disabled={loading}
                    onClick={handleDelete}
                    className="text-[#b3261e] text-sm font-medium mr-auto hover:bg-red-50 px-4 py-2 rounded-full transition-colors"
                  >
                      Delete
                  </button>
              )}
              
              {!event && type === 'event' && (
                 <button className="text-[#0b57d0] text-sm font-medium mr-auto pl-10 focus:outline-none hover:bg-black/5 px-2 py-1.5 rounded">More options</button>
              )}
              
              {type === 'appointment' ? (
                  <button 
                    onClick={onOpenAppointmentPanel}
                    className="bg-[#0b57d0] hover:bg-[#0842a0] text-white text-sm font-medium px-6 py-2.5 rounded-full shadow-sm transition-colors focus:outline-none"
                  >
                    Set up the schedule
                  </button>
              ) : (
                  <button 
                    disabled={loading}
                    onClick={() => handleSubmit()}
                    className="bg-[#0b57d0] hover:bg-[#0842a0] text-white text-sm font-medium px-6 py-2.5 rounded-full shadow-sm transition-colors focus:outline-none disabled:opacity-70"
                  >
                    {loading ? 'Saving...' : 'Save'}
                  </button>
              )}
          </div>
          
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EventModal;
