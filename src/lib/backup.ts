import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { format } from 'date-fns';
import {
  CURRENT_SCHEMA_VERSION,
  type PersistedBlob,
  type Task,
} from '../types';
import { migrateBlob } from '../store/migrate';
import { useSettingsStore } from '../store/settings';
import { useTasksStore, replaceAllTasks } from '../store/tasks';
import {
  loadNotesStore,
  saveNotesStore,
  type Note,
  type Notebook,
} from './notes';
import { loadQuickReminders, saveAllQuickReminders } from './quickReminders';
import { syncBackupReminderFromSettings } from './notifications';

export async function buildExportBlob(): Promise<PersistedBlob> {
  const tasks = useTasksStore.getState().tasks;
  const settings = useSettingsStore.getState().settings;
  const [store, quickReminders] = await Promise.all([
    loadNotesStore(),
    loadQuickReminders(),
  ]);
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    tasks,
    settings,
    notes: store.notes,
    notebooks: store.notebooks,
    quickReminders,
  };
}

export async function exportBackup(): Promise<{ shared: boolean }> {
  const blob = await buildExportBlob();
  const filename = `agenda-backup-${format(new Date(), 'yyyy-MM-dd-HHmm')}.json`;
  const uri = `${FileSystem.documentDirectory ?? ''}${filename}`;
  await FileSystem.writeAsStringAsync(uri, JSON.stringify(blob, null, 2), {
    encoding: FileSystem.EncodingType.UTF8,
  });

  const available = await Sharing.isAvailableAsync();
  if (available) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/json',
      dialogTitle: 'Exportar backup',
      UTI: 'public.json',
    });
  }

  try {
    await FileSystem.deleteAsync(uri, { idempotent: true });
  } catch {}

  await useSettingsStore.getState().update({
    lastExportAt: new Date().toISOString(),
  });
  await syncBackupReminderFromSettings();

  return { shared: available };
}

export type ImportResult =
  | {
      ok: true;
      tasksAdded: number;
      notesAdded: number;
      quickAdded: number;
    }
  | { ok: false; reason: 'cancelled' | 'invalid' | 'unsupportedVersion' };

function isValidTask(t: unknown): t is Task {
  if (!t || typeof t !== 'object') return false;
  const x = t as Record<string, unknown>;
  return (
    typeof x.id === 'string' &&
    typeof x.title === 'string' &&
    typeof x.date === 'string'
  );
}

function mergeById<T extends { id: string }>(
  local: T[],
  incoming: T[]
): { merged: T[]; added: number } {
  const ids = new Set(local.map((x) => x.id));
  let added = 0;
  const merged = [...local];
  for (const item of incoming) {
    if (!ids.has(item.id)) {
      merged.push(item);
      ids.add(item.id);
      added++;
    }
  }
  return { merged, added };
}

function normalizeImportedNotes(notes: Note[]): Note[] {
  return notes.map((n) => ({ ...n, notebookId: n.notebookId ?? null }));
}

export async function importBackup(
  mode: 'merge' | 'replace'
): Promise<ImportResult> {
  const res = await DocumentPicker.getDocumentAsync({
    type: ['application/json', 'text/plain', '*/*'],
    copyToCacheDirectory: true,
    multiple: false,
  });
  if (res.canceled) return { ok: false, reason: 'cancelled' };
  const file = res.assets?.[0];
  if (!file?.uri) return { ok: false, reason: 'invalid' };

  let raw: string;
  try {
    raw = await FileSystem.readAsStringAsync(file.uri, {
      encoding: FileSystem.EncodingType.UTF8,
    });
  } catch {
    return { ok: false, reason: 'invalid' };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, reason: 'invalid' };
  }

  const blob = migrateBlob(parsed);
  if (blob.schemaVersion > CURRENT_SCHEMA_VERSION) {
    return { ok: false, reason: 'unsupportedVersion' };
  }
  const incomingTasks = blob.tasks.filter(isValidTask);
  const incomingNotes = normalizeImportedNotes(blob.notes ?? []);
  const incomingNotebooks = blob.notebooks ?? [];
  const incomingQuick = blob.quickReminders ?? [];

  if (mode === 'replace') {
    await useSettingsStore.getState().update(blob.settings);
    await replaceAllTasks(incomingTasks);
    await saveNotesStore({
      notebooks: incomingNotebooks,
      notes: incomingNotes,
    });
    await saveAllQuickReminders(incomingQuick);
    await useTasksStore.getState().rescheduleAll();
    return {
      ok: true,
      tasksAdded: incomingTasks.length,
      notesAdded: incomingNotes.length,
      quickAdded: incomingQuick.length,
    };
  }

  const existing = useTasksStore.getState().tasks;
  const existingIds = new Set(existing.map((t) => t.id));
  const additions = incomingTasks.filter((t) => !existingIds.has(t.id));
  const mergedTasks = [...existing, ...additions];
  await replaceAllTasks(mergedTasks);
  for (const t of additions) {
    await useTasksStore.getState().update(t.id, {});
  }

  const localStore = await loadNotesStore();
  const { merged: mergedNotebooks } = mergeById<Notebook>(
    localStore.notebooks,
    incomingNotebooks
  );
  const { merged: mergedNotes, added: notesAdded } = mergeById<Note>(
    localStore.notes,
    incomingNotes
  );
  await saveNotesStore({
    notebooks: mergedNotebooks,
    notes: normalizeImportedNotes(mergedNotes),
  });

  const localQuick = await loadQuickReminders();
  const { merged: mergedQuick, added: quickAdded } = mergeById(
    localQuick,
    incomingQuick
  );
  await saveAllQuickReminders(mergedQuick);

  return {
    ok: true,
    tasksAdded: additions.length,
    notesAdded,
    quickAdded,
  };
}
