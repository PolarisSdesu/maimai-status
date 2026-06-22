import type { CalendarDay, CalendarCell } from './types';

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleString('zh-CN', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function relativeTime(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const min = Math.floor(ms / 60000);
  if (min < 1) return '刚刚';
  if (min < 60) return `${min} 分钟前`;
  const h = Math.floor(min / 60);
  return `${h} 小时前`;
}

export function isToday(year: number, month: number, day: number): boolean {
  const t = new Date();
  return t.getFullYear() === year && t.getMonth() + 1 === month && t.getDate() === day;
}

export function isTodayISO(iso: string): boolean {
  const d = new Date(iso);
  const t = new Date();
  return (
    d.getFullYear() === t.getFullYear() &&
    d.getMonth() === t.getMonth() &&
    d.getDate() === t.getDate()
  );
}

export const WEEKDAYS = ['一', '二', '三', '四', '五', '六', '日'];

export function monthLabel(year: number, month: number): string {
  return `${year}年${month}月`;
}

export function getCalendarGrid(
  calYear: number,
  calMonth: number,
  calDays: CalendarDay[],
): CalendarCell[] {
  const daysInMonth = new Date(calYear, calMonth, 0).getDate();
  const firstDayOfWeek = new Date(calYear, calMonth - 1, 1).getDay();
  const startOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

  const prevMonth = calMonth === 1 ? 12 : calMonth - 1;
  const prevYear = calMonth === 1 ? calYear - 1 : calYear;
  const daysInPrevMonth = new Date(prevYear, prevMonth, 0).getDate();

  const grid: CalendarCell[] = [];

  for (let i = 0; i < startOffset; i++) {
    const day = daysInPrevMonth - startOffset + i + 1;
    grid.push({
      day,
      dateStr: '',
      added: 0,
      removed: 0,
      isCurrentMonth: false,
      isToday: false,
    });
  }

  const changeMap = new Map<string, { added: number; removed: number }>();
  for (const d of calDays) changeMap.set(d.date, d);

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${calYear}-${String(calMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const changes = changeMap.get(dateStr);
    grid.push({
      day: d,
      dateStr,
      added: changes?.added ?? 0,
      removed: changes?.removed ?? 0,
      isCurrentMonth: true,
      isToday: isToday(calYear, calMonth, d),
    });
  }
  return grid;
}
