import { useLocalSearchParams, useRouter } from 'expo-router';
import { TaskEditor } from '../../src/features/tasks/components/TaskEditor';

export default function EditTaskScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  if (typeof id !== 'string' || !id) {
    return null;
  }
  return (
    <TaskEditor mode={{ kind: 'edit', taskId: id }} onClose={() => router.back()} />
  );
}
