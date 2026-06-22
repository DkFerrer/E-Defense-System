const fs = require('fs');
const tsConfig = { "compilerOptions": { "module": "commonjs", "target": "es6" } };

const code = `
function parseTimeToMinutes(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return -1;
  const match = timeStr.trim().match(/^(\\d{1,2}):(\\d{2})\\s*(AM|PM)$/i);
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

function checkConflicts(draft, existingSchedules) {
  const draftStart = parseTimeToMinutes(draft.startTime);
  const draftEnd = parseTimeToMinutes(draft.endTime);

  if (draftStart === -1 || draftEnd === -1) {
    return { hasConflict: false };
  }

  for (const schedule of existingSchedules) {
    if (draft.id && schedule.id === draft.id) continue;
    if (schedule.date !== draft.date) continue;

    const existStart = parseTimeToMinutes(schedule.startTime);
    const existEnd = parseTimeToMinutes(schedule.endTime);

    if (existStart === -1 || existEnd === -1) continue;

    const timeOverlaps = draftStart < existEnd && draftEnd > existStart;

    if (timeOverlaps) {
      if (
        draft.venue &&
        schedule.venue &&
        draft.venue.trim().toLowerCase() === schedule.venue.trim().toLowerCase()
      ) {
        return {
          hasConflict: true,
          message: \`Conflict: Venue "\${schedule.venue}" is already booked for another defense at this time.\`,
        };
      }

      const existingPanelistsSet = new Set(schedule.panelists || []);
      for (const panelist of draft.panelists || []) {
        if (existingPanelistsSet.has(panelist)) {
          return {
            hasConflict: true,
            message: \`Conflict: Panelist "\${panelist}" is already scheduled for another defense at this time.\`,
          };
        }
      }
    }
  }

  return { hasConflict: false };
}

const existing = [
  { id: '1', date: 'Thursday, May 21, 2026', startTime: '1:00 PM', endTime: '3:00 PM', venue: 'Online', panelists: ['P1', 'P2'] }
];

console.log(checkConflicts({ date: 'Thursday, May 21, 2026', startTime: '2:00 PM', endTime: '4:00 PM', venue: 'Online', panelists: ['P3'] }, existing));
console.log(checkConflicts({ date: 'Thursday, May 21, 2026', startTime: '2:00 PM', endTime: '4:00 PM', venue: 'Room 2', panelists: ['P1'] }, existing));
console.log(checkConflicts({ date: 'Thursday, May 21, 2026', startTime: '3:00 PM', endTime: '4:00 PM', venue: 'Online', panelists: ['P1'] }, existing));
`;
fs.writeFileSync('C:/Users/learo/Scheduling/test.js', code);
