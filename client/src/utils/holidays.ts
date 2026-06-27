import axios from 'axios';
import { startOfDay } from 'date-fns';

export interface Holiday {
  _id: string;
  title: string;
  startTime: string;
  endTime: string;
  color: string;
  isHoliday: boolean;
  eventType: 'event';
}

const STATIC_HOLIDAYS_2026 = [
  { day: 1, month: 0, title: 'New Year\'s Day' },
  { day: 14, month: 0, title: 'Makar Sankranti' },
  { day: 26, month: 0, title: 'Republic Day' },
  { day: 4, month: 2, title: 'Holi' },
  { day: 21, month: 2, title: 'Id-ul-Fitr' },
  { day: 26, month: 2, title: 'Ram Navami' },
  { day: 31, month: 2, title: 'Mahavir Jayanti' },
  { day: 3, month: 3, title: 'Good Friday' },
  { day: 1, month: 4, title: 'Buddha Purnima' },
  { day: 27, month: 5, title: 'Id-ul-Zuha (Bakrid)' },
  { day: 19, month: 5, title: 'Juneteenth' },
  { day: 21, month: 5, title: 'International Yoga Day' },
  { day: 26, month: 5, title: 'Muharram' },
  { day: 15, month: 7, title: 'Independence Day' },
  { day: 26, month: 7, title: 'Milad-un-Nabi' },
  { day: 4, month: 8, title: 'Janmashtami' },
  { day: 2, month: 9, title: 'Mahatma Gandhi\'s Birthday' },
  { day: 20, month: 9, title: 'Dussehra' },
  { day: 8, month: 10, title: 'Diwali (Deepavali)' },
  { day: 24, month: 10, title: 'Guru Nanak\'s Birthday' },
  { day: 25, month: 11, title: 'Christmas Day' },
];

const createHolidayObject = (date: Date, title: string): Holiday => {
  const d = startOfDay(date);
  return {
    _id: `holiday-${title}-${d.getTime()}`,
    title,
    startTime: d.toISOString(),
    endTime: new Date(d.getTime() + 24 * 60 * 60 * 1000 - 1).toISOString(),
    color: '#10b981', // Green
    isHoliday: true,
    eventType: 'event',
  };
};

export const fetchHolidays = async (year: number): Promise<Holiday[]> => {
  try {
    // Try Nager.Date API (Public & Keyless)
    const response = await axios.get(`https://date.nager.at/api/v3/PublicHolidays/${year}/IN`);
    if (response.data && response.data.length > 0) {
      return response.data.map((h: any) => createHolidayObject(new Date(h.date), h.name));
    }
    throw new Error('No data from API');
  } catch (error) {
    console.warn('Holiday API failed, using fallback list', error);
    
    // Fallback to static list for 2026 if API fails
    if (year === 2026) {
      return STATIC_HOLIDAYS_2026.map(h => 
        createHolidayObject(new Date(2026, h.month, h.day), h.title)
      );
    }
    
    // Minimal generic fallback for other years
    return [
      createHolidayObject(new Date(year, 0, 1), 'New Year\'s Day'),
      createHolidayObject(new Date(year, 7, 15), 'Independence Day'),
      createHolidayObject(new Date(year, 11, 25), 'Christmas Day'),
    ];
  }
};
