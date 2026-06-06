import { Alert } from 'react-native';
import type { Router } from 'expo-router';
import type { Note, Notebook } from '../../../lib/notes';
import { alertError, t } from '../../../lib/i18n';

export function confirmDeleteNote(onConfirm: () => void): void {
  Alert.alert(t.notesDelete, t.notesDeleteConfirm, [
    { text: t.cancel, style: 'cancel' },
    { text: t.delete, style: 'destructive', onPress: onConfirm },
  ]);
}

export function confirmDeleteMany(count: number, onConfirm: () => void): void {
  if (count === 0) return;
  Alert.alert(
    t.notesDeleteManyTitle,
    t.notesDeleteManyMessage.replace('{n}', String(count)),
    [
      { text: t.cancel, style: 'cancel' },
      { text: t.notesDeleteSelected, style: 'destructive', onPress: onConfirm },
    ]
  );
}

export function showNoteRowOverflowMenu(onMove: () => void): void {
  Alert.alert(t.notesMoveTo, undefined, [
    { text: t.notesMove, onPress: onMove },
    { text: t.cancel, style: 'cancel' },
  ]);
}

export function showNotebookOverflowMenu(router: Router, notebook: Notebook): void {
  Alert.alert(notebook.title.trim() || t.notebookTitlePlaceholder, undefined, [
    {
      text: t.editNotebook,
      onPress: () =>
        router.push({ pathname: '/notebook/new', params: { id: notebook.id } }),
    },
    {
      text: t.notebookDelete,
      style: 'destructive',
      onPress: () =>
        router.push({ pathname: '/notebook/delete', params: { id: notebook.id } }),
    },
    { text: t.cancel, style: 'cancel' },
  ]);
}

export function alertMoveDone(): void {
  Alert.alert(t.notesMoveDone);
}

export { alertError };

type DeleteNotebookAllParams = {
  notebookId: string | undefined;
  notes: Note[];
  selected: Set<string>;
  finishDelete: (deleteNoteIds: string[]) => Promise<void>;
};

type DeleteNotebookMoveParams = {
  moveIds: string[];
  deleteIds: string[];
  setBusy: (v: boolean) => void;
  moveNotes: (ids: string[], target: null) => Promise<void>;
  finishDelete: (deleteNoteIds: string[]) => Promise<void>;
  onError: (error: unknown) => void;
};

export function confirmDeleteNotebookAll({
  notebookId,
  notes,
  selected,
  finishDelete,
}: DeleteNotebookAllParams): void {
  if (!notebookId) return;
  const deleteIds = [...selected];
  if (notes.length === 0) {
    Alert.alert(t.notebookDeleteTitle, t.notebookDeleteEmptyConfirm, [
      { text: t.cancel, style: 'cancel' },
      { text: t.delete, style: 'destructive', onPress: () => void finishDelete([]) },
    ]);
    return;
  }
  if (deleteIds.length === 0) {
    Alert.alert(t.notebookDeleteTitle, t.notebookEmpty);
    return;
  }
  Alert.alert(
    t.notebookDeleteTitle,
    t.notebookDeleteConfirmNotes.replace('{n}', String(deleteIds.length)),
    [
      { text: t.cancel, style: 'cancel' },
      {
        text: t.delete,
        style: 'destructive',
        onPress: () => void finishDelete(deleteIds),
      },
    ]
  );
}

export function confirmDeleteNotebookMoveToMain({
  moveIds,
  deleteIds,
  setBusy,
  moveNotes,
  finishDelete,
  onError,
}: DeleteNotebookMoveParams): void {
  if (moveIds.length === 0) {
    Alert.alert(t.notebookDeleteTitle, t.notebookEmpty);
    return;
  }
  Alert.alert(t.notebookDeleteTitle, t.notebookMoveThenDelete, [
    { text: t.cancel, style: 'cancel' },
    {
      text: t.notebookMoveSelectedToMain,
      onPress: () => {
        setBusy(true);
        void moveNotes(moveIds, null)
          .then(() => finishDelete(deleteIds))
          .catch((e) => {
            setBusy(false);
            onError(e);
          });
      },
    },
  ]);
}
