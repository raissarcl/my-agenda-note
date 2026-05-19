import { Alert } from 'react-native';
import type { Notebook } from '../../../lib/notes';
import { t } from '../../../lib/i18n';

export function showNoteMovePicker(
  notebooks: Notebook[],
  currentNotebookId: string | null,
  onPick: (targetNotebookId: string | null) => void
): void {
  const options: Array<{
    text: string;
    onPress?: () => void;
    style?: 'cancel' | 'destructive' | 'default';
  }> = [];

  if (currentNotebookId !== null) {
    options.push({
      text: t.notesMoveToMain,
      onPress: () => onPick(null),
    });
  }

  for (const nb of notebooks) {
    if (nb.id === currentNotebookId) continue;
    options.push({
      text: nb.title.trim() || t.notebookTitlePlaceholder,
      onPress: () => onPick(nb.id),
    });
  }

  if (options.length === 0) {
    Alert.alert(t.notesMovePickerTitle, t.notebookEmpty);
    return;
  }

  options.push({ text: t.cancel, style: 'cancel' });
  Alert.alert(t.notesMovePickerTitle, undefined, options);
}
