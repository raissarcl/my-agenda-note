import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../../../theme';
import { useThemedStyles } from '../../../hooks/useThemedStyles';
import { pressOpacity } from '../../../ui/pressable';
import { t } from '../../../lib/i18n';
import {
  deleteNotebook,
  getNotebook,
  loadNotesByNotebook,
  moveNotes,
  previewLineFromNote,
  type Note,
  type Notebook,
} from '../../../lib/notes';
import {
  alertError,
  confirmDeleteNotebookAll,
  confirmDeleteNotebookMoveToMain,
} from '../actions/noteAlerts';
import { createDeleteNotebookStyles } from '../styles/deleteNotebook.styles';

function parseNotebookId(raw: string | string[] | undefined): string | undefined {
  return Array.isArray(raw) ? raw[0] : raw;
}

export function DeleteNotebookScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { tokens } = useTheme();
  const styles = useThemedStyles(createDeleteNotebookStyles);
  const { id: idParam } = useLocalSearchParams<{ id: string | string[] }>();
  const notebookId = parseNotebookId(idParam);

  const [notebook, setNotebook] = useState<Notebook | null | undefined>(undefined);
  const [notes, setNotes] = useState<Note[]>([]);
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!notebookId) {
      setNotebook(null);
      return;
    }
    let cancelled = false;
    void Promise.all([getNotebook(notebookId), loadNotesByNotebook(notebookId)]).then(
      ([nb, list]) => {
        if (cancelled) return;
        setNotebook(nb);
        setNotes(list);
        setSelected(new Set(list.map((n) => n.id)));
      }
    );
    return () => {
      cancelled = true;
    };
  }, [notebookId]);

  useEffect(() => {
    if (notebook === null) router.back();
  }, [notebook, router]);

  const toggle = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const finishDelete = useCallback(
    async (deleteNoteIds: string[]) => {
      if (!notebookId) return;
      setBusy(true);
      try {
        await deleteNotebook(notebookId, { deleteNoteIds });
        router.back();
      } finally {
        setBusy(false);
      }
    },
    [notebookId, router]
  );

  if (notebook === undefined) {
    return (
      <View style={styles.centered}>
        <Text style={styles.empty}>{t.saving}</Text>
      </View>
    );
  }

  if (notebook === null) return null;

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 16 }]}>
      <Text style={styles.title}>
        {notebook.title.trim() || t.notebookTitlePlaceholder}
      </Text>
      {notes.length > 0 ? (
        <ScrollView contentContainerStyle={styles.list}>
          {notes.map((note) => {
            const checked = selected.has(note.id);
            return (
              <Pressable
                key={note.id}
                onPress={() => toggle(note.id)}
                disabled={busy}
                style={[styles.noteRow, checked && styles.noteRowSelected]}
              >
                <Ionicons
                  name={checked ? 'checkbox' : 'square-outline'}
                  size={24}
                  color={checked ? tokens.primary : tokens.textMuted}
                />
                <Text style={styles.noteLabel} numberOfLines={2}>
                  {previewLineFromNote(note, 100) || t.notesTitlePlaceholder}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      ) : (
        <Text style={styles.empty}>{t.notebookEmpty}</Text>
      )}

      <Pressable
        onPress={() =>
          confirmDeleteNotebookMoveToMain({
            moveIds: [...selected],
            deleteIds: notes.filter((n) => !selected.has(n.id)).map((n) => n.id),
            setBusy,
            moveNotes,
            finishDelete,
            onError: alertError,
          })
        }
        disabled={busy || notes.length === 0}
        style={({ pressed }) => [
          styles.btn,
          { opacity: pressOpacity(busy || notes.length === 0, pressed) },
        ]}
      >
        <Text style={styles.btnLabelPrimary}>{t.notebookMoveSelectedToMain}</Text>
      </Pressable>
      <Pressable
        onPress={() =>
          confirmDeleteNotebookAll({ notebookId, notes, selected, finishDelete })
        }
        disabled={busy}
        style={({ pressed }) => [
          styles.btn,
          styles.btnDanger,
          { opacity: pressOpacity(busy, pressed) },
        ]}
      >
        <Text style={styles.btnLabelDanger}>
          {notes.length > 0 ? t.notebookDeleteWithNotes : t.notebookDelete}
        </Text>
      </Pressable>
    </View>
  );
}
