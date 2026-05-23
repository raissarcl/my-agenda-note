import { useMemo } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../../../theme';
import { useThemedStyles } from '../../../hooks/useThemedStyles';
import { t } from '../../../lib/i18n';
import type { Notebook } from '../../../lib/notes';
import { createNoteMovePickerModalStyles } from '../styles/noteMovePickerModal.styles';

export type NoteMovePickerModalProps = {
  visible: boolean;
  notebooks: Notebook[];
  currentNotebookId: string | null;
  onPick: (targetNotebookId: string | null) => void;
  onClose: () => void;
};

type Destination =
  | { kind: 'main' }
  | { kind: 'notebook'; notebook: Notebook };

function buildDestinations(
  notebooks: Notebook[],
  currentNotebookId: string | null
): Destination[] {
  const items: Destination[] = [];
  if (currentNotebookId !== null) {
    items.push({ kind: 'main' });
  }
  for (const nb of notebooks) {
    if (nb.id === currentNotebookId) continue;
    items.push({ kind: 'notebook', notebook: nb });
  }
  return items;
}

export function NoteMovePickerModal({
  visible,
  notebooks,
  currentNotebookId,
  onPick,
  onClose,
}: NoteMovePickerModalProps) {
  const { tokens } = useTheme();
  const styles = useThemedStyles(createNoteMovePickerModalStyles);
  const insets = useSafeAreaInsets();

  const destinations = useMemo(
    () => buildDestinations(notebooks, currentNotebookId),
    [notebooks, currentNotebookId]
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        <Pressable style={styles.overlay} onPress={onClose} accessibilityRole="button" />
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <View style={styles.header}>
            <Text style={styles.title}>{t.notesMovePickerTitle}</Text>
          </View>
          <ScrollView
            style={styles.list}
            contentContainerStyle={styles.listContent}
            keyboardShouldPersistTaps="handled"
            bounces={destinations.length > 6}
          >
            {destinations.map((dest) => {
              if (dest.kind === 'main') {
                return (
                  <Pressable
                    key="main"
                    onPress={() => {
                      onPick(null);
                      onClose();
                    }}
                    style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
                  >
                    <Ionicons name="document-text-outline" size={22} color={tokens.primary} />
                    <Text style={styles.rowLabel}>{t.notesMoveToMain}</Text>
                  </Pressable>
                );
              }
              const label =
                dest.notebook.title.trim() || t.notebookTitlePlaceholder;
              return (
                <Pressable
                  key={dest.notebook.id}
                  onPress={() => {
                    onPick(dest.notebook.id);
                    onClose();
                  }}
                  style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
                >
                  <Ionicons name="folder-outline" size={22} color={tokens.primary} />
                  <Text style={styles.rowLabel} numberOfLines={2}>
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
          <View style={styles.footer}>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [styles.cancelBtn, pressed && styles.rowPressed]}
            >
              <Text style={styles.cancelText}>{t.cancel}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
