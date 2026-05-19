import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../../../theme';
import { useThemedStyles } from '../../../hooks/useThemedStyles';
import { pressOpacity } from '../../../ui/pressable';
import { t } from '../../../lib/i18n';
import type { Notebook } from '../../../lib/notes';
import { createNotebookRowStyles } from '../styles/notebookRow.styles';

type Props = {
  notebook: Notebook;
  noteCount: number;
  selectMode: boolean;
  busy: boolean;
  onOpen: () => void;
  onMenu: () => void;
  onLongPressMenu: () => void;
};

export function NotebookRow({
  notebook,
  noteCount,
  selectMode,
  busy,
  onOpen,
  onMenu,
  onLongPressMenu,
}: Props) {
  const { tokens } = useTheme();
  const styles = useThemedStyles(createNotebookRowStyles);

  return (
    <View style={styles.row}>
      <Pressable
        onPress={onOpen}
        onLongPress={onLongPressMenu}
        disabled={busy}
        style={({ pressed }) => [
          styles.main,
          { opacity: pressOpacity(busy, pressed, 1, 0.92, 0.5) },
        ]}
      >
        <Ionicons name="folder" size={24} color={tokens.primary} />
        <View style={styles.textWrap}>
          <Text style={styles.title} numberOfLines={2}>
            {notebook.title.trim() || t.notebookTitlePlaceholder}
          </Text>
          <Text style={styles.meta}>
            {t.notebookNoteCount.replace('{n}', String(noteCount))}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={tokens.textFaint} />
      </Pressable>
      {!selectMode ? (
        <Pressable
          onPress={onMenu}
          hitSlop={12}
          disabled={busy}
          style={styles.menuBtn}
        >
          <Ionicons name="ellipsis-horizontal" size={22} color={tokens.textMuted} />
        </Pressable>
      ) : null}
    </View>
  );
}
