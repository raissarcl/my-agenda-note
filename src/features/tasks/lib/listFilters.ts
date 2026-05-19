import { formatDateISOLocal, parseISODate } from '../../../lib/format';
import { isOccurrenceDone } from '../../../lib/taskCompletion';
import type { TaskOccurrence } from '../../../types';

export type QuickFilter = 'month' | 'today' | 'next7' | 'overdue' | 'done';

export function withoutCompletedOccurrences(
  occurrences: TaskOccurrence[]
): TaskOccurrence[] {
  return occurrences.filter((o) => !isOccurrenceDone(o, o.occurrenceDate));
}

export function isEmptyOnlyBecauseHideCompleted(
  visible: TaskOccurrence[],
  unfiltered: TaskOccurrence[],
  hideCompleted: boolean
): boolean {
  return hideCompleted && visible.length === 0 && unfiltered.length > 0;
}

export function filterOccurrences(
  occurrences: TaskOccurrence[],
  quickFilter: QuickFilter
): TaskOccurrence[] {
  const now = new Date();
  const todayStr = formatDateISOLocal(now);
  const next7End = new Date(now);
  next7End.setDate(now.getDate() + 7);
  const next7EndStr = formatDateISOLocal(next7End);

  if (quickFilter === 'month') return occurrences;
  if (quickFilter === 'today') {
    return occurrences.filter((o) => o.occurrenceDate === todayStr);
  }
  if (quickFilter === 'next7') {
    return occurrences.filter(
      (o) => o.occurrenceDate >= todayStr && o.occurrenceDate <= next7EndStr
    );
  }
  if (quickFilter === 'done') {
    return occurrences.filter((o) => isOccurrenceDone(o, o.occurrenceDate));
  }
  return occurrences.filter((o) => isOccurrenceOverdue(o, now, todayStr));
}

export function groupOccurrencesByDay(
  occurrences: TaskOccurrence[]
): Array<{ title: string; data: TaskOccurrence[] }> {
  const map = new Map<string, TaskOccurrence[]>();
  for (const o of occurrences) {
    const arr = map.get(o.occurrenceDate);
    if (arr) arr.push(o);
    else map.set(o.occurrenceDate, [o]);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([title, data]) => ({ title, data }));
}

function isOccurrenceOverdue(
  o: TaskOccurrence,
  now: Date,
  todayStr: string
): boolean {
  if (isOccurrenceDone(o, o.occurrenceDate)) return false;
  if (o.allDay) return o.occurrenceDate < todayStr;
  const base = parseISODate(o.occurrenceDate);
  const [h, m] = o.time.split(':').map(Number);
  base.setHours(h ?? 0, m ?? 0, 0, 0);
  return base.getTime() < now.getTime();
}
