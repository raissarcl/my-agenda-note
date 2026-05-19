import type { Note } from '../../../../lib/notes';

export type NoteEditorProps = {
  initialNote: Note | null;
  notebookId?: string | null;
  onClose: () => void;
  onDeleted?: () => void;
};
