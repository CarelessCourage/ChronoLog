export interface TimeEntry {
  date: string;
  project: string;
  hours: number;
}

export interface WeeklyTimeSheet {
  project: string;
  monday: number;
  tuesday: number;
  wednesday: number;
  thursday: number;
  friday: number;
  saturday: number;
  sunday: number;
}

const AUTH_KEY = 'chronolog_auth';
const ENTRIES_KEY = 'chronolog_entries';
const TIMESHEET_KEY = 'chronolog_timesheet';

export const storage = {
  auth: {
    login: () => {
      if (typeof window !== 'undefined') {
        localStorage.setItem(AUTH_KEY, 'true');
      }
    },
    logout: () => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(AUTH_KEY);
      }
    },
    isLoggedIn: (): boolean => {
      if (typeof window === 'undefined') return false;
      return localStorage.getItem(AUTH_KEY) === 'true';
    }
  },
  entries: {
    getAll: (): TimeEntry[] => {
      if (typeof window === 'undefined') return [];
      const data = localStorage.getItem(ENTRIES_KEY);
      return data ? JSON.parse(data) : [];
    },
    getByDate: (date: string): TimeEntry | null => {
      const entries = storage.entries.getAll();
      return entries.find(entry => entry.date === date) || null;
    },
    save: (entry: TimeEntry): void => {
      if (typeof window === 'undefined') return;
      const entries = storage.entries.getAll();
      const existingIndex = entries.findIndex(e => e.date === entry.date);

      if (existingIndex >= 0) {
        entries[existingIndex] = entry;
      } else {
        entries.push(entry);
      }

      localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
    }
  },
  timesheet: {
    getAll: (): TimeEntry[] => {
      if (typeof window === 'undefined') return [];
      const data = localStorage.getItem(TIMESHEET_KEY);
      return data ? JSON.parse(data) : [];
    },
    getByProjectAndDate: (project: string, date: string): TimeEntry | null => {
      const entries = storage.timesheet.getAll();
      return entries.find(entry => entry.project === project && entry.date === date) || null;
    },
    save: (entry: TimeEntry): void => {
      if (typeof window === 'undefined') return;
      const entries = storage.timesheet.getAll();
      const existingIndex = entries.findIndex(e => e.project === entry.project && e.date === entry.date);

      if (existingIndex >= 0) {
        entries[existingIndex] = entry;
      } else {
        entries.push(entry);
      }

      localStorage.setItem(TIMESHEET_KEY, JSON.stringify(entries));
    }
  }
};
