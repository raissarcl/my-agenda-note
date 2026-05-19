import AsyncStorage from '@react-native-async-storage/async-storage';

export type QuickReminder = {
  id: string;
  text: string;
  done: boolean;
  createdAt: string;
};

export const QUICK_REMINDERS_STORAGE_KEY =
  'my-calendar-note:list-quick-reminders:v1';

function coerceDone(raw: unknown): boolean | null {
  if (typeof raw === 'boolean') return raw;
  if (raw === 1 || raw === '1' || raw === 'true') return true;
  if (raw === 0 || raw === '0' || raw === 'false') return false;
  return null;
}

export function sanitizeQuickReminderList(raw: unknown[]): QuickReminder[] {
  const out: QuickReminder[] = [];
  for (const x of raw) {
    if (!x || typeof x !== 'object') continue;
    const o = x as Record<string, unknown>;
    const done = coerceDone(o.done);
    if (
      typeof o.id !== 'string' ||
      typeof o.text !== 'string' ||
      done === null ||
      typeof o.createdAt !== 'string'
    ) {
      continue;
    }
    out.push({
      id: o.id,
      text: o.text,
      done,
      createdAt: o.createdAt,
    });
  }
  return out;
}

export function filterValidQuickReminders(raw: unknown): QuickReminder[] {
  if (!Array.isArray(raw)) return [];
  return sanitizeQuickReminderList(raw);
}

export async function loadQuickReminders(): Promise<QuickReminder[]> {
  try {
    const raw = await AsyncStorage.getItem(QUICK_REMINDERS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return filterValidQuickReminders(parsed);
  } catch {
    return [];
  }
}

export async function saveAllQuickReminders(
  items: QuickReminder[]
): Promise<void> {
  await AsyncStorage.setItem(
    QUICK_REMINDERS_STORAGE_KEY,
    JSON.stringify(items)
  );
}
