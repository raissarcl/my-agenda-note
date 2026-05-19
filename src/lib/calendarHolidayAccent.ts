import type { HolidayCalendarKind } from './brHolidays';
import { HOLIDAY_KIND_ORDER } from './brHolidays';

const ACCENTS = {
  official: { light: '#0d9488', dark: '#2dd4bf' },
  optional: { light: '#c2410c', dark: '#fb923c' },
  observance: { light: '#7c3aed', dark: '#c4b5fd' },
} as const;

export function calendarAccentForHolidayKind(
  kind: HolidayCalendarKind,
  isDark: boolean
): string {
  const row = ACCENTS[kind];
  return isDark ? row.dark : row.light;
}

export function pickStrongestHolidayKind(
  kinds: HolidayCalendarKind[]
): HolidayCalendarKind {
  for (const k of HOLIDAY_KIND_ORDER) {
    if (kinds.includes(k)) return k;
  }
  return 'observance';
}

export function calendarHolidayAccent(isDark: boolean): string {
  return calendarAccentForHolidayKind('official', isDark);
}
