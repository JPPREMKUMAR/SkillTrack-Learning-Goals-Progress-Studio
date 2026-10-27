/**
 * Timezone-safe date utilities for SkillTrack.
 * Avoids UTC day-shift bugs by operating on local calendar year, month, and day components.
 */

export function getTodayYMD(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDateToLocalYMD(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formats YYYY-MM-DD safely into a human-readable string like "Oct 27, 2026"
 */
export function formatYMDToReadable(
  ymd: string,
  options?: { shortMonth?: boolean; includeYear?: boolean }
): string {
  if (!ymd || !ymd.includes('-')) return '';
  const parts = ymd.split('-');
  if (parts.length !== 3) return ymd;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);

  if (isNaN(year) || isNaN(month) || isNaN(day)) return ymd;

  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  const fullMonthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  if (month < 0 || month > 11) return ymd;

  const mStr = options?.shortMonth === false ? fullMonthNames[month] : monthNames[month];
  if (options?.includeYear === false) {
    return `${mStr} ${day}`;
  }
  return `${mStr} ${day}, ${year}`;
}

/**
 * Calculates remaining days from today until target date.
 * Returns negative if target date is in the past.
 * Uses 12:00:00 noon anchor to eliminate daylight saving time 23/25-hour day edge cases.
 */
export function getDaysRemaining(targetYMD: string): number {
  if (!targetYMD) return 0;
  const todayStr = getTodayYMD();
  if (targetYMD === todayStr) return 0;

  const [tY, tM, tD] = targetYMD.split('-').map(Number);
  const [cY, cM, cD] = todayStr.split('-').map(Number);

  if (isNaN(tY) || isNaN(tM) || isNaN(tD)) return 0;

  const targetDate = new Date(tY, tM - 1, tD, 12, 0, 0);
  const currentDate = new Date(cY, cM - 1, cD, 12, 0, 0);

  const diffMs = targetDate.getTime() - currentDate.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Calculates study streak statistics:
 * - currentStreak: consecutive days studied ending today or yesterday
 * - longestStreak: max consecutive days studied ever
 * - totalDaysWithStudy: number of distinct days studied
 */
export function calculateStudyStreaks(sessionDates: string[]): {
  currentStreak: number;
  longestStreak: number;
  totalDaysWithStudy: number;
} {
  if (!sessionDates || sessionDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0, totalDaysWithStudy: 0 };
  }

  // Get unique sorted dates (descending: newest first)
  const uniqueDates = Array.from(new Set(sessionDates))
    .filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d))
    .sort((a, b) => b.localeCompare(a));

  if (uniqueDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0, totalDaysWithStudy: 0 };
  }

  const today = getTodayYMD();
  const now = new Date();
  const yesterdayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 12, 0, 0);
  const yesterday = formatDateToLocalYMD(yesterdayDate);

  let currentStreak = 0;
  const hasActiveStreak = uniqueDates[0] === today || uniqueDates[0] === yesterday;

  if (hasActiveStreak) {
    let checkDate =
      uniqueDates[0] === today
        ? new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0)
        : yesterdayDate;

    for (const d of uniqueDates) {
      const expectedYMD = formatDateToLocalYMD(checkDate);
      if (d === expectedYMD) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (d < expectedYMD) {
        break;
      }
    }
  }

  // Calculate longest streak across all history (sorted ascending)
  const ascDates = [...uniqueDates].sort((a, b) => a.localeCompare(b));
  let longestStreak = 0;
  let tempStreak = 0;
  let prevDate: Date | null = null;

  for (const d of ascDates) {
    const [y, m, day] = d.split('-').map(Number);
    const curr = new Date(y, m - 1, day, 12, 0, 0);

    if (!prevDate) {
      tempStreak = 1;
    } else {
      const diffDays = Math.round((curr.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        tempStreak++;
      } else if (diffDays > 1) {
        tempStreak = 1;
      }
    }
    if (tempStreak > longestStreak) {
      longestStreak = tempStreak;
    }
    prevDate = curr;
  }

  return {
    currentStreak,
    longestStreak: Math.max(longestStreak, currentStreak),
    totalDaysWithStudy: uniqueDates.length,
  };
}

/**
 * Calendar month grid helper
 * Returns an array of calendar cells (42 cells: 6 rows of 7 days) for a given year & month (0-indexed).
 */
export interface CalendarCell {
  date: Date;
  dateYMD: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
}

export function generateMonthGrid(year: number, month: number): CalendarCell[] {
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  // Sunday = 0, Monday = 1... Let's use Monday as start of week (1), or Sunday (0).
  // Standard educational / planner week start: Monday (index 0) or Sunday (index 0).
  // Let's use Monday as first day of week:
  // Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6
  let firstDayWeekday = firstDayOfMonth.getDay(); // 0 is Sun, 1 is Mon...
  const startOffset = (firstDayWeekday + 6) % 7; // Monday = 0, Sunday = 6

  const cells: CalendarCell[] = [];
  const todayYMD = getTodayYMD();

  // Days from previous month
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startOffset - 1; i >= 0; i--) {
    const day = prevMonthLastDay - i;
    const d = new Date(year, month - 1, day);
    const ymd = formatDateToLocalYMD(d);
    cells.push({
      date: d,
      dateYMD: ymd,
      dayNumber: day,
      isCurrentMonth: false,
      isToday: ymd === todayYMD,
    });
  }

  // Days in current month
  for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
    const d = new Date(year, month, day);
    const ymd = formatDateToLocalYMD(d);
    cells.push({
      date: d,
      dateYMD: ymd,
      dayNumber: day,
      isCurrentMonth: true,
      isToday: ymd === todayYMD,
    });
  }

  // Remaining days to fill 35 or 42 cells (5 or 6 rows)
  const totalSlots = cells.length > 35 ? 42 : 35;
  const remaining = totalSlots - cells.length;
  for (let day = 1; day <= remaining; day++) {
    const d = new Date(year, month + 1, day);
    const ymd = formatDateToLocalYMD(d);
    cells.push({
      date: d,
      dateYMD: ymd,
      dayNumber: day,
      isCurrentMonth: false,
      isToday: ymd === todayYMD,
    });
  }

  return cells;
}

/**
 * Returns past N days as array of YMD strings (including today)
 */
export function getPastNDaysYMD(n: number): string[] {
  const result: string[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    result.push(formatDateToLocalYMD(d));
  }
  return result;
}

/**
 * Returns past N months as { year: number, month: number, label: string, key: string }
 */
export function getPastNMonths(n: number): { year: number; month: number; label: string; key: string }[] {
  const result: { year: number; month: number; label: string; key: string }[] = [];
  const now = new Date();
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const y = d.getFullYear();
    const m = d.getMonth();
    const key = `${y}-${String(m + 1).padStart(2, '0')}`;
    result.push({
      year: y,
      month: m,
      label: `${monthNames[m]} ${y}`,
      key,
    });
  }
  return result;
}
