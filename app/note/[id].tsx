import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { NoteEditor } from '../../src/features/notes/components/NoteEditor';
import { useTheme } from '../../src/theme';
import { loadNotes, type Note } from '../../src/lib/notes';

export default function EditNoteScreen() {
  const router = useRouter();
  const { tokens } = useTheme();
  const { id: idParam } = useLocalSearchParams<{ id: string | string[] }>();
  const id = Array.isArray(idParam) ? idParam[0] : idParam;
  const [note, setNote] = useState<Note | null | undefined>(undefined);

  useEffect(() => {
    if (typeof id !== 'string' || !id) {
      setNote(null);
      return;
    }
    let cancelled = false;
    void (async () => {
      const notes = await loadNotes();
      if (cancelled) return;
      setNote(notes.find((n) => n.id === id) ?? null);
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (note === null) {
      router.back();
    }
  }, [note, router]);

  if (note === undefined) {
    return (
      <View style={{ flex: 1, backgroundColor: tokens.bg, justifyContent: 'center' }}>
        <ActivityIndicator color={tokens.primary} />
      </View>
    );
  }

  if (note === null) {
    return null;
  }

  return (
    <NoteEditor
      initialNote={note}
      onClose={() => router.back()}
      onDeleted={() => setNote(null)}
    />
  );
}
