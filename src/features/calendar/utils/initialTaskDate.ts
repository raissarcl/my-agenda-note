import { formatDateISOLocal, todayISO } from '../../../lib/format';

export function initialTaskDateForCalendar(
  selected: string | null,
  year: number,
  monthIndex: number
): string {
  if (selected) return selected;
  const now = new Date();
  if (now.getFullYear() === year && now.getMonth() === monthIndex) {
    return todayISO();
  }
  return formatDateISOLocal(new Date(year, monthIndex, 1));
}
