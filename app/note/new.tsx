import { useLocalSearchParams, useRouter } from 'expo-router';
import { NoteEditor } from '../../src/features/notes/components/NoteEditor';

function paramNotebookId(
  raw: string | string[] | undefined
): string | null {
  const id = Array.isArray(raw) ? raw[0] : raw;
  if (typeof id === 'string' && id.length > 0) return id;
  return null;
}

export default function NewNoteScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ notebookId?: string | string[] }>();
  return (
    <NoteEditor
      initialNote={null}
      notebookId={paramNotebookId(params.notebookId)}
      onClose={() => router.back()}
    />
  );
}
