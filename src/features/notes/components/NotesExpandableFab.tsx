import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../../../theme';
import { useThemedStyles } from '../../../hooks/useThemedStyles';
import { pressOpacity } from '../../../ui/pressable';
import { t } from '../../../lib/i18n';
import { createNotesExpandableFabStyles } from '../styles/notesExpandableFab.styles';

type Props = {
  onNewNote: () => void;
  onNewNotebook: () => void;
};

export function NotesExpandableFab({ onNewNote, onNewNotebook }: Props) {
  const { tokens } = useTheme();
  const styles = useThemedStyles(createNotesExpandableFabStyles);
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  const handleNewNote = () => {
    close();
    onNewNote();
  };

  const handleNewNotebook = () => {
    close();
    onNewNotebook();
  };

  return (
    <>
      {open ? (
        <Pressable
          style={styles.backdrop}
          onPress={close}
          accessibilityLabel={t.cancel}
          accessibilityRole="button"
        />
      ) : null}

      <View style={[styles.wrap, { bottom: 24 + insets.bottom }]} pointerEvents="box-none">
        {open ? (
          <>
            <Pressable
              onPress={handleNewNote}
              accessibilityRole="button"
              accessibilityLabel={t.newNote}
              style={({ pressed }) => [
                styles.actionRow,
                { opacity: pressOpacity(false, pressed) },
              ]}
            >
              <Text style={styles.actionLabel}>{t.newNote}</Text>
              <View style={styles.miniBtn}>
                <Ionicons name="document-text-outline" size={24} color={tokens.primary} />
              </View>
            </Pressable>
            <Pressable
              onPress={handleNewNotebook}
              accessibilityRole="button"
              accessibilityLabel={t.newNotebook}
              style={({ pressed }) => [
                styles.actionRow,
                { opacity: pressOpacity(false, pressed) },
              ]}
            >
              <Text style={styles.actionLabel}>{t.newNotebook}</Text>
              <View style={styles.miniBtn}>
                <Ionicons name="folder-outline" size={24} color={tokens.primary} />
              </View>
            </Pressable>
          </>
        ) : null}

        <Pressable
          onPress={() => setOpen((v) => !v)}
          accessibilityRole="button"
          accessibilityLabel={open ? t.cancel : t.notesFabPrompt}
          style={({ pressed }) => [
            styles.mainBtn,
            { opacity: pressOpacity(false, pressed) },
          ]}
        >
          <Ionicons
            name={open ? 'close' : 'add'}
            size={28}
            color={tokens.primaryText}
          />
        </Pressable>
      </View>
    </>
  );
}
