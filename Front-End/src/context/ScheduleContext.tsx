import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

export type DefenseSchedule = {
  id: string; // Used as the local key or could be mapped to the DB 'id'
  stage: string;
  title: string;
  date: string;
  dateObj: Date;
  startTime: string;
  endTime: string;
  venue: string;
  researchers: string[];
  panelists: string[];
  approvedConcept: boolean;
  paymentReceipt: boolean;
  messageHtml: string;
};

// Represents the schema returned by our Laravel API
type ApiSchedule = {
  id: number;
  stage: string;
  title: string;
  date: string;
  dateIso: string;
  startTime: string;
  endTime: string;
  venue: string;
  researchers: string[];
  panelists: string[];
  approvedConcept: boolean;
  paymentReceipt: boolean;
  messageHtml: string;
};

export type PendingRequest = {
  id: string;
  title: string;
  researchers: string[];
  stage: string;
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
};

const INITIAL_DUMMY_REQUESTS: PendingRequest[] = [
  {
    id: 'req-001',
    title: 'AI-Driven Crop Disease Detection',
    researchers: ['John Smith', 'Alice Brown'],
    stage: 'Title Defense',
    date: 'Thursday, May 21, 2026',
    startTime: '1:00 PM',
    endTime: '3:00 PM',
    venue: 'Online via MS Teams',
  },
  {
    id: 'req-002',
    title: 'Blockchain for Academic Credentials',
    researchers: ['Mark Lee', 'Sarah Connor'],
    stage: 'Review Defense',
    date: 'Friday, May 22, 2026',
    startTime: '9:00 AM',
    endTime: '11:00 AM',
    venue: 'JH 14, University of Nueva Caceres',
  },
  {
    id: 'req-003',
    title: 'IoT Smart Parking Management System',
    researchers: ['David Kim'],
    stage: 'Final Defense',
    date: 'Monday, May 25, 2026',
    startTime: '3:00 PM',
    endTime: '6:00 PM',
    venue: 'JH 33, University of Nueva Caceres',
  },
];

type ScheduleContextValue = {
  schedules: DefenseSchedule[];
  pendingRequests: PendingRequest[];
  removePendingRequest: (id: string) => void;
  addSchedule: (s: DefenseSchedule) => Promise<void>;
  updateSchedule: (id: string, s: DefenseSchedule) => Promise<void>;
  deleteSchedule: (id: string) => Promise<void>;
  getSchedulesForDate: (d: Date) => DefenseSchedule[];
};

const ScheduleContext = createContext<ScheduleContextValue | null>(null);

// Configure the URL to match where Laravel is running locally
const API_URL = 'http://localhost:8000/api/schedules';

// Convert API response to our app's format (with Date object)
function fromApi(s: ApiSchedule): DefenseSchedule {
  return {
    ...s,
    id: String(s.id), // Ensure it acts as a string ID for React keys
    dateObj: new Date(s.dateIso),
  };
}

export function ScheduleProvider({ children }: { children: React.ReactNode }) {
  const [schedules, setSchedules] = useState<DefenseSchedule[]>([]);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>(INITIAL_DUMMY_REQUESTS);

  const removePendingRequest = useCallback((id: string) => {
    setPendingRequests((prev) => prev.filter((r) => r.id !== id));
  }, []);

  // 1. Read (GET): Load schedules from Laravel database
  const loadSchedules = useCallback(async () => {
    try {
      const response = await fetch(API_URL, {
        headers: {
          'Accept': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch schedules');
      
      const data: ApiSchedule[] = await response.json();
      const mapped = data.map(fromApi);
      setSchedules(mapped);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    }
  }, []);

  // Load once on mount
  useEffect(() => {
    loadSchedules();
  }, [loadSchedules]);

  // 2. Create (POST): Add a new schedule to the database
  const addSchedule = useCallback(async (s: DefenseSchedule) => {
    try {
      // Convert our local Date object back to ISO string for Laravel
      const payload = {
        ...s,
        dateIso: s.dateObj.toISOString(),
      };

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to save to database');
      
      // Reload the entire list to ensure we have the correct DB assigned 'id'
      await loadSchedules();
    } catch (error) {
      console.error('Error saving schedule:', error);
      // Fallback: update local state if server fails
      setSchedules((prev) => [...prev, s]);
    }
  }, [loadSchedules]);

  // 3. Update (PUT): Modify an existing schedule
  const updateSchedule = useCallback(async (id: string, s: DefenseSchedule) => {
    try {
      const payload = {
        ...s,
        dateIso: s.dateObj.toISOString(),
      };

      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to update in database');
      await loadSchedules();
    } catch (error) {
      console.error('Error updating schedule:', error);
      // Fallback
      setSchedules((prev) => prev.map((item) => (item.id === id ? s : item)));
    }
  }, [loadSchedules]);

  // 4. Delete (DELETE): Remove schedule from database
  const deleteSchedule = useCallback(async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to delete from database');
      await loadSchedules();
    } catch (error) {
      console.error('Error deleting schedule:', error);
      // Fallback
      setSchedules((prev) => prev.filter((item) => item.id !== id));
    }
  }, [loadSchedules]);

  const getSchedulesForDate = useCallback(
    (d: Date) => {
      return schedules.filter(
        (s) =>
          s.dateObj.getFullYear() === d.getFullYear() &&
          s.dateObj.getMonth() === d.getMonth() &&
          s.dateObj.getDate() === d.getDate()
      );
    },
    [schedules]
  );

  return (
    <ScheduleContext.Provider value={{ 
      schedules, 
      pendingRequests,
      removePendingRequest,
      addSchedule, 
      updateSchedule, 
      deleteSchedule, 
      getSchedulesForDate 
    }}>
      {children}
    </ScheduleContext.Provider>
  );
}

export function useSchedules() {
  const ctx = useContext(ScheduleContext);
  if (!ctx) throw new Error('useSchedules must be used within ScheduleProvider');
  return ctx;
}
