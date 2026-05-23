import { Alert } from 'react-native';
import type { Notebook } from '../../../lib/notes';
import { t } from '../../../lib/i18n';

type OpenMovePicker = (
  notebooks: Notebook[],
  currentNotebookId: string | null,
  onPick: (targetNotebookId: string | null) => void
) => void;

let opener: OpenMovePicker | null = null;

export function registerNoteMovePickerOpener(next: OpenMovePicker | null): void {
  opener = next;
}

export function showNoteMovePicker(
  notebooks: Notebook[],
  currentNotebookId: string | null,
  onPick: (targetNotebookId: string | null) => void
): void {
  if (opener) {
    opener(notebooks, currentNotebookId, onPick);
    return;
  }

  const destinations =
    (currentNotebookId !== null ? 1 : 0) +
    notebooks.filter((nb) => nb.id !== currentNotebookId).length;
  if (destinations === 0) {
    Alert.alert(t.notesMovePickerTitle, t.notebookEmpty);
    return;
  }
  Alert.alert(
    t.notesMovePickerTitle,
    'O seletor de destino não está disponível. Reinicie o app.'
  );
}
