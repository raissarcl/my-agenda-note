import type { Note, Notebook } from '../../../lib/notes';
import { NoteRow } from './NoteRow';

type Props = {
  items: Note[];
  notebooks: Notebook[];
  selectMode: boolean;
  selectedIds: Set<string>;
  busy: boolean;
  onToggleSelected: (id: string) => void;
  onOpenNote: (id: string) => void;
  onStartSelect: (id: string) => void;
  onDeleteNote: (note: Note) => void;
  onMoved: () => void;
};

export function NotesList({
  items,
  notebooks,
  selectMode,
  selectedIds,
  busy,
  onToggleSelected,
  onOpenNote,
  onStartSelect,
  onDeleteNote,
  onMoved,
}: Props) {
  return (
    <>
      {items.map((note) => (
        <NoteRow
          key={note.id}
          note={note}
          notebooks={notebooks}
          selectMode={selectMode}
          selected={selectedIds.has(note.id)}
          busy={busy}
          onToggleSelected={onToggleSelected}
          onOpen={onOpenNote}
          onStartSelect={onStartSelect}
          onDelete={onDeleteNote}
          onMoved={onMoved}
        />
      ))}
    </>
  );
}
