export type TaskEditorMode =
  | { kind: 'new'; initialDate?: string }
  | { kind: 'edit'; taskId: string };

export type TaskEditorProps = {
  mode: TaskEditorMode;
  onClose: () => void;
};
