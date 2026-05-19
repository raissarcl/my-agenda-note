import { KeyboardAvoidingView, ScrollView, View } from 'react-native';

import { ScreenBusyOverlay } from '../../../../ui/ScreenBusyOverlay';
import { TaskEditorForm } from './TaskEditorForm';
import { TaskEditorFooter } from './TaskEditorFooter';
import { taskEditorStyles as styles } from './taskEditor.styles';
import type { TaskEditorProps } from './types';
import { useTaskEditorState } from './useTaskEditorState';

export function TaskEditor(props: TaskEditorProps) {
  const state = useTaskEditorState(props);
  const { tokens, insets, busy, mode, existing } = state;

  if (mode.kind === 'edit' && !existing) {
    return null;
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: tokens.bg }]}
      behavior="height"
      keyboardVerticalOffset={0}
    >
      <View style={styles.scrollWrap}>
        <ScrollView
          style={styles.scrollView}
          scrollEnabled={!busy}
          contentContainerStyle={[
            styles.scroll,
            { flexGrow: 1, paddingBottom: 160 + insets.bottom },
          ]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator
          nestedScrollEnabled
        >
          <TaskEditorForm state={state} />
        </ScrollView>
      </View>

      <TaskEditorFooter state={state} />
      <ScreenBusyOverlay visible={busy} />
    </KeyboardAvoidingView>
  );
}
