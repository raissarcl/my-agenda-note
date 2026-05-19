import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Task } from '../types';
import { useTasksStore } from '../store/tasks';

const INSTALL_YEAR_KEY = 'my-calendar-note:install-year';

export async function ensureInstallYear(): Promise<number> {
  const raw = await AsyncStorage.getItem(INSTALL_YEAR_KEY);
  if (raw != null) {
    const y = parseInt(raw, 10);
    if (!Number.isNaN(y)) return y;
  }
  const y = new Date().getFullYear();
  await AsyncStorage.setItem(INSTALL_YEAR_KEY, String(y));
  return y;
}

function yearFromISOField(s: string | undefined): number | null {
  if (!s || typeof s !== 'string' || s.length < 4) return null;
  const y = parseInt(s.slice(0, 4), 10);
  if (Number.isNaN(y) || y < 1970 || y > 2120) return null;
  return y;
}

function yearSpanFromTasks(tasks: Task[]): { minY: number; maxY: number } | null {
  if (tasks.length === 0) return null;
  let minY = 99999;
  let maxY = 0;
  let any = false;
  for (const t of tasks) {
    for (const field of [
      t.date,
      t.recurrenceEnd,
      t.createdAt,
      t.updatedAt,
    ] as const) {
      const y = yearFromISOField(field);
      if (y === null) continue;
      any = true;
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }
  }
  if (!any) return null;
  return { minY, maxY };
}

export async function getCalendarYearRange(): Promise<{
  minYear: number;
  maxYear: number;
}> {
  const install = await ensureInstallYear();
  const nowY = new Date().getFullYear();
  const span = yearSpanFromTasks(useTasksStore.getState().tasks);
  const defaultMax = Math.max(install + 3, nowY + 3);

  const minCandidates = [install, nowY];
  const maxCandidates = [defaultMax];
  if (span) {
    minCandidates.push(span.minY);
    maxCandidates.push(span.maxY);
  }

  return {
    minYear: Math.min(...minCandidates),
    maxYear: Math.max(...maxCandidates),
  };
}
