import { addDays, format, getDay, isAfter, isBefore, startOfDay } from 'date-fns';
import type { Task } from '../types';
import { combineDateTime, parseISODate } from './format';
import { advanceCursorToOnOrAfter } from './recurrence';

const AUTO_COMPLETE_MAX_STEPS = 4000;

export function isOccurrenceDone(task: Task, occurrenceDate: string): boolean {
  if (task.completedOccurrenceDates.includes(occurrenceDate)) return true;
  if (task.recurrence === 'none' && task.done && task.date === occurrenceDate) return true;
  if (task.done && task.recurrence !== 'none') return true;
  return false;
}

function occurrenceInstantPassed(task: Task, occurrenceISO: string, now: Date): boolean {
  if (task.allDay) {
    const end = combineDateTime(occurrenceISO, '23:59');
    return now.getTime() > end.getTime() + 59_999;
  }
  const start = combineDateTime(occurrenceISO, task.time);
  return now.getTime() > start.getTime();
}

function isWeekday(d: Date): boolean {
  const day = getDay(d);
  return day >= 1 && day <= 5;
}

function nextCursorAfterOccurrence(cursor: Date, task: Task): Date {
  const { recurrence } = task;
  if (recurrence === 'daily') return addDays(cursor, 1);
  if (recurrence === 'weekly') return addDays(cursor, 7);
  if (recurrence === 'monthly') {
    const d = new Date(cursor);
    d.setMonth(d.getMonth() + 1);
    return d;
  }
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

function isOnOrAfterSeriesStart(cursor: Date, seriesStart: Date): boolean {
  return !isBefore(startOfDay(cursor), seriesStart);
}

export function applyAutoCompletedOccurrences(tasks: Task[], now: Date): Task[] {
  return tasks.map((task) => {
    if (task.recurrence === 'custom') {
      const daySet = new Set(task.customWeekdays);
      if (daySet.size === 0) return task;
      const seriesStart = startOfDay(parseISODate(task.date));
      const endCap = task.recurrenceEnd ? parseISODate(task.recurrenceEnd) : null;
      let cursor = advanceCursorToOnOrAfter(
        seriesStart,
        seriesStart,
        'custom',
        task.customWeekdays
      );
      const toAdd: string[] = [];
      let steps = 0;
      while (steps < AUTO_COMPLETE_MAX_STEPS) {
        if (endCap && isAfter(cursor, endCap)) break;
        if (!daySet.has(getDay(cursor))) {
          cursor = addDays(cursor, 1);
          steps++;
          continue;
        }
        if (!isOnOrAfterSeriesStart(cursor, seriesStart)) {
          cursor = addDays(cursor, 1);
          steps++;
          continue;
        }
        const occISO = format(cursor, 'yyyy-MM-dd');
        if (!occurrenceInstantPassed(task, occISO, now)) break;
        toAdd.push(occISO);
        cursor = nextCursorAfterOccurrence(cursor, task);
        steps++;
      }
      return mergeCompletedDates(task, toAdd);
    }

    if (task.recurrence === 'none') {
      if (occurrenceInstantPassed(task, task.date, now)) {
        return mergeCompletedDates(task, [task.date]);
      }
      return task;
    }

    const seriesStart = startOfDay(parseISODate(task.date));
    const endDate = task.recurrenceEnd ? parseISODate(task.recurrenceEnd) : null;
    let cursor = advanceCursorToOnOrAfter(
      seriesStart,
      seriesStart,
      task.recurrence,
      task.customWeekdays
    );
    const toAdd: string[] = [];
    let steps = 0;

    while (steps < AUTO_COMPLETE_MAX_STEPS) {
      if (endDate && isAfter(cursor, endDate)) break;

      if (task.recurrence === 'weekdays' && !isWeekday(cursor)) {
        cursor = addDays(cursor, 1);
        steps++;
        continue;
      }

      if (!isOnOrAfterSeriesStart(cursor, seriesStart)) {
        cursor = nextCursorAfterOccurrence(cursor, task);
        steps++;
        continue;
      }

      const occISO = format(cursor, 'yyyy-MM-dd');
      if (!occurrenceInstantPassed(task, occISO, now)) break;

      toAdd.push(occISO);
      cursor = nextCursorAfterOccurrence(cursor, task);
      steps++;
    }

    return mergeCompletedDates(task, toAdd);
  });
}

function mergeCompletedDates(task: Task, add: string[]): Task {
  if (add.length === 0) return task;
  const set = new Set(task.completedOccurrenceDates);
  for (const d of add) set.add(d);
  const sorted = [...set].sort();
  let done = task.done;
  if (task.recurrence === 'none' && sorted.includes(task.date)) {
    done = true;
  }
  const same =
    sorted.length === task.completedOccurrenceDates.length &&
    sorted.every((d, i) => d === task.completedOccurrenceDates[i]);
  if (same && done === task.done) return task;
  return {
    ...task,
    completedOccurrenceDates: sorted,
    done,
  };
}
