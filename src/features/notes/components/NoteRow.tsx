import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { useTheme } from '../../../theme';
import { useThemedStyles } from '../../../hooks/useThemedStyles';
import { pressOpacity } from '../../../ui/pressable';
import { moveNotes, previewLineFromNote, type Note, type Notebook } from '../../../lib/notes';
import { t } from '../../../lib/i18n';
import { showNoteMovePicker } from '../actions/noteMovePicker';
import { alertError } from '../actions/noteAlerts';
import { createNoteRowStyles } from '../styles/noteRow.styles';

type Props = {
  note: Note;
  notebooks: Notebook[];
  selectMode: boolean;
  selected: boolean;
  busy: boolean;
  onToggleSelected: (id: string) => void;
  onOpen: (id: string) => void;
  onStartSelect: (id: string) => void;
  onDelete: (note: Note) => void;
  onMoved: () => void;
};

export function NoteRow({
  note,
  notebooks,
  selectMode,
  selected,
  busy,
  onToggleSelected,
  onOpen,
  onStartSelect,
  onDelete,
  onMoved,
}: Props) {
  const { tokens } = useTheme();
  const styles = useThemedStyles(createNoteRowStyles);

  const handleMove = () => {
    showNoteMovePicker(notebooks, note.notebookId, (target) => {
      if (target === note.notebookId) return;
      void moveNotes([note.id], target)
        .then(() => onMoved())
        .catch(alertError);
    });
  };

  const handlePress = () => {
    if (selectMode) onToggleSelected(note.id);
    else onOpen(note.id);
  };

  const handleLongPress = () => {
    if (!selectMode) onStartSelect(note.id);
  };

  return (
    <View style={[styles.row, selected && styles.rowSelected]}>
      {selectMode ? (
        <Pressable
          onPress={() => onToggleSelected(note.id)}
          hitSlop={8}
          disabled={busy}
          style={styles.rowCheck}
        >
          <Ionicons
            name={selected ? 'checkbox' : 'square-outline'}
            size={24}
            color={selected ? tokens.primary : tokens.textMuted}
          />
        </Pressable>
      ) : null}
      <Pressable
        onPress={handlePress}
        onLongPress={handleLongPress}
        delayLongPress={380}
        disabled={busy}
        style={({ pressed }) => [
          styles.rowMain,
          { opacity: pressOpacity(busy, pressed, 1, 0.92, 0.5) },
        ]}
      >
        <View style={styles.rowTextWrap}>
          <Text style={styles.rowTitle} numberOfLines={2}>
            {previewLineFromNote(note, 120) || t.notesTitlePlaceholder}
          </Text>
          <Text style={styles.rowMeta}>
            {format(parseISO(note.updatedAt), "d MMM yyyy · HH:mm", { locale: ptBR })}
          </Text>
        </View>
        {!selectMode ? (
          <Ionicons name="chevron-forward" size={20} color={tokens.textFaint} />
        ) : null}
      </Pressable>
      {!selectMode ? (
        <>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t.notesMove}
            onPress={handleMove}
            hitSlop={12}
            disabled={busy}
            style={({ pressed }) => [
              styles.rowIconBtn,
              { opacity: pressOpacity(busy, pressed) },
            ]}
          >
            <Ionicons name="folder-open-outline" size={22} color={tokens.primary} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t.notesDelete}
            onPress={() => onDelete(note)}
            hitSlop={12}
            disabled={busy}
            style={({ pressed }) => [
              styles.rowIconBtn,
              { opacity: pressOpacity(busy, pressed) },
            ]}
          >
            <Ionicons name="trash-outline" size={22} color={tokens.danger} />
          </Pressable>
        </>
      ) : null}
    </View>
  );
}
