import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { Alert } from 'react-native';

import { t } from '../../../lib/i18n';
import type { Notebook } from '../../../lib/notes';
import { registerNoteMovePickerOpener } from '../actions/noteMovePicker';
import { NoteMovePickerModal } from './NoteMovePickerModal';

type OpenMovePicker = (
  notebooks: Notebook[],
  currentNotebookId: string | null,
  onPick: (targetNotebookId: string | null) => void
) => void;

const NoteMovePickerContext = createContext<OpenMovePicker | null>(null);

type Pending = {
  notebooks: Notebook[];
  currentNotebookId: string | null;
  onPick: (targetNotebookId: string | null) => void;
};

export function NoteMovePickerProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<Pending | null>(null);

  const openMovePicker: OpenMovePicker = useCallback((notebooks, currentNotebookId, onPick) => {
    const destinations =
      (currentNotebookId !== null ? 1 : 0) +
      notebooks.filter((nb) => nb.id !== currentNotebookId).length;
    if (destinations === 0) {
      Alert.alert(t.notesMovePickerTitle, t.notebookEmpty);
      return;
    }
    setPending({ notebooks, currentNotebookId, onPick });
  }, []);

  const close = useCallback(() => setPending(null), []);

  useEffect(() => {
    registerNoteMovePickerOpener(openMovePicker);
    return () => registerNoteMovePickerOpener(null);
  }, [openMovePicker]);

  return (
    <NoteMovePickerContext.Provider value={openMovePicker}>
      {children}
      <NoteMovePickerModal
        visible={pending !== null}
        notebooks={pending?.notebooks ?? []}
        currentNotebookId={pending?.currentNotebookId ?? null}
        onPick={(target) => pending?.onPick(target)}
        onClose={close}
      />
    </NoteMovePickerContext.Provider>
  );
}

export function useNoteMovePicker(): OpenMovePicker {
  const ctx = useContext(NoteMovePickerContext);
  if (!ctx) {
    throw new Error('useNoteMovePicker must be used within NoteMovePickerProvider');
  }
  return ctx;
}
