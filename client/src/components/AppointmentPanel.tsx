import React, { useState } from 'react';
import { X, Clock, Copy, Plus, Slash, Video } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useCalendar } from '../context/CalendarContext';

interface AppointmentPanelProps {
  onClose: () => void;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const API = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/events`;

const AppointmentPanel: React.FC<AppointmentPanelProps> = ({ onClose }) => {
  const { fetchEvents } = useCalendar();
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState('1 hour');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  
  // Step 2 Form States
  const [location, setLocation] = useState('');
  const [meetEnabled, setMeetEnabled] = useState(true);
  const [bookingDescription, setBookingDescription] = useState('');
  const [formFields, setFormFields] = useState(['First name', 'Last name', 'Email address']);
  
  // Default Monday-Friday 9am-5pm with multiple slots support
  const [availability, setAvailability] = useState<Record<string, { active: boolean, slots: { start: string, end: string }[] }>>({
    Sun: { active: false, slots: [{ start: '9:00am', end: '5:00pm' }] },
    Mon: { active: true, slots: [{ start: '9:00am', end: '5:00pm' }] },
    Tue: { active: true, slots: [{ start: '9:00am', end: '5:00pm' }] },
    Wed: { active: true, slots: [{ start: '9:00am', end: '5:00pm' }] },
    Thu: { active: true, slots: [{ start: '9:00am', end: '5:00pm' }] },
    Fri: { active: true, slots: [{ start: '9:00am', end: '5:00pm' }] },
    Sat: { active: false, slots: [{ start: '9:00am', end: '5:00pm' }] },
  });

  const addSlot = (day: string) => {
    setAvailability(prev => ({
      ...prev,
      [day]: { 
        ...prev[day], 
        active: true,
        slots: [...prev[day].slots, { start: '9:00am', end: '5:00pm' }] 
      }
    }));
  };

  const removeSlot = (day: string, index: number) => {
    setAvailability(prev => {
      const newSlots = prev[day].slots.filter((_, i) => i !== index);
      return {
        ...prev,
        [day]: { 
          ...prev[day], 
          active: newSlots.length > 0,
          slots: newSlots.length > 0 ? newSlots : [{ start: '9:00am', end: '5:00pm' }]
        }
      };
    });
  };

  const updateSlot = (day: string, index: number, field: 'start' | 'end', value: string) => {
    setAvailability(prev => {
      const newSlots = [...prev[day].slots];
      newSlots[index] = { ...newSlots[index], [field]: value };
      return { ...prev, [day]: { ...prev[day], slots: newSlots } };
    });
  };

  const toggleDay = (day: string) => {
    setAvailability(prev => ({
      ...prev,
      [day]: { ...prev[day], active: !prev[day].active }
    }));
  };

  const handleNextStep = () => {
    if (step === 1) {
      setStep(2);
    } else {
      handleSave();
    }
  };

  const handleSave = async (force = false) => {
    setLoading(true);
    setError(null);
    try {
      const now = new Date();
      now.setMinutes(0, 0, 0); 
      const endDate = new Date(now.getTime() + 3600000);
      
      const payload = {
        title: title || 'Appointment Schedule',
        startTime: now.toISOString(),
        endTime: endDate.toISOString(),
        eventType: 'appointment',
        description: `${bookingDescription}\nDuration: ${duration}`,
        location: location,
        meetLink: meetEnabled ? 'https://meet.google.com/new' : '',
        color: '#f59e0b',
        isRecurring: true,
        metadata: {
            availability,
            duration
        }
      };
      
      await axios.post(`${API}${force ? '?force=true' : ''}`, payload);
      await fetchEvents();
      onClose();
    } catch (err: any) {
        if (err.response?.status === 409) {
            if (confirm("🚨 Schedule Conflict Detected!\n\n" + (err.response.data.message || "An appointment already exists in this slot.") + "\n\nDo you want to create it anyway?")) {
                handleSave(true);
                return;
            }
        }
      setError(err.response?.data?.message || err.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <motion.div
      initial={{ x: -480, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -480, opacity: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="fixed top-0 left-0 bottom-0 w-full sm:w-[480px] z-[150] shadow-[10px_0_30px_rgba(0,0,0,0.1)] flex flex-col bg-white"
      style={{
        borderRight: '1px solid var(--border)',
      }}
    >
      {/* Header controls */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#f8f9fa]">
        <div className="flex gap-2">
           <button className="text-xs font-medium px-3 py-1.5 rounded-full border border-gray-300 text-[#444746] hover:bg-black/5 disabled:opacity-50">Take a tour</button>
           <button className="text-xs font-medium px-3 py-1.5 rounded-full border border-gray-300 text-[#444746] hover:bg-black/5 disabled:opacity-50">Feedback</button>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors text-[#5f6368] hover:text-[#1f1f1f]"
        >
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6 bg-[#f8f9fa] custom-scrollbar">
        <h4 className="text-[11px] font-bold text-[#5f6368] tracking-wider uppercase mb-4 mt-2">
          Bookable Appointment Schedule
        </h4>
        
        {/* Title Input */}
        <div className="flex items-center gap-4 mb-6 pt-2">
            <div className="w-6 h-6 rounded-lg bg-[#b2d7ff] flex-shrink-0" />
            <input
              autoFocus={step === 1}
              type="text"
              placeholder="Add title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-[22px] font-normal bg-transparent border-b-2 pb-1 focus:outline-none transition-all placeholder:text-[#5f6368]"
              style={{
                color: '#1f1f1f',
                borderBottomColor: title ? '#0b57d0' : '#dadce0',
              }}
            />
        </div>

        {step === 1 ? (
          <>
            {/* Step 1 UI (Availability) */}
            <div className="space-y-8">
               {/* Duration */}
               <div className="flex gap-4">
                  <div className="mt-1 flex-shrink-0">
                    <div className="w-5 h-5 rounded-full border-[2px] border-gray-400 border-t-gray-600 rotate-45" />
                  </div>
                  <div>
                     <p className="text-[15px] font-medium text-[#1f1f1f]">Appointment duration</p>
                     <p className="text-[13px] text-[#444746] mb-2">How long should each appointment last?</p>
                     <select 
                        value={duration}
                        onChange={e => setDuration(e.target.value)}
                        className="bg-[#f0f4f9] border-none rounded hover:bg-[#e2e7ec] px-3 py-2 text-sm text-[#1f1f1f] font-medium focus:outline-none focus:ring-1 focus:ring-gray-300 cursor-pointer"
                     >
                         <option className="bg-white">15 minutes</option>
                         <option className="bg-white">30 minutes</option>
                         <option className="bg-white">45 minutes</option>
                         <option className="bg-white">1 hour</option>
                         <option className="bg-white">1.5 hours</option>
                         <option className="bg-white">2 hours</option>
                     </select>
                  </div>
               </div>

               {/* Availability */}
               <div className="flex gap-4">
                  <div className="mt-1 flex-shrink-0">
                    <Clock size={22} className="text-[#5f6368]" />
                  </div>
                  <div className="flex-1 text-[#1f1f1f]">
                     <p className="text-[15px] font-medium text-[#1f1f1f]">General availability</p>
                     <p className="text-[13px] text-[#444746] mb-3 leading-snug">
                       Set when you're regularly available for appointments. <span className="text-[#0b57d0] hover:underline cursor-pointer">Learn more</span>
                     </p>
                     
                     <div className="space-y-4">
                        {DAYS.map((day) => {
                           const isAvailable = availability[day].active;
                           return (
                               <div key={day} className="flex flex-col gap-2 py-1">
                                  <div className="flex items-start gap-3">
                                     <div className="flex items-center h-8">
                                         <input 
                                             type="checkbox" 
                                             checked={isAvailable}
                                             onChange={() => toggleDay(day)}
                                             className="w-4 h-4 rounded text-[#0b57d0] cursor-pointer"
                                         />
                                     </div>
                                     <span className="text-[13px] font-medium w-8 h-8 flex items-center text-[#444746]">{day}</span>
                                     
                                     {!isAvailable ? (
                                         <div className="flex-1 h-8 flex items-center">
                                             <span className="text-[14px] text-[#444746] italic opacity-60">Unavailable</span>
                                         </div>
                                     ) : (
                                         <div className="flex-1 space-y-2">
                                             {availability[day].slots.map((slot, index) => (
                                                 <div key={index} className="flex items-center gap-2">
                                                     <div className="flex items-center gap-1">
                                                         <input 
                                                             type="text" 
                                                             value={slot.start} 
                                                             onChange={(e) => updateSlot(day, index, 'start', e.target.value)}
                                                             className="w-[85px] text-[13px] px-2 py-1.5 rounded bg-[#f0f4f9] focus:bg-white border-b-2 border-transparent focus:border-[#0b57d0] text-[#1f1f1f] hover:bg-[#e2e7ec] text-center outline-none transition-colors" 
                                                         />
                                                         <span className="text-[#444746]">-</span>
                                                         <input 
                                                             type="text" 
                                                             value={slot.end} 
                                                             onChange={(e) => updateSlot(day, index, 'end', e.target.value)}
                                                             className="w-[85px] text-[13px] px-2 py-1.5 rounded bg-[#f0f4f9] focus:bg-white border-b-2 border-transparent focus:border-[#0b57d0] text-[#1f1f1f] hover:bg-[#e2e7ec] text-center outline-none transition-colors" 
                                                         />
                                                     </div>
                                                     <div className="flex items-center gap-1 ml-auto">
                                                        <button 
                                                            onClick={() => removeSlot(day, index)} 
                                                            className="p-1.5 rounded-full hover:bg-red-50 text-[#5f6368] hover:text-red-500 transition-colors" 
                                                            title="Remove slot"
                                                        >
                                                           <X size={14} />
                                                        </button>
                                                        {index === availability[day].slots.length - 1 && (
                                                            <button 
                                                                onClick={() => addSlot(day)} 
                                                                className="p-1.5 rounded-full hover:bg-blue-50 text-[#1a73e8] transition-colors" 
                                                                title="Add more slots for this day"
                                                            >
                                                                <Plus size={16} />
                                                            </button>
                                                        )}
                                                     </div>
                                                 </div>
                                             ))}
                                         </div>
                                     )}
                                  </div>
                               </div>
                           );
                        })}
                     </div>
                  </div>
               </div>
            </div>
          </>
        ) : (
          <>
            {/* Step 2 UI (Booking Page Details) */}
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
               {/* Location / Meeting */}
               <div className="flex gap-4">
                  <div className="mt-1 flex-shrink-0">
                    <div className="w-[22px] h-[22px] bg-yellow-400 rounded flex items-center justify-center">
                       <Video size={14} className="text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                     <p className="text-[15px] font-medium text-[#1f1f1f]">Location and conferencing</p>
                     <div className="mt-3 space-y-3">
                        <div className="flex items-center justify-between p-3 rounded-lg border border-[#dadce0] bg-white">
                           <div className="flex items-center gap-3">
                               <Video size={20} className="text-[#5f6368]" />
                               <span className="text-[14px]">Google Meet video conferencing</span>
                           </div>
                           <input 
                              type="checkbox" 
                              checked={meetEnabled} 
                              onChange={e => setMeetEnabled(e.target.checked)}
                              className="w-4 h-4 text-[#0b57d0]" 
                           />
                        </div>
                        <input 
                          type="text"
                          placeholder="Add location"
                          value={location}
                          onChange={e => setLocation(e.target.value)}
                          className="w-full p-3 rounded-lg border border-[#dadce0] bg-white text-[14px] outline-none focus:border-[#0b57d0]"
                        />
                     </div>
                  </div>
               </div>

               {/* Description */}
               <div className="flex gap-4">
                  <div className="mt-1 flex-shrink-0">
                    <Clock size={20} className="text-[#5f6368]" />
                  </div>
                  <div className="flex-1">
                     <p className="text-[15px] font-medium text-[#1f1f1f]">Booking page description</p>
                     <textarea 
                        value={bookingDescription}
                        onChange={e => setBookingDescription(e.target.value)}
                        placeholder="Info for your customers"
                        className="w-full mt-2 p-3 rounded-lg border border-[#dadce0] bg-white text-[13px] min-h-[80px] outline-none focus:border-[#0b57d0]"
                     />
                  </div>
               </div>

               {/* Booking Form */}
               <div className="flex gap-4">
                  <div className="mt-1 flex-shrink-0">
                    <Plus size={20} className="text-[#5f6368]" />
                  </div>
                  <div className="flex-1">
                     <p className="text-[15px] font-medium text-[#1f1f1f]">Booking form</p>
                     <div className="mt-3 space-y-2">
                        {formFields.map((f, i) => (
                           <div key={i} className="flex items-center justify-between p-2.5 px-3 rounded-lg bg-white border border-[#dadce0] text-[13px]">
                              {f}
                              <span className="text-[#5f6368] italic">Required</span>
                           </div>
                        ))}
                        <button className="text-[13px] text-[#0b57d0] font-medium mt-2 hover:underline">+ Add item</button>
                     </div>
                  </div>
               </div>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-[#dadce0] flex justify-between items-center bg-white rounded-br-2xl text-[#1f1f1f]">
         <div>
            {step === 2 && (
               <button 
                  onClick={() => setStep(1)}
                  className="text-sm font-medium text-[#444746] hover:bg-black/5 px-4 py-2 rounded-full transition-colors"
               >
                  Back
               </button>
            )}
            <span className="text-[#b3261e] text-[13px] font-semibold ml-2">{error}</span>
         </div>
         <button 
            disabled={loading}
            onClick={() => handleNextStep()}
            className="px-6 py-2.5 rounded-full text-sm font-medium text-white bg-[#0b57d0] hover:bg-[#0842a0] transition-colors shadow-sm active:scale-95 disabled:opacity-70"
         >
            {loading ? 'Saving...' : (step === 1 ? 'Next' : 'Save')}
         </button>
      </div>
    </motion.div>
    </>
  );
};

export default AppointmentPanel;
