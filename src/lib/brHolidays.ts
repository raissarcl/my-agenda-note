import Holidays from 'date-holidays';
import { t } from './i18n';

const SHOW_TYPES: ReadonlySet<string> = new Set([
  'public',
  'bank',
  'optional',
  'observance',
]);

export type HolidayCalendarKind = 'official' | 'optional' | 'observance';

export const HOLIDAY_KIND_ORDER: readonly HolidayCalendarKind[] = [
  'official',
  'optional',
  'observance',
];

export type BrazilCalendarDayInfo = {
  label: string;
  kinds: HolidayCalendarKind[];
};

let instance: Holidays | null = null;

function hd(): Holidays {
  if (!instance) {
    instance = new Holidays('BR', { languages: ['pt', 'en'] });
  }
  return instance;
}

function isoFromHolidayDate(dateStr: string): string {
  return dateStr.slice(0, 10);
}

function displayHolidayLabel(rawName: string | undefined): string {
  const n = typeof rawName === 'string' ? rawName.trim() : '';
  if (n.length > 0) return n;
  return t.holidayFacultative;
}

function libraryTypeToKind(type: string | undefined): HolidayCalendarKind | null {
  if (type === 'public' || type === 'bank') return 'official';
  if (type === 'optional') return 'optional';
  if (type === 'observance') return 'observance';
  return null;
}

function mergeDayInfos(
  labels: string[],
  kindSet: Set<HolidayCalendarKind>
): BrazilCalendarDayInfo {
  const uniqueLabels = [...new Set(labels.filter(Boolean))];
  return {
    label: uniqueLabels.join(' · '),
    kinds: HOLIDAY_KIND_ORDER.filter((k) => kindSet.has(k)),
  };
}

export function brazilCalendarDayInfoOnDate(
  dateISO: string
): BrazilCalendarDayInfo | null {
  const parts = dateISO.split('-').map(Number);
  const y = parts[0];
  const mo = parts[1];
  const d = parts[2];
  if (!y || !mo || !d) return null;

  const list = hd().getHolidays(y, 'pt');
  const matches = list.filter((h) => {
    if (!SHOW_TYPES.has(h.type)) return false;
    const kind = libraryTypeToKind(h.type);
    if (!kind) return false;
    return isoFromHolidayDate(h.date) === dateISO;
  });
  if (matches.length > 0) {
    const kindSet = new Set<HolidayCalendarKind>();
    const labels: string[] = [];
    for (const m of matches) {
      const kind = libraryTypeToKind(m.type);
      if (!kind) continue;
      kindSet.add(kind);
      labels.push(displayHolidayLabel(m.name));
    }
    if (kindSet.size === 0) return null;
    return mergeDayInfos(labels, kindSet);
  }

  const dt = new Date(y, mo - 1, d, 12, 0, 0, 0);
  const hits = hd().isHoliday(dt);
  if (!hits || hits.length === 0) return null;
  const kindSet = new Set<HolidayCalendarKind>();
  const labels: string[] = [];
  for (const h of hits) {
    if (!SHOW_TYPES.has(h.type)) continue;
    const kind = libraryTypeToKind(h.type);
    if (!kind) continue;
    kindSet.add(kind);
    labels.push(displayHolidayLabel(h.name));
  }
  if (kindSet.size === 0) return null;
  return mergeDayInfos(labels, kindSet);
}

export function brazilHolidayNameOnDate(dateISO: string): string | null {
  return brazilCalendarDayInfoOnDate(dateISO)?.label ?? null;
}

export function brazilHolidaysInMonth(
  year: number,
  monthIndex: number
): Record<string, BrazilCalendarDayInfo> {
  const list = hd().getHolidays(year, 'pt');
  const bucket: Record<
    string,
    { labels: string[]; kindSet: Set<HolidayCalendarKind> }
  > = {};
  for (const h of list) {
    if (!SHOW_TYPES.has(h.type)) continue;
    const kind = libraryTypeToKind(h.type);
    if (!kind) continue;
    const iso = isoFromHolidayDate(h.date);
    const [, m] = iso.split('-').map(Number);
    if (m !== monthIndex + 1) continue;
    if (!bucket[iso]) bucket[iso] = { labels: [], kindSet: new Set() };
    bucket[iso].labels.push(displayHolidayLabel(h.name));
    bucket[iso].kindSet.add(kind);
  }
  const out: Record<string, BrazilCalendarDayInfo> = {};
  for (const [iso, v] of Object.entries(bucket)) {
    out[iso] = mergeDayInfos(v.labels, v.kindSet);
  }
  return out;
}
