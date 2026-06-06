import type { Note, Notebook } from './lib/notes';
import type { QuickReminder } from './lib/quickReminders';

export type Recurrence =
  | 'none'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'weekdays'
  | 'custom';

export type AlertMode = 'normal' | 'strong';

export type TaskTagId = 'work' | 'personal' | 'health' | 'study' | 'finance' | 'home';

export type Task = {
  id: string;
  title: string;
  description?: string;
  tagId: TaskTagId | null;
  date: string;
  time: string;
  allDay: boolean;
  recurrence: Recurrence;
  recurrenceEnd?: string;
  completedOccurrenceDates: string[];
  notificationsPaused: boolean;
  notificationsPausedUntil: string | null;
  customWeekdays: number[];
  reminderLeadMinutes: number | null;
  alertMode: AlertMode;
  done: boolean;
  color: string;
  notificationIds: string[];
  createdAt: string;
  updatedAt: string;
};

export type TaskOccurrence = Task & {
  occurrenceDate: string;
  isOccurrence: boolean;
};

export type ThemeMode = 'system' | 'light' | 'dark';

export type Settings = {
  theme: ThemeMode;
  defaultReminderLeadMinutes: number | null;
  locale: 'pt-BR' | 'en-US';
  hideCompletedOccurrences: boolean;
  lastExportAt: string | null;
  backupReminderEnabled: boolean;
  backupReminderIntervalDays: number;
};

export type PersistedBlob = {
  schemaVersion: number;
  tasks: Task[];
  settings: Settings;
  notes?: Note[];
  notebooks?: Notebook[];
  quickReminders?: QuickReminder[];
};

export const CURRENT_SCHEMA_VERSION = 6;

export const BACKUP_REMINDER_INTERVAL_OPTIONS = [7, 14, 30] as const;

export const DEFAULT_SETTINGS: Settings = {
  theme: 'system',
  defaultReminderLeadMinutes: 10,
  locale: 'pt-BR',
  hideCompletedOccurrences: false,
  lastExportAt: null,
  backupReminderEnabled: false,
  backupReminderIntervalDays: 7,
};

export const NOTIFICATION_LEAD_VALUES: Array<number | null> = [
  null,
  0,
  5,
  10,
  30,
  60,
  1440,
];

export const RECURRENCE_VALUES: readonly Recurrence[] = [
  'none',
  'daily',
  'weekdays',
  'weekly',
  'monthly',
  'custom',
] as const;

export const ALERT_MODE_OPTIONS: Array<{ value: AlertMode }> = [
  { value: 'normal' },
  { value: 'strong' },
];
