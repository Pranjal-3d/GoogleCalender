import React, { useState } from 'react';
import { X, Copy, ExternalLink, Clock, Calendar, Globe, ChevronDown, Edit2, Eye, Trash2, Plus, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, addDays } from 'date-fns';

interface BookingPageProps {
  onClose: () => void;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const BookingPage: React.FC<BookingPageProps> = ({ onClose }) => {
  const [tab, setTab] = useState<'overview' | 'edit'>('overview');
  const [copied, setCopied] = useState(false);
  const [title, setTitle] = useState('Pranjal Srivastava');
  const [duration, setDuration] = useState('30 min');
  const [description, setDescription] = useState('Book a meeting with me using this link.');
  const [location, setLocation] = useState('Google Meet');
  const [availability, setAvailability] = useState<Record<string, { active: boolean, slots: { start: string, end: string }[] }>>({
    Sun: { active: false, slots: [{ start: '9:00am', end: '5:00pm' }] },
    Mon: { active: true, slots: [{ start: '9:00am', end: '5:00pm' }] },
    Tue: { active: true, slots: [{ start: '9:00am', end: '5:00pm' }] },
    Wed: { active: true, slots: [{ start: '9:00am', end: '5:00pm' }] },
    Thu: { active: true, slots: [{ start: '9:00am', end: '5:00pm' }] },
    Fri: { active: true, slots: [{ start: '9:00am', end: '5:00pm' }] },
    Sat: { active: false, slots: [{ start: '9:00am', end: '5:00pm' }] },
  });

  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await fetch(`${baseUrl}/api/events`);
        const events = await res.json();
        const latestAppt = events.filter((e: any) => e.eventType === 'appointment').pop();
        
        if (latestAppt) {
          setTitle(latestAppt.title);
          setDescription(latestAppt.description.split('\n')[0]);
          setLocation(latestAppt.location || 'Online');
          if (latestAppt.metadata) {
            if (latestAppt.metadata.availability) setAvailability(latestAppt.metadata.availability);
            if (latestAppt.metadata.duration) setDuration(latestAppt.metadata.duration);
          }
        }
      } catch (err) {
        console.error('Failed to load booking schedule', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSchedule();
  }, []);

  const handleSaveChanges = async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const payload = {
        title,
        description: `${description}\nDuration: ${duration}`,
        location,
        eventType: 'appointment',
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 3600000).toISOString(),
        isRecurring: true,
        metadata: {
          availability,
          duration
        }
      };
      
      await fetch(`${baseUrl}/api/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      setTab('overview');
      alert('Schedule updated successfully!');
    } catch (err) {
      console.error('Failed to save changes', err);
      alert('Failed to save changes');
    }
  };

  const bookingUrl = `https://calendar.app.google/booking/pranjal-srivastava`;

  const handleCopy = () => {
    navigator.clipboard.writeText(bookingUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const toggleDay = (day: string) => {
    setAvailability(prev => ({
      ...prev,
      [day]: { 
          ...prev[day], 
          active: !prev[day].active 
      },
    }));
  };

  // Simulated available slots for today preview
  const todaySlots = ['9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '2:00 PM', '2:30 PM', '3:00 PM'];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 backdrop-blur-sm"
        onClick={e => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-[880px] max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#e8eaed]">
            <div className="flex items-center gap-4">
              <h2 className="text-[20px] font-medium text-[#1f1f1f]">Booking page</h2>
              <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setTab('overview')}
                  className={`px-4 py-1.5 rounded-md text-[13px] font-medium transition-colors ${tab === 'overview' ? 'bg-white text-[#1a73e8] shadow-sm' : 'text-[#5f6368] hover:text-[#1f1f1f]'}`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setTab('edit')}
                  className={`px-4 py-1.5 rounded-md text-[13px] font-medium transition-colors ${tab === 'edit' ? 'bg-white text-[#1a73e8] shadow-sm' : 'text-[#5f6368] hover:text-[#1f1f1f]'}`}
                >
                  Edit settings
                </button>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 text-[#5f6368]">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {tab === 'overview' && (
              <div className="flex gap-0 h-full">
                {/* Left: Info panel */}
                <div className="w-[300px] shrink-0 p-6 border-r border-[#e8eaed]">
                  {/* Avatar */}
                  <div className="w-16 h-16 rounded-full bg-[#1a73e8] flex items-center justify-center text-white text-2xl font-bold mb-4">
                    P
                  </div>
                  <h3 className="text-[20px] font-medium text-[#1f1f1f] mb-1">{title}</h3>
                  <p className="text-[14px] text-[#5f6368] mb-4">{description}</p>
                  
                  <div className="space-y-2.5 mb-6">
                    <div className="flex items-center gap-2 text-[14px] text-[#3c4043]">
                      <Clock size={16} className="text-[#5f6368]" />
                      <span>{duration}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[14px] text-[#3c4043]">
                      <Globe size={16} className="text-[#5f6368]" />
                      <span>{location}</span>
                    </div>
                  </div>

                  {/* Booking link */}
                  <div className="bg-[#f8f9fa] rounded-xl p-3 border border-[#e8eaed]">
                    <p className="text-[11px] text-[#5f6368] mb-1 font-medium uppercase tracking-wide">Booking link</p>
                    <p className="text-[12px] text-[#1a73e8] break-all mb-2">{bookingUrl}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={handleCopy}
                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-white border border-[#dadce0] text-[12px] font-medium text-[#3c4043] hover:bg-gray-50 transition-colors"
                      >
                        {copied ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
                        {copied ? 'Copied!' : 'Copy'}
                      </button>
                      <button className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-white border border-[#dadce0] text-[12px] font-medium text-[#3c4043] hover:bg-gray-50 transition-colors">
                        <ExternalLink size={13} />
                        Open
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right: Calendar preview */}
                <div className="flex-1 p-6">
                  <h4 className="text-[15px] font-medium text-[#1f1f1f] mb-1">Pick a date</h4>
                  <p className="text-[13px] text-[#5f6368] mb-4">Select a date to see available time slots</p>

                  {/* Mini month selector */}
                  <div className="grid grid-cols-7 gap-1 mb-4 max-w-[300px]">
                    {['S','M','T','W','T','F','S'].map((d, i) => (
                      <div key={i} className="text-center text-[11px] text-[#70757a] font-medium py-1">{d}</div>
                    ))}
                    {Array.from({ length: 35 }, (_, i) => {
                      const d = i - 5; // offset so 1st lands on right day
                      const day = addDays(new Date(new Date().getFullYear(), new Date().getMonth(), 1), d);
                      const isCurrentMonth = day.getMonth() === new Date().getMonth();
                      const isAvailable = isCurrentMonth && day.getDay() !== 0 && day.getDay() !== 6 && day >= new Date();
                      const isToday2 = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
                      return (
                        <button
                          key={i}
                          disabled={!isAvailable}
                          className={`h-8 w-8 mx-auto rounded-full text-[12px] font-medium transition-all
                            ${!isCurrentMonth ? 'text-[#ccc] cursor-default' : ''}
                            ${isAvailable ? 'text-[#1a73e8] hover:bg-[#e8f0fe] cursor-pointer' : ''}
                            ${isToday2 ? '!bg-[#1a73e8] !text-white hover:!bg-[#1557b0]' : ''}
                            ${!isAvailable && isCurrentMonth ? 'text-[#ccc] cursor-not-allowed' : ''}
                          `}
                        >
                          {format(day, 'd')}
                        </button>
                      );
                    })}
                  </div>

                  {/* Available time slots */}
                  <div>
                    <h4 className="text-[14px] font-medium text-[#1f1f1f] mb-3">
                      Available slots — {format(new Date(), 'EEEE, MMMM d')}
                    </h4>
                    <div className="grid grid-cols-3 gap-2 max-w-[360px]">
                      {todaySlots.map(slot => (
                        <button
                          key={slot}
                          className="py-2 rounded-full border border-[#1a73e8] text-[13px] font-medium text-[#1a73e8] hover:bg-[#e8f0fe] transition-colors"
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {tab === 'edit' && (
              <div className="p-6 max-w-[600px]">
                <div className="space-y-6">
                  {/* Title */}
                  <div>
                    <label className="text-[13px] text-[#5f6368] block mb-1">Booking page title</label>
                    <input
                      type="text"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      className="w-full border-b-2 border-[#dadce0] focus:border-[#1a73e8] pb-1.5 text-[15px] text-[#1f1f1f] outline-none bg-transparent"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="text-[13px] text-[#5f6368] block mb-1">Description</label>
                    <textarea
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      rows={2}
                      className="w-full border-b-2 border-[#dadce0] focus:border-[#1a73e8] pb-1.5 text-[15px] text-[#1f1f1f] outline-none bg-transparent resize-none"
                    />
                  </div>

                  {/* Duration */}
                  <div>
                    <label className="text-[13px] text-[#5f6368] block mb-1">Meeting duration</label>
                    <select
                      value={duration}
                      onChange={e => setDuration(e.target.value)}
                      className="bg-[#f1f3f4] rounded-lg px-3 py-2 text-[14px] text-[#1f1f1f] outline-none border-none"
                    >
                      <option>15 min</option>
                      <option>30 min</option>
                      <option>45 min</option>
                      <option>60 min</option>
                      <option>90 min</option>
                    </select>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="text-[13px] text-[#5f6368] block mb-1">Location / conferencing</label>
                    <select
                      value={location}
                      onChange={e => setLocation(e.target.value)}
                      className="bg-[#f1f3f4] rounded-lg px-3 py-2 text-[14px] text-[#1f1f1f] outline-none border-none"
                    >
                      <option>Google Meet</option>
                      <option>Zoom</option>
                      <option>In person</option>
                      <option>Phone call</option>
                    </select>
                  </div>

                  {/* Availability */}
                  <div>
                    <label className="text-[13px] text-[#5f6368] block mb-3">Weekly availability</label>
                    <div className="space-y-3">
                      {Object.entries(availability).map(([day, dayData]) => (
                        <div key={day} className="flex flex-col gap-2">
                           <div className="flex items-center gap-3">
                              <button
                                onClick={() => toggleDay(day)}
                                className={`w-10 h-5 rounded-full transition-colors relative ${dayData.active ? 'bg-[#1a73e8]' : 'bg-gray-300'}`}
                              >
                                <span
                                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${dayData.active ? 'left-5' : 'left-0.5'}`}
                                />
                              </button>
                              <span className={`text-[13px] font-medium w-8 ${dayData.active ? 'text-[#1f1f1f]' : 'text-[#aaa]'}`}>{day}</span>
                              
                              {!dayData.active ? (
                                <span className="text-[12px] text-[#aaa] italic">Unavailable</span>
                              ) : (
                                <div className="flex-1 space-y-2">
                                  {dayData.slots.map((s, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                      <input
                                        type="text"
                                        value={s.start}
                                        onChange={e => {
                                          const newSlots = [...dayData.slots];
                                          newSlots[idx].start = e.target.value;
                                          setAvailability(prev => ({ ...prev, [day]: { ...prev[day], slots: newSlots } }));
                                        }}
                                        className="bg-[#f1f3f4] rounded px-2 py-1 text-[12px] w-20 outline-none text-center text-[#1f1f1f]"
                                      />
                                      <span className="text-[#5f6368] text-xs">–</span>
                                      <input
                                        type="text"
                                        value={s.end}
                                        onChange={e => {
                                          const newSlots = [...dayData.slots];
                                          newSlots[idx].end = e.target.value;
                                          setAvailability(prev => ({ ...prev, [day]: { ...prev[day], slots: newSlots } }));
                                        }}
                                        className="bg-[#f1f3f4] rounded px-2 py-1 text-[12px] w-20 outline-none text-center text-[#1f1f1f]"
                                      />
                                    </div>
                                  ))}
                                </div>
                              )}
                           </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button 
                    onClick={handleSaveChanges}
                    className="w-full px-6 py-3 rounded-xl bg-[#1a73e8] hover:bg-[#1557b0] text-white text-[14px] font-medium transition-all shadow-md active:scale-[0.98]"
                  >
                    Save changes
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BookingPage;
