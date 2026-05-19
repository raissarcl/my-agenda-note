import { getDay, isAfter, isBefore } from 'date-fns';
import {
  CURRENT_SCHEMA_VERSION,
  DEFAULT_SETTINGS,
  type PersistedBlob,
  type Recurrence,
  type Task,
} from '../types';
import { parseISODate } from '../lib/format';
import {
  clampRecurrenceEndToBounds,
  maxRecurrenceEndISO,
} from '../lib/recurrenceBounds';
import { isNote, isNotebook } from '../lib/notes';
import { filterValidQuickReminders } from '../lib/quickReminders';
import { isTaskTagId } from '../lib/taskTags';

const VALID_RECURRENCE: Recurrence[] = [
  'none',
  'daily',
  'weekly',
  'monthly',
  'weekdays',
  'custom',
];

type LegacyTask = Omit<Task, 'customWeekdays' | 'notificationsPausedUntil' | 'tagId'> & {
  customRecurrenceDates?: string[];
  customWeekdays?: unknown;
  notificationsPausedUntil?: unknown;
  tagId?: unknown;
};

function normalizeRecurrence(r: unknown): Recurrence {
  if (typeof r === 'string' && VALID_RECURRENCE.includes(r as Recurrence)) {
    return r as Recurrence;
  }
  return 'none';
}

function deriveCustomWeekdaysFromLegacyDates(
  dates: string[],
  taskDate: string,
  recurrenceEnd: string | undefined
): number[] {
  const start = parseISODate(taskDate);
  const end = recurrenceEnd ? parseISODate(recurrenceEnd) : null;
  const set = new Set<number>();
  for (const iso of dates) {
    const d = parseISODate(iso);
    if (isBefore(d, start)) continue;
    if (end && isAfter(d, end)) continue;
    set.add(getDay(d));
  }
  const arr = [...set].sort((a, b) => a - b);
  return arr.length > 0 ? arr : [1, 2, 3, 4, 5];
}

function normalizeCustomWeekdays(raw: unknown): number[] {
  if (!Array.isArray(raw)) return [];
  const nums = raw
    .map((x) => (typeof x === 'number' ? x : Number(x)))
    .filter((n) => n >= 0 && n <= 6 && Number.isInteger(n));
  return [...new Set(nums)].sort((a, b) => a - b);
}

function normalizeTask(task: LegacyTask, fromVersion: number): Task {
  const recurrence = normalizeRecurrence(task.recurrence);
  let completedOccurrenceDates = Array.isArray(task.completedOccurrenceDates)
    ? [...new Set(task.completedOccurrenceDates as string[])].sort()
    : [];

  if (fromVersion < 2) {
    if (task.done === true && recurrence === 'none') {
      completedOccurrenceDates = [...new Set([...completedOccurrenceDates, task.date])].sort();
    }
  }

  const legacyDates = Array.isArray(task.customRecurrenceDates)
    ? [...new Set(task.customRecurrenceDates as string[])].sort()
    : [];

  const notificationsPaused = task.notificationsPaused === true;

  let recurrenceEnd: string | undefined;
  if (recurrence === 'none') {
    recurrenceEnd = undefined;
  } else {
    const rawEnd = task.recurrenceEnd;
    const fallback = rawEnd ?? maxRecurrenceEndISO(task.date);
    recurrenceEnd = clampRecurrenceEndToBounds(task.date, fallback);
  }

  let notificationsPausedUntil: string | null = null;
  if (fromVersion >= 4) {
    const u = task.notificationsPausedUntil;
    if (typeof u === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(u)) {
      notificationsPausedUntil = u;
    }
  }

  let customWeekdays: number[] = [];
  if (recurrence === 'custom') {
    if (fromVersion >= 4) {
      customWeekdays = normalizeCustomWeekdays(task.customWeekdays);
      if (customWeekdays.length === 0) {
        customWeekdays = deriveCustomWeekdaysFromLegacyDates(
          legacyDates,
          task.date,
          recurrenceEnd
        );
      }
    } else {
      customWeekdays = deriveCustomWeekdaysFromLegacyDates(
        legacyDates,
        task.date,
        recurrenceEnd
      );
    }
  }

  const tagId = isTaskTagId(task.tagId) ? task.tagId : null;

  return {
    id: task.id,
    title: task.title,
    description: task.description,
    tagId,
    date: task.date,
    time: task.time,
    allDay: task.allDay,
    recurrence,
    recurrenceEnd,
    completedOccurrenceDates,
    notificationsPaused,
    notificationsPausedUntil,
    customWeekdays,
    reminderLeadMinutes: task.reminderLeadMinutes ?? null,
    alertMode: task.alertMode ?? 'normal',
    done: task.done,
    color: task.color,
    notificationIds: Array.isArray(task.notificationIds) ? task.notificationIds : [],
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
  };
}

export function migrateBlob(raw: unknown): PersistedBlob {
  if (!raw || typeof raw !== 'object') {
    return {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      tasks: [],
      settings: { ...DEFAULT_SETTINGS },
      notes: [],
      notebooks: [],
      quickReminders: [],
    };
  }
  const blob = raw as Partial<PersistedBlob> & {
    schemaVersion?: number;
    tasks?: unknown;
    settings?: unknown;
    notes?: unknown;
    notebooks?: unknown;
    quickReminders?: unknown;
  };
  const version = typeof blob.schemaVersion === 'number' ? blob.schemaVersion : 1;
  const rawTasks = Array.isArray(blob.tasks) ? (blob.tasks as LegacyTask[]) : [];
  const tasks = rawTasks.map((t) => normalizeTask(t, version));

  const settings: PersistedBlob['settings'] = {
    ...DEFAULT_SETTINGS,
    ...((blob.settings as Partial<PersistedBlob['settings']>) ?? {}),
  };

  const notes = Array.isArray(blob.notes)
    ? (blob.notes as unknown[])
        .filter(isNote)
        .map((n) => ({
          ...n,
          notebookId: n.notebookId ?? null,
        }))
    : [];
  const notebooks = Array.isArray(blob.notebooks)
    ? (blob.notebooks as unknown[]).filter(isNotebook)
    : [];
  const quickReminders = Array.isArray(blob.quickReminders)
    ? filterValidQuickReminders(blob.quickReminders)
    : [];

  return {
    schemaVersion: Math.max(version, CURRENT_SCHEMA_VERSION),
    tasks,
    settings,
    notes,
    notebooks,
    quickReminders,
  };
}
