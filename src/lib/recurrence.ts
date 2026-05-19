import {
  addDays,
  addMonths,
  addWeeks,
  endOfMonth,
  format,
  getDay,
  isAfter,
  isBefore,
  isSameDay,
  max as maxDate,
  startOfDay,
  startOfMonth,
} from 'date-fns';
import type { Recurrence, Task, TaskOccurrence } from '../types';
import { parseISODate } from './format';
import { isOccurrenceDone } from './taskCompletion';

function isWeekday(d: Date): boolean {
  const day = getDay(d);
  return day >= 1 && day <= 5;
}

function nextWeekdayOnOrAfter(d: Date): Date {
  let c = d;
  let guard = 0;
  while (!isWeekday(c) && guard < 7) {
    c = addDays(c, 1);
    guard++;
  }
  return c;
}

function nextCursorForScheduling(cursor: Date, recurrence: Recurrence): Date {
  if (recurrence === 'daily') return addDays(cursor, 1);
  if (recurrence === 'weekly') return addWeeks(cursor, 1);
  if (recurrence === 'monthly') return addMonths(cursor, 1);
  if (recurrence === 'weekdays') {
    let d = addDays(cursor, 1);
    let guard = 0;
    while (!isWeekday(d) && guard < 7) {
      d = addDays(d, 1);
      guard++;
    }
    return d;
  }
  if (recurrence === 'custom') {
    return addDays(cursor, 1);
  }
  return cursor;
}

export function advanceCursorToOnOrAfter(
  cursor: Date,
  minDate: Date,
  recurrence: Recurrence,
  customWeekdays: number[]
): Date {
  const min = startOfDay(minDate);
  let c = startOfDay(cursor);
  if (!isBefore(c, min)) return c;

  if (recurrence === 'custom') {
    const daySet = new Set(customWeekdays);
    if (daySet.size === 0) return c;
    let guard = 0;
    while (isBefore(c, min) && guard < 100_000) {
      guard++;
      if (daySet.has(getDay(c))) return c;
      c = addDays(c, 1);
    }
    return c;
  }

  if (recurrence === 'weekdays') {
    c = nextWeekdayOnOrAfter(c);
    if (!isBefore(c, min)) return c;
  }

  let guard = 0;
  while (isBefore(c, min) && guard < 100_000) {
    guard++;
    if (recurrence === 'weekdays' && !isWeekday(c)) {
      c = addDays(c, 1);
      continue;
    }
    const nextC = nextCursorForScheduling(c, recurrence);
    if (nextC.getTime() === c.getTime()) break;
    c = nextC;
  }
  return c;
}

function taskOccurrenceWithUiDone(
  base: Omit<TaskOccurrence, 'occurrenceDate'>,
  occISO: string,
  seriesStart: Date
): TaskOccurrence | null {
  const occ = parseISODate(occISO);
  if (isBefore(occ, seriesStart)) return null;
  return {
    ...base,
    occurrenceDate: occISO,
    done: isOccurrenceDone(base as Task, occISO),
  };
}

function pushOccurrence(
  occurrences: TaskOccurrence[],
  base: Omit<TaskOccurrence, 'occurrenceDate'>,
  cursor: Date,
  seriesStart: Date
): void {
  const occISO = format(cursor, 'yyyy-MM-dd');
  const item = taskOccurrenceWithUiDone(
    {
      ...base,
      isOccurrence: !isSameDay(cursor, seriesStart),
    },
    occISO,
    seriesStart
  );
  if (item) occurrences.push(item);
}

export function expandTaskForRange(
  task: Task,
  rangeStart: Date,
  rangeEnd: Date,
  maxOccurrences = 200
): TaskOccurrence[] {
  const seriesStart = startOfDay(parseISODate(task.date));
  const endDate = task.recurrenceEnd ? parseISODate(task.recurrenceEnd) : null;
  const floorStart = startOfDay(maxDate([seriesStart, rangeStart]));

  const isInRange = (d: Date): boolean =>
    !isBefore(d, rangeStart) && !isAfter(d, rangeEnd);

  const isOnOrAfterSeriesStart = (d: Date): boolean => !isBefore(d, seriesStart);

  const isBeforeOrEqualEnd = (d: Date): boolean =>
    !endDate || !isAfter(d, endDate);

  const occurrences: TaskOccurrence[] = [];
  const baseOcc: Omit<TaskOccurrence, 'occurrenceDate'> = {
    ...task,
    isOccurrence: false,
  };

  if (task.recurrence === 'none') {
    if (isInRange(seriesStart) && isOnOrAfterSeriesStart(seriesStart)) {
      const item = taskOccurrenceWithUiDone(baseOcc, task.date, seriesStart);
      if (item) occurrences.push(item);
    }
    return occurrences;
  }

  if (task.recurrence === 'custom') {
    const daySet = new Set(task.customWeekdays);
    if (daySet.size === 0) return [];
    let cursor = advanceCursorToOnOrAfter(
      seriesStart,
      floorStart,
      'custom',
      task.customWeekdays
    );
    let count = 0;
    while (
      !isAfter(cursor, rangeEnd) &&
      isBeforeOrEqualEnd(cursor) &&
      count < maxOccurrences
    ) {
      if (!daySet.has(getDay(cursor))) {
        cursor = addDays(cursor, 1);
        count++;
        continue;
      }
      if (isInRange(cursor) && isOnOrAfterSeriesStart(cursor)) {
        pushOccurrence(occurrences, baseOcc, cursor, seriesStart);
      }
      cursor = addDays(cursor, 1);
      count++;
    }
    return occurrences;
  }

  let cursor = advanceCursorToOnOrAfter(
    seriesStart,
    floorStart,
    task.recurrence,
    task.customWeekdays
  );
  if (task.recurrence === 'weekdays' && isBefore(cursor, seriesStart)) {
    cursor = seriesStart;
  }
  if (task.recurrence === 'weekdays' && !isWeekday(cursor) && !isBefore(cursor, seriesStart)) {
    cursor = nextWeekdayOnOrAfter(cursor);
  }

  let count = 0;
  while (
    !isAfter(cursor, rangeEnd) &&
    isBeforeOrEqualEnd(cursor) &&
    count < maxOccurrences
  ) {
    if (task.recurrence === 'weekdays' && !isWeekday(cursor)) {
      cursor = addDays(cursor, 1);
      count++;
      continue;
    }

    if (isInRange(cursor) && isOnOrAfterSeriesStart(cursor)) {
      pushOccurrence(occurrences, baseOcc, cursor, seriesStart);
    }
    cursor = nextCursorForScheduling(cursor, task.recurrence);
    count++;
  }
  return occurrences;
}

export function expandTasksForMonth(
  tasks: Task[],
  year: number,
  monthIndex: number
): TaskOccurrence[] {
  const start = startOfMonth(new Date(year, monthIndex, 1));
  const end = endOfMonth(start);
  const out: TaskOccurrence[] = [];
  for (const task of tasks) {
    out.push(...expandTaskForRange(task, start, end));
  }
  return out.sort((a, b) => {
    const cmp = a.occurrenceDate.localeCompare(b.occurrenceDate);
    if (cmp !== 0) return cmp;
    if (a.allDay && !b.allDay) return -1;
    if (!a.allDay && b.allDay) return 1;
    return a.time.localeCompare(b.time);
  });
}

export function expandTasksForDay(
  tasks: Task[],
  dayISO: string
): TaskOccurrence[] {
  const day = parseISODate(dayISO);
  const out: TaskOccurrence[] = [];
  for (const task of tasks) {
    out.push(...expandTaskForRange(task, day, day));
  }
  return out.sort((a, b) => {
    if (a.allDay && !b.allDay) return -1;
    if (!a.allDay && b.allDay) return 1;
    return a.time.localeCompare(b.time);
  });
}

export function nextOccurrencesForScheduling(
  task: Task,
  fromDate: Date,
  maxCount: number
): Date[] {
  const fromDay = startOfDay(fromDate);
  const seriesStart = startOfDay(parseISODate(task.date));
  const effectiveFrom = maxDate([seriesStart, fromDay]);
  const endDate = task.recurrenceEnd ? parseISODate(task.recurrenceEnd) : null;

  const dates: Date[] = [];

  if (task.recurrence === 'none') {
    if (!isBefore(seriesStart, effectiveFrom)) dates.push(seriesStart);
    return dates;
  }

  if (task.recurrence === 'custom') {
    const daySet = new Set(task.customWeekdays);
    if (daySet.size === 0) return [];
    let cursor = advanceCursorToOnOrAfter(
      seriesStart,
      effectiveFrom,
      'custom',
      task.customWeekdays
    );
    let guard = 0;
    const guardMax = 100_000;
    while (dates.length < maxCount && guard < guardMax) {
      guard++;
      if (endDate && isAfter(cursor, endDate)) break;
      if (
        daySet.has(getDay(cursor)) &&
        !isBefore(cursor, seriesStart) &&
        !isBefore(cursor, effectiveFrom)
      ) {
        dates.push(new Date(cursor.getTime()));
      }
      cursor = addDays(cursor, 1);
      if (dates.length === 0 && isAfter(cursor, addMonths(fromDate, 24))) break;
    }
    return dates;
  }

  let cursor = advanceCursorToOnOrAfter(
    seriesStart,
    effectiveFrom,
    task.recurrence,
    task.customWeekdays
  );
  if (task.recurrence === 'weekdays') {
    if (isBefore(cursor, seriesStart)) cursor = nextWeekdayOnOrAfter(seriesStart);
    else if (!isWeekday(cursor)) cursor = nextWeekdayOnOrAfter(cursor);
  }

  while (dates.length < maxCount) {
    if (endDate && isAfter(cursor, endDate)) break;

    if (task.recurrence === 'weekdays' && !isWeekday(cursor)) {
      cursor = addDays(cursor, 1);
      continue;
    }

    if (!isBefore(cursor, seriesStart) && !isBefore(cursor, effectiveFrom)) {
      dates.push(new Date(cursor.getTime()));
    }

    const nextC = nextCursorForScheduling(cursor, task.recurrence);
    if (nextC.getTime() === cursor.getTime()) break;
    cursor = nextC;

    if (dates.length === 0 && isAfter(cursor, addMonths(fromDate, 24))) break;
  }
  return dates;
}
