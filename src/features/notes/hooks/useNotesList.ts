import { useCallback, useState } from 'react';
import { loadNotesStore, type Note, type Notebook } from '../../../lib/notes';

export function useNotesList() {
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [allNotes, setAllNotes] = useState<Note[]>([]);
  const [rootNotes, setRootNotes] = useState<Note[]>([]);

  const reload = useCallback(async () => {
    const store = await loadNotesStore();
    setNotebooks(store.notebooks);
    setAllNotes(store.notes);
    setRootNotes(store.notes.filter((n) => n.notebookId === null));
  }, []);

  return { notebooks, allNotes, rootNotes, reload };
}
