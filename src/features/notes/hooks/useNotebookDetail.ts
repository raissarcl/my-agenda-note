import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import {
  getNotebook,
  loadNotebooks,
  loadNotesByNotebook,
  type Note,
  type Notebook,
} from '../../../lib/notes';

export function useNotebookDetail(notebookId: string | undefined) {
  const router = useRouter();
  const [notebook, setNotebook] = useState<Notebook | null | undefined>(undefined);
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [items, setItems] = useState<Note[]>([]);

  const reload = useCallback(async () => {
    if (!notebookId) return;
    const [nb, notes, allNb] = await Promise.all([
      getNotebook(notebookId),
      loadNotesByNotebook(notebookId),
      loadNotebooks(),
    ]);
    setNotebook(nb);
    setItems(notes);
    setNotebooks(allNb);
  }, [notebookId]);

  useEffect(() => {
    if (notebook === null) router.back();
  }, [notebook, router]);

  return { notebook, notebooks, items, reload, setNotebook };
}
