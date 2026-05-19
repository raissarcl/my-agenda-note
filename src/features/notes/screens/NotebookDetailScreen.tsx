import { useCallback, useLayoutEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useNavigation, useRouter } from 'expo-router';

import { Fab } from '../../../components/Fab';
import { EmptyState } from '../../../components/EmptyState';
import { useMultiSelect } from '../../../hooks/useMultiSelect';
import { useThemedStyles } from '../../../hooks/useThemedStyles';
import { ScreenBusyOverlay } from '../../../ui/ScreenBusyOverlay';
import { t } from '../../../lib/i18n';
import { moveNotes, removeNote, removeNotes } from '../../../lib/notes';
import { NotesListHeader } from '../components/NotesListHeader';
import { NotesList } from '../components/NotesList';
import { useNotebookDetail } from '../hooks/useNotebookDetail';
import {
  alertError,
  alertMoveDone,
  confirmDeleteMany,
  confirmDeleteNote,
} from '../actions/noteAlerts';
import { showNoteMovePicker } from '../actions/noteMovePicker';
import { createNotebookDetailStyles } from '../styles/notebookDetail.styles';

function parseNotebookId(raw: string | string[] | undefined): string | undefined {
  return Array.isArray(raw) ? raw[0] : raw;
}

export function NotebookDetailScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const styles = useThemedStyles(createNotebookDetailStyles);
  const { id: idParam } = useLocalSearchParams<{ id: string | string[] }>();
  const notebookId = parseNotebookId(idParam);
  const { notebook, notebooks, items, reload } = useNotebookDetail(notebookId);
  const [loading, setLoading] = useState(true);
  const selection = useMultiSelect();
  const [deletingBulk, setDeletingBulk] = useState(false);
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);
  const busy = deletingBulk || deletingNoteId !== null;

  useFocusEffect(
    useCallback(() => {
      if (!notebookId) {
        setLoading(false);
        return;
      }
      let cancelled = false;
      setLoading(true);
      void reload().finally(() => {
        if (!cancelled) setLoading(false);
      });
      return () => {
        cancelled = true;
      };
    }, [notebookId, reload])
  );

  const handleBulkMove = useCallback(() => {
    const ids = [...selection.selectedIdsRef.current];
    if (ids.length === 0) return;
    showNoteMovePicker(notebooks, notebookId ?? null, (target) => {
      void moveNotes(ids, target)
        .then(() => reload())
        .then(() => {
          selection.exitSelectMode();
          alertMoveDone();
        })
        .catch(alertError);
    });
  }, [notebooks, notebookId, reload, selection]);

  const handleBulkDelete = useCallback(() => {
    confirmDeleteMany(selection.selectedCount, () => {
      const ids = [...selection.selectedIdsRef.current];
      setDeletingBulk(true);
      void removeNotes(ids)
        .then(() => reload())
        .then(() => selection.exitSelectMode())
        .catch(alertError)
        .finally(() => setDeletingBulk(false));
    });
  }, [reload, selection]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: notebook?.title.trim() || t.notebookTitlePlaceholder,
      headerRight: () =>
        selection.selectMode ? (
          <NotesListHeader
            mode="select"
            busy={busy}
            selectedCount={selection.selectedCount}
            onMove={handleBulkMove}
            onCancel={selection.exitSelectMode}
            onDeleteMany={handleBulkDelete}
          />
        ) : (
          <NotesListHeader
            mode="notebook"
            busy={busy}
            onEnterSelect={selection.enterSelectMode}
          />
        ),
    });
  }, [navigation, notebook, selection, busy, handleBulkMove, handleBulkDelete]);

  const handleDeleteNote = useCallback(
    (note: { id: string }) => {
      confirmDeleteNote(() => {
        setDeletingNoteId(note.id);
        void removeNote(note.id)
          .then(() => reload())
          .catch(alertError)
          .finally(() => setDeletingNoteId(null));
      });
    },
    [reload]
  );

  if (notebook === undefined || loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (notebook === null) return null;

  return (
    <View style={styles.container}>
      {items.length === 0 ? (
        <EmptyState message={t.notebookEmpty} icon="document-text-outline" />
      ) : (
        <ScrollView contentContainerStyle={styles.listContent}>
          <NotesList
            items={items}
            notebooks={notebooks}
            selectMode={selection.selectMode}
            selectedIds={selection.selectedIds}
            busy={busy}
            onToggleSelected={selection.toggleSelected}
            onOpenNote={(id) => router.push(`/note/${id}`)}
            onStartSelect={selection.startSelectWith}
            onDeleteNote={handleDeleteNote}
            onMoved={() => void reload()}
          />
        </ScrollView>
      )}
      {!selection.selectMode && !busy ? (
        <Fab
          onPress={() =>
            router.push({ pathname: '/note/new', params: { notebookId: notebook.id } })
          }
        />
      ) : null}
      <ScreenBusyOverlay visible={busy} />
    </View>
  );
}
