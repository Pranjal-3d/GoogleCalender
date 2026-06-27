import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns';
import axios from 'axios';
import { fetchHolidays } from '../utils/holidays';

type ViewMode = 'day' | 'week' | 'month' | 'year' | 'schedule' | '4days' | 'tasks';

interface CalendarSettings {
  showWeekends: boolean;
  showDeclinedEvents: boolean;
  showCompletedTasks: boolean;
}

interface CalendarContextType {
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  events: any[];
  fetchEvents: () => Promise<void>;
  loading: boolean;
  settings: CalendarSettings;
  setSettings: (settings: Partial<CalendarSettings>) => void;
  hiddenCalendars: string[];
  toggleCalendar: (name: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  rawEvents: any[];
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/events`;

export const CalendarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [rawEvents, setRawEvents] = useState<any[]>([]);
  const [rawHolidays, setRawHolidays] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [settings, setSettingsState] = useState<CalendarSettings>({
    showWeekends: true,
    showDeclinedEvents: true,
    showCompletedTasks: true,
  });
  const [hiddenCalendars, setHiddenCalendars] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const setSettings = (newSettings: Partial<CalendarSettings>) => {
    setSettingsState(prev => ({ ...prev, ...newSettings }));
  };

  const toggleCalendar = (name: string) => {
    setHiddenCalendars(prev => 
      prev.includes(name) ? prev.filter(c => c !== name) : [...prev, name]
    );
  };

  const fetchEvents = async () => {
    setLoading(true);
    try {
      let start, end;
      if (viewMode === 'month') {
        start = startOfWeek(startOfMonth(currentDate));
        end = endOfWeek(endOfMonth(currentDate));
      } else if (viewMode === 'week') {
        start = startOfWeek(currentDate);
        end = endOfWeek(currentDate);
      } else {
        start = currentDate;
        end = currentDate;
      }

      const response = await axios.get(API_BASE_URL, {
        params: { 
          start: start.toISOString(), 
          end: end.toISOString() 
        }
      });
      const dbEvents = response.data;
      const yearHolidays = await fetchHolidays(currentDate.getFullYear());
      setRawEvents(dbEvents);
      setRawHolidays(yearHolidays);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [currentDate, viewMode]);

  // Reactively filter events whenever raw data, hiddenCalendars, or searchQuery changes
  const events = useMemo(() => {
    const combined = [
      ...rawEvents.filter((e: any) => {
        if (hiddenCalendars.includes('Pranjal Srivastava')) return false;
        if (e.eventType === 'task' && hiddenCalendars.includes('Tasks')) return false;
        return true;
      }),
      ...rawHolidays.filter(() => !hiddenCalendars.includes('Holidays in India'))
    ];

    if (!searchQuery.trim()) return combined;

    const lowerQuery = searchQuery.toLowerCase();
    return combined.filter(e => 
      e.title.toLowerCase().includes(lowerQuery) || 
      e.description?.toLowerCase().includes(lowerQuery) ||
      e.location?.toLowerCase().includes(lowerQuery)
    );
  }, [rawEvents, rawHolidays, hiddenCalendars, searchQuery]);


  return (
    <CalendarContext.Provider value={{ 
      currentDate, 
      setCurrentDate, 
      viewMode, 
      setViewMode, 
      events, 
      fetchEvents,
      loading,
      settings,
      setSettings,
      hiddenCalendars,
      toggleCalendar,
      searchQuery,
      setSearchQuery,
      rawEvents
    }}>
      {children}
    </CalendarContext.Provider>
  );
};

export const useCalendar = () => {
  const context = useContext(CalendarContext);
  if (!context) throw new Error('useCalendar must be used within a CalendarProvider');
  return context;
};
