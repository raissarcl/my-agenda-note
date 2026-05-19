import { useLocalSearchParams, useRouter } from 'expo-router';
import { TaskEditor } from '../../src/features/tasks/components/TaskEditor';

function closeTaskModal(router: ReturnType<typeof useRouter>) {
  if (router.canDismiss()) {
    router.dismiss();
    return;
  }
  if (router.canGoBack()) {
    router.back();
    return;
  }
  router.replace('/(tabs)');
}

function paramDate(raw: string | string[] | undefined): string | undefined {
  if (typeof raw === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  if (Array.isArray(raw) && typeof raw[0] === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(raw[0])) {
    return raw[0];
  }
  return undefined;
}

export default function NewTaskScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ date?: string | string[] }>();
  return (
    <TaskEditor
      mode={{
        kind: 'new',
        initialDate: paramDate(params.date),
      }}
      onClose={() => closeTaskModal(router)}
    />
  );
}
