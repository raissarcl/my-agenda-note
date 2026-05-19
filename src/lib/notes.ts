import AsyncStorage from '@react-native-async-storage/async-storage';

export type Notebook = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
};

export type Note = {
  id: string;
  notebookId: string | null;
  title: string;
  bodyHtml: string;
  createdAt: string;
  updatedAt: string;
};

export type NotesStore = {
  notebooks: Notebook[];
  notes: Note[];
};

export const NOTES_STORAGE_KEY_V1 = 'my-calendar-note:notes:v1';
export const NOTES_STORAGE_KEY = 'my-calendar-note:notes:v2';

export const NOTE_BODY_PLAIN_MAX = 2_500;

export function plainTextFromHtml(html: string): string {
  if (!html || typeof html !== 'string') return '';
  const noTags = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]+>/g, ' ');
  return noTags.replace(/\s+/g, ' ').trim();
}

export function previewLineFromNote(note: Note, maxLen = 80): string {
  const t = note.title.trim();
  if (t) return t.length > maxLen ? `${t.slice(0, maxLen)}…` : t;
  const plain = plainTextFromHtml(note.bodyHtml);
  if (!plain) return '';
  return plain.length > maxLen ? `${plain.slice(0, maxLen)}…` : plain;
}

function normalizeNotebookId(raw: unknown): string | null {
  if (raw === null || raw === undefined || raw === '') return null;
  if (typeof raw === 'string') return raw;
  return null;
}

export function isNote(x: unknown): x is Note {
  if (!x || typeof x !== 'object') return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.id === 'string' &&
    typeof o.title === 'string' &&
    typeof o.bodyHtml === 'string' &&
    typeof o.createdAt === 'string' &&
    typeof o.updatedAt === 'string' &&
    (o.notebookId === undefined ||
      o.notebookId === null ||
      typeof o.notebookId === 'string')
  );
}

export function isNotebook(x: unknown): x is Notebook {
  if (!x || typeof x !== 'object') return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.id === 'string' &&
    typeof o.title === 'string' &&
    typeof o.createdAt === 'string' &&
    typeof o.updatedAt === 'string'
  );
}

function normalizeNote(raw: Record<string, unknown>): Note {
  return {
    id: raw.id as string,
    notebookId: normalizeNotebookId(raw.notebookId),
    title: raw.title as string,
    bodyHtml: raw.bodyHtml as string,
    createdAt: raw.createdAt as string,
    updatedAt: raw.updatedAt as string,
  };
}

async function loadV1Notes(): Promise<Note[]> {
  try {
    const raw = await AsyncStorage.getItem(NOTES_STORAGE_KEY_V1);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isNote).map((n) => ({
      ...n,
      notebookId: n.notebookId ?? null,
    }));
  } catch {
    return [];
  }
}

function sortNotes(notes: Note[]): Note[] {
  return [...notes].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
}

function sortNotebooks(notebooks: Notebook[]): Notebook[] {
  return [...notebooks].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
}

export async function loadNotesStore(): Promise<NotesStore> {
  try {
    const raw = await AsyncStorage.getItem(NOTES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as unknown;
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        const o = parsed as Record<string, unknown>;
        const notebooks = Array.isArray(o.notebooks)
          ? (o.notebooks as unknown[]).filter(isNotebook)
          : [];
        const notes = Array.isArray(o.notes)
          ? (o.notes as unknown[])
              .filter(isNote)
              .map((n) => normalizeNote(n as Record<string, unknown>))
          : [];
        return { notebooks: sortNotebooks(notebooks), notes: sortNotes(notes) };
      }
    }
  } catch {}

  const migrated = await loadV1Notes();
  const store: NotesStore = { notebooks: [], notes: migrated };
  await saveNotesStore(store);
  return store;
}

export async function saveNotesStore(store: NotesStore): Promise<void> {
  await AsyncStorage.setItem(
    NOTES_STORAGE_KEY,
    JSON.stringify({
      notebooks: store.notebooks,
      notes: store.notes,
    })
  );
}

export async function loadNotes(): Promise<Note[]> {
  const { notes } = await loadNotesStore();
  return notes;
}

export async function loadNotebooks(): Promise<Notebook[]> {
  const { notebooks } = await loadNotesStore();
  return notebooks;
}

export async function loadNotesByNotebook(notebookId: string): Promise<Note[]> {
  const { notes } = await loadNotesStore();
  return sortNotes(notes.filter((n) => n.notebookId === notebookId));
}

export async function loadRootNotes(): Promise<Note[]> {
  const { notes } = await loadNotesStore();
  return sortNotes(notes.filter((n) => n.notebookId === null));
}

export async function getNotebook(id: string): Promise<Notebook | null> {
  const { notebooks } = await loadNotesStore();
  return notebooks.find((n) => n.id === id) ?? null;
}

export async function persistNote(note: Note): Promise<void> {
  const store = await loadNotesStore();
  const idx = store.notes.findIndex((n) => n.id === note.id);
  const normalized = { ...note, notebookId: note.notebookId ?? null };
  if (idx >= 0) store.notes[idx] = normalized;
  else store.notes.unshift(normalized);
  store.notes = sortNotes(store.notes);
  await saveNotesStore(store);
}

export async function persistNotebook(notebook: Notebook): Promise<void> {
  const store = await loadNotesStore();
  const idx = store.notebooks.findIndex((n) => n.id === notebook.id);
  if (idx >= 0) store.notebooks[idx] = notebook;
  else store.notebooks.unshift(notebook);
  store.notebooks = sortNotebooks(store.notebooks);
  await saveNotesStore(store);
}

export async function removeNote(id: string): Promise<void> {
  const store = await loadNotesStore();
  store.notes = store.notes.filter((n) => n.id !== id);
  await saveNotesStore(store);
}

export async function removeNotes(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  const drop = new Set(ids);
  const store = await loadNotesStore();
  store.notes = store.notes.filter((n) => !drop.has(n.id));
  await saveNotesStore(store);
}

export async function moveNotes(
  noteIds: string[],
  targetNotebookId: string | null
): Promise<void> {
  if (noteIds.length === 0) return;
  const idSet = new Set(noteIds);
  const store = await loadNotesStore();
  const now = new Date().toISOString();
  store.notes = store.notes.map((n) =>
    idSet.has(n.id) ? { ...n, notebookId: targetNotebookId, updatedAt: now } : n
  );
  store.notes = sortNotes(store.notes);
  await saveNotesStore(store);
}

export async function removeNotebook(id: string): Promise<void> {
  const store = await loadNotesStore();
  store.notebooks = store.notebooks.filter((n) => n.id !== id);
  await saveNotesStore(store);
}

export async function deleteNotebook(
  notebookId: string,
  options: { deleteNoteIds: string[] }
): Promise<void> {
  const store = await loadNotesStore();
  const drop = new Set(options.deleteNoteIds);
  const now = new Date().toISOString();
  store.notes = store.notes
    .filter((n) => !(n.notebookId === notebookId && drop.has(n.id)))
    .map((n) =>
      n.notebookId === notebookId ? { ...n, notebookId: null, updatedAt: now } : n
    );
  store.notebooks = store.notebooks.filter((n) => n.id !== notebookId);
  store.notes = sortNotes(store.notes);
  await saveNotesStore(store);
}

export function noteCountForNotebook(notebookId: string, notes: Note[]): number {
  return notes.filter((n) => n.notebookId === notebookId).length;
}
