import { create } from 'zustand';
import type { Task } from '../types';
import { buildBlob, loadBlob, saveBlob } from './persistence';
import { useSettingsStore } from './settings';
import { colorForId } from '../lib/colors';
import { combineDateTime, formatDateISOLocal, parseISODate } from '../lib/format';
import {
  cancelTaskNotifications,
  scheduleTaskNotifications,
  stripExpiredNotificationPauses,
} from '../lib/notifications';
import { applyAutoCompletedOccurrences } from '../lib/taskCompletion';
import { syncAndroidWidgets } from '../lib/homeScreenWidget';

type TasksState = {
  tasks: Task[];
  hydrated: boolean;
  hydrate: () => Promise<void>;
  upsert: (task: Task) => Promise<void>;
  create: (
    input: Omit<Task, 'id' | 'color' | 'notificationIds' | 'createdAt' | 'updatedAt'>
  ) => Promise<Task>;
  update: (id: string, patch: Partial<Omit<Task, 'id'>>) => Promise<void>;
  remove: (id: string) => Promise<void>;
  toggleOccurrenceDone: (taskId: string, occurrenceDateISO: string) => Promise<void>;
  deletePastOneOffInMonth: (year: number, monthIndex: number) => Promise<number>;
  deletePastRecurringEndedInMonth: (
    year: number,
    monthIndex: number
  ) => Promise<number>;
  rescheduleAll: () => Promise<void>;
};

async function persist(tasks: Task[]) {
  const settings = useSettingsStore.getState().settings;
  await saveBlob(buildBlob(tasks, settings));
}

function generateTaskId(): string {
  return `task_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function isOneOffTaskPast(task: Task, now: Date): boolean {
  if (task.allDay) {
    return task.date < formatDateISOLocal(now);
  }
  return combineDateTime(task.date, task.time).getTime() < now.getTime();
}

let rescheduleAllInFlight: Promise<void> | null = null;

function withTaskDefaults(
  partial: Omit<Task, 'id' | 'color' | 'notificationIds' | 'createdAt' | 'updatedAt'> &
    Partial<
      Pick<
        Task,
        | 'completedOccurrenceDates'
        | 'notificationsPaused'
        | 'notificationsPausedUntil'
        | 'customWeekdays'
        | 'tagId'
      >
    >
): Omit<Task, 'id' | 'color' | 'notificationIds' | 'createdAt' | 'updatedAt'> {
  const customWeekdaysRaw = partial.customWeekdays ?? [];
  const customWeekdays =
    partial.recurrence === 'custom'
      ? [...new Set(customWeekdaysRaw.filter((n) => n >= 0 && n <= 6))].sort((a, b) => a - b)
      : [];
  return {
    ...partial,
    completedOccurrenceDates: partial.completedOccurrenceDates ?? [],
    notificationsPaused: partial.notificationsPaused ?? false,
    notificationsPausedUntil: partial.notificationsPausedUntil ?? null,
    customWeekdays,
    tagId: partial.tagId ?? null,
  };
}

export const useTasksStore = create<TasksState>((set, get) => ({
  tasks: [],
  hydrated: false,
  hydrate: async () => {
    const blob = await loadBlob();
    const today = formatDateISOLocal(new Date());
    const stripped = stripExpiredNotificationPauses(blob.tasks, today);
    const withAuto = applyAutoCompletedOccurrences(stripped, new Date());
    set({ tasks: withAuto, hydrated: true });
    await persist(withAuto);
    await syncAndroidWidgets(withAuto);
  },
  upsert: async (task) => {
    const existing = get().tasks.find((t) => t.id === task.id);
    if (existing) {
      await cancelTaskNotifications(existing);
    }
    const ids = await scheduleTaskNotifications(task);
    const next: Task = {
      ...task,
      notificationIds: ids,
      updatedAt: new Date().toISOString(),
    };
    const tasks = existing
      ? get().tasks.map((t) => (t.id === next.id ? next : t))
      : [...get().tasks, next];
    set({ tasks });
    await persist(tasks);
    await syncAndroidWidgets(tasks);
  },
  create: async (input) => {
    const id = generateTaskId();
    const now = new Date().toISOString();
    const normalized = withTaskDefaults(input);
    const task: Task = {
      id,
      color: colorForId(id, false),
      notificationIds: [],
      createdAt: now,
      updatedAt: now,
      ...normalized,
    };
    const ids = await scheduleTaskNotifications(task);
    const finalTask: Task = { ...task, notificationIds: ids };
    const tasks = [...get().tasks, finalTask];
    set({ tasks });
    await persist(tasks);
    await syncAndroidWidgets(tasks);
    return finalTask;
  },
  update: async (id, patch) => {
    const existing = get().tasks.find((t) => t.id === id);
    if (!existing) return;
    await cancelTaskNotifications(existing);
    const mergedPatch = { ...patch };
    if (patch.recurrence !== undefined && patch.recurrence !== 'custom') {
      mergedPatch.customWeekdays = [];
    }
    if (
      patch.date !== undefined &&
      patch.date > existing.date &&
      existing.recurrence !== 'none'
    ) {
      const kept = existing.completedOccurrenceDates.filter((d) => d >= patch.date!);
      mergedPatch.completedOccurrenceDates = kept;
    }
    const next: Task = {
      ...existing,
      ...mergedPatch,
      id: existing.id,
      updatedAt: new Date().toISOString(),
    };
    const ids = await scheduleTaskNotifications(next);
    next.notificationIds = ids;
    const tasks = get().tasks.map((t) => (t.id === id ? next : t));
    set({ tasks });
    await persist(tasks);
    await syncAndroidWidgets(tasks);
  },
  remove: async (id) => {
    const existing = get().tasks.find((t) => t.id === id);
    if (existing) await cancelTaskNotifications(existing);
    const tasks = get().tasks.filter((t) => t.id !== id);
    set({ tasks });
    await persist(tasks);
    await syncAndroidWidgets(tasks);
  },
  toggleOccurrenceDone: async (taskId, occurrenceDateISO) => {
    const existing = get().tasks.find((t) => t.id === taskId);
    if (!existing) return;
    const setDates = new Set(existing.completedOccurrenceDates);
    if (setDates.has(occurrenceDateISO)) setDates.delete(occurrenceDateISO);
    else setDates.add(occurrenceDateISO);
    const sorted = [...setDates].sort();
    let done = existing.done;
    if (existing.recurrence === 'none') {
      done = sorted.includes(existing.date);
    }
    await get().update(taskId, { completedOccurrenceDates: sorted, done });
  },
  deletePastOneOffInMonth: async (year, monthIndex) => {
    const now = new Date();
    const monthStart = new Date(year, monthIndex, 1);
    const monthEnd = new Date(year, monthIndex + 1, 0);
    const toDelete = get().tasks.filter((task) => {
      if (task.recurrence !== 'none') return false;
      const d = parseISODate(task.date);
      const inMonth = d >= monthStart && d <= monthEnd;
      return inMonth && isOneOffTaskPast(task, now);
    });
    if (toDelete.length === 0) return 0;
    for (const task of toDelete) {
      await cancelTaskNotifications(task);
    }
    const deleteIds = new Set(toDelete.map((t) => t.id));
    const remaining = get().tasks.filter((t) => !deleteIds.has(t.id));
    set({ tasks: remaining });
    await persist(remaining);
    await syncAndroidWidgets(remaining);
    return toDelete.length;
  },
  deletePastRecurringEndedInMonth: async (year, monthIndex) => {
    const monthStart = new Date(year, monthIndex, 1);
    const monthEnd = new Date(year, monthIndex + 1, 0);
    const cutoffISO = formatDateISOLocal(new Date());
    const toDelete = get().tasks.filter((task) => {
      if (task.recurrence === 'none' || !task.recurrenceEnd) return false;
      const d = parseISODate(task.date);
      const inMonth = d >= monthStart && d <= monthEnd;
      return inMonth && task.recurrenceEnd < cutoffISO;
    });
    if (toDelete.length === 0) return 0;
    for (const task of toDelete) {
      await cancelTaskNotifications(task);
    }
    const deleteIds = new Set(toDelete.map((t) => t.id));
    const remaining = get().tasks.filter((t) => !deleteIds.has(t.id));
    set({ tasks: remaining });
    await persist(remaining);
    await syncAndroidWidgets(remaining);
    return toDelete.length;
  },
  rescheduleAll: async () => {
    if (rescheduleAllInFlight) return rescheduleAllInFlight;
    rescheduleAllInFlight = (async () => {
      try {
        const today = formatDateISOLocal(new Date());
        const stripped = stripExpiredNotificationPauses(get().tasks, today);
        if (stripped !== get().tasks) {
          set({ tasks: stripped });
          await persist(stripped);
        }
        const auto = applyAutoCompletedOccurrences(get().tasks, new Date());
        set({ tasks: auto });
        await persist(auto);
        const updated: Task[] = [];
        for (const t of auto) {
          await cancelTaskNotifications(t);
          const ids = await scheduleTaskNotifications(t);
          updated.push({ ...t, notificationIds: ids });
        }
        set({ tasks: updated });
        await persist(updated);
        await syncAndroidWidgets(updated);
      } finally {
        rescheduleAllInFlight = null;
      }
    })();
    return rescheduleAllInFlight;
  },
}));

export function replaceAllTasks(tasks: Task[]): Promise<void> {
  const auto = applyAutoCompletedOccurrences(tasks, new Date());
  useTasksStore.setState({ tasks: auto });
  return persist(auto).then(() => syncAndroidWidgets(auto));
}
