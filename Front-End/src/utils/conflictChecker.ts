import { type DefenseSchedule } from '../context/ScheduleContext';

/**
 * Parses a time string like "1:00 PM" into total minutes past midnight.
 * Returns -1 if invalid.
 */
function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr || typeof timeStr !== 'string') return -1;
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return -1;

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const modifier = match[3].toUpperCase();

  if (hours === 12) {
    hours = modifier === 'AM' ? 0 : 12;
  } else if (modifier === 'PM') {
    hours += 12;
  }

  return hours * 60 + minutes;
}

export type ConflictResult = {
  hasConflict: boolean;
  message?: string;
};

type DraftSchedule = {
  id?: string;
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  panelists: string[];
};

export function checkConflicts(
  draft: DraftSchedule,
  existingSchedules: DefenseSchedule[]
): ConflictResult {
  const draftStart = parseTimeToMinutes(draft.startTime);
  const draftEnd = parseTimeToMinutes(draft.endTime);

  if (draftStart === -1 || draftEnd === -1) {
    return { hasConflict: false }; // Cannot check invalid times
  }

  for (const schedule of existingSchedules) {
    // Ignore self if editing
    if (draft.id && schedule.id === draft.id) continue;

    // Must be on the exact same date
    if (schedule.date !== draft.date) continue;

    const existStart = parseTimeToMinutes(schedule.startTime);
    const existEnd = parseTimeToMinutes(schedule.endTime);

    if (existStart === -1 || existEnd === -1) continue;

    // Check for time overlap
    // Two intervals (Start A, End A) and (Start B, End B) overlap if:
    // Start A < End B  AND  End A > Start B
    const timeOverlaps = draftStart < existEnd && draftEnd > existStart;

    if (timeOverlaps) {
      // 1. Check Venue
      if (
        draft.venue &&
        schedule.venue &&
        draft.venue.trim().toLowerCase() === schedule.venue.trim().toLowerCase()
      ) {
        return {
          hasConflict: true,
          message: `Conflict: Venue "${schedule.venue}" is already booked for another defense at this time.`,
        };
      }

      // 2. Check Panelists
      const existingPanelistsSet = new Set(schedule.panelists || []);
      for (const panelist of draft.panelists || []) {
        if (existingPanelistsSet.has(panelist)) {
          return {
            hasConflict: true,
            message: `Conflict: Panelist "${panelist}" is already scheduled for another defense at this time.`,
          };
        }
      }
    }
  }

  return { hasConflict: false };
}
