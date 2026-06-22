export type MonthCell = {
  date: Date;
  inCurrentMonth: boolean;
};

/** Sunday-first week rows for a calendar month (includes adjacent-month padding). */
export function getMonthGrid(year: number, monthIndex: number): MonthCell[] {
  const first = new Date(year, monthIndex, 1);
  const leading = first.getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const prevMonthIndex = monthIndex === 0 ? 11 : monthIndex - 1;
  const prevYear = monthIndex === 0 ? year - 1 : year;
  const prevMonthDays = new Date(year, monthIndex, 0).getDate();

  const cells: MonthCell[] = [];

  for (let i = 0; i < leading; i++) {
    const day = prevMonthDays - leading + i + 1;
    cells.push({
      date: new Date(prevYear, prevMonthIndex, day),
      inCurrentMonth: false,
    });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({
      date: new Date(year, monthIndex, d),
      inCurrentMonth: true,
    });
  }

  while (cells.length % 7 !== 0) {
    const last = cells[cells.length - 1].date;
    const next = new Date(last);
    next.setDate(last.getDate() + 1);
    cells.push({
      date: next,
      inCurrentMonth: false,
    });
  }

  return cells;
}

/** Week starting Sunday containing `anchor`. */
export function getWeekContaining(anchor: Date): Date[] {
  const d = new Date(anchor);
  d.setHours(0, 0, 0, 0);
  const dow = d.getDay();
  const start = new Date(d);
  start.setDate(d.getDate() - dow);
  return Array.from({ length: 7 }, (_, i) => {
    const x = new Date(start);
    x.setDate(start.getDate() + i);
    return x;
  });
}

export function sameCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** True when `date` is strictly before `today` (ignoring time). */
export function isPastDate(date: Date, today: Date): boolean {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const t = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return d.getTime() < t.getTime();
}
