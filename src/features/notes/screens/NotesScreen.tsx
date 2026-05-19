import { useCallback, useLayoutEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { useNavigation, useRouter } from 'expo-router';

import { useTheme } from '../../../theme';

import { EmptyState } from '../../../components/EmptyState';
import { NotesExpandableFab } from '../components/NotesExpandableFab';
import { useMultiSelect } from '../../../hooks/useMultiSelect';
import { useFocusReload } from '../../../hooks/useFocusReload';
import { useThemedStyles } from '../../../hooks/useThemedStyles';
import { ScreenBusyOverlay } from '../../../ui/ScreenBusyOverlay';
import { SectionLabel } from '../../../ui/SectionLabel';
import { t } from '../../../lib/i18n';
import { moveNotes, noteCountForNotebook, removeNote, removeNotes } from '../../../lib/notes';
import { NotesListHeader } from '../components/NotesListHeader';
import { NotebookRow } from '../components/NotebookRow';
import { NotesList } from '../components/NotesList';
import { useNotesList } from '../hooks/useNotesList';
import {
  alertError,
  alertMoveDone,
  confirmDeleteMany,
  confirmDeleteNote,
  showNotebookOverflowMenu,
} from '../actions/noteAlerts';
import { showNoteMovePicker } from '../actions/noteMovePicker';
import { createNotesScreenStyles } from '../styles/notesScreen.styles';

export function NotesScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { tokens } = useTheme();
  const styles = useThemedStyles(createNotesScreenStyles);
  const { notebooks, allNotes, rootNotes, reload } = useNotesList();
  const { loading } = useFocusReload(reload);
  const selection = useMultiSelect();
  const [deletingBulk, setDeletingBulk] = useState(false);
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);
  const busy = deletingBulk || deletingNoteId !== null;

  const handleBulkMove = useCallback(() => {
    const ids = [...selection.selectedIdsRef.current];
    if (ids.length === 0) return;
    showNoteMovePicker(notebooks, null, (target) => {
      void moveNotes(ids, target)
        .then(() => reload())
        .then(() => {
          selection.exitSelectMode();
          alertMoveDone();
        })
        .catch(alertError);
    });
  }, [notebooks, reload, selection]);

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
            mode="normal"
            busy={busy}
            onEnterSelect={selection.enterSelectMode}
          />
        ),
    });
  }, [navigation, selection, busy, handleBulkMove, handleBulkDelete]);

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

  const isEmpty = !loading && notebooks.length === 0 && rootNotes.length === 0;

  return (
    <View style={styles.container}>
      <Text style={styles.hint}>{t.notesTabHint}</Text>
      {loading ? (
        <ActivityIndicator style={styles.loader} color={tokens.primary} />
      ) : isEmpty ? (
        <EmptyState message={t.notesEmptyList} icon="document-text-outline" />
      ) : (
        <ScrollView
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
        >
          {notebooks.length > 0 ? (
            <SectionLabel>{t.notebooksSection}</SectionLabel>
          ) : null}
          {notebooks.map((nb) => (
            <NotebookRow
              key={nb.id}
              notebook={nb}
              noteCount={noteCountForNotebook(nb.id, allNotes)}
              selectMode={selection.selectMode}
              busy={busy}
              onOpen={() => router.push(`/notebook/${nb.id}`)}
              onMenu={() => showNotebookOverflowMenu(router, nb)}
              onLongPressMenu={() => showNotebookOverflowMenu(router, nb)}
            />
          ))}
          {rootNotes.length > 0 ? (
            <SectionLabel
              style={notebooks.length > 0 ? styles.sectionSpaced : undefined}
            >
              {t.rootNotesSection}
            </SectionLabel>
          ) : null}
          <NotesList
            items={rootNotes}
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
        <NotesExpandableFab
          onNewNote={() => router.push('/note/new')}
          onNewNotebook={() => router.push('/notebook/new')}
        />
      ) : null}
      <ScreenBusyOverlay visible={busy} />
    </View>
  );
}
