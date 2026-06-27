import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarDays, CheckSquare, Clock4, X } from 'lucide-react';

export type EventType = 'event' | 'task' | 'appointment';

interface CreateTypePickerProps {
  anchorRef: React.RefObject<HTMLButtonElement | null>;
  onSelect: (type: EventType) => void;
  onClose: () => void;
}

const options: {
  type: EventType;
  icon: React.ReactNode;
  label: string;
  description: string;
  color: string;
  bg: string;
}[] = [
  {
    type: 'event',
    icon: <CalendarDays size={20} />,
    label: 'Event',
    description: 'A calendar event with time & location',
    color: '#6366f1',
    bg: 'rgba(99,102,241,0.12)',
  },
  {
    type: 'task',
    icon: <CheckSquare size={20} />,
    label: 'Task',
    description: 'A to-do item with due date',
    color: '#10b981',
    bg: 'rgba(16,185,129,0.12)',
  },
  {
    type: 'appointment',
    icon: <Clock4 size={20} />,
    label: 'Appointment',
    description: 'A scheduled meeting or appointment',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.12)',
  },
];

const CreateTypePicker: React.FC<CreateTypePickerProps> = ({ anchorRef, onSelect, onClose }) => {
  const pickerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        pickerRef.current && !pickerRef.current.contains(e.target as Node) &&
        anchorRef.current && !anchorRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  // Position relative to anchor button
  const getStyle = (): React.CSSProperties => {
    if (!anchorRef.current) return { top: 70, right: 16 };
    const rect = anchorRef.current.getBoundingClientRect();
    return {
      position: 'fixed',
      top: rect.bottom + 8,
      right: window.innerWidth - rect.right,
      zIndex: 200,
    };
  };

  return (
    <AnimatePresence>
      <motion.div
        ref={pickerRef}
        style={getStyle()}
        initial={{ opacity: 0, scale: 0.92, y: -8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: -8 }}
        transition={{ duration: 0.18, ease: [0.34, 1.56, 0.64, 1] }}
      >
        <div
          className="w-72 rounded-2xl overflow-hidden shadow-2xl"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-strong)',
            boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: '1px solid var(--border)' }}
          >
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
              What would you like to create?
            </span>
            <button
              onClick={onClose}
              className="w-5 h-5 flex items-center justify-center rounded transition-all"
              style={{ color: 'var(--text-muted)' }}
            >
              <X size={14} />
            </button>
          </div>

          {/* Options */}
          <div className="p-2 space-y-1">
            {options.map((opt) => (
              <button
                key={opt.type}
                onClick={() => onSelect(opt.type)}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all group"
                style={{ background: 'transparent' }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = opt.bg;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                }}
              >
                {/* Icon */}
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: opt.bg, color: opt.color }}
                >
                  {opt.icon}
                </div>

                {/* Text */}
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {opt.label}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {opt.description}
                  </p>
                </div>

                {/* Arrow */}
                <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: opt.color }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CreateTypePicker;
