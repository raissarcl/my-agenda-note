import { Pressable, Text, View } from 'react-native';

import { t } from '../../../../lib/i18n';
import { TASK_TAGS, taskTagLabel } from '../../../../lib/taskTags';
import type { TaskTagId } from '../../../../types';
import { TaskEditorField as Field } from './TaskEditorField';
import { taskEditorStyles as styles } from './taskEditor.styles';
import type { TaskEditorState } from './useTaskEditorState';

type Props = {
  state: TaskEditorState;
};

export function TaskTagField({ state }: Props) {
  const { tokens, busy, tagId, setTagId } = state;

  const onPressTag = (id: TaskTagId) => {
    if (busy) return;
    setTagId(tagId === id ? null : id);
  };

  return (
    <Field label={t.taskTagOptional} tokens={tokens}>
      <View style={styles.chipRow}>
        {TASK_TAGS.map((tag) => {
          const active = tagId === tag.id;
          return (
            <Pressable
              key={tag.id}
              onPress={() => onPressTag(tag.id)}
              disabled={busy}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              style={({ pressed }) => [
                styles.chip,
                {
                  borderColor: active ? tokens.primary : tokens.border,
                  backgroundColor: active ? tokens.primary : tokens.surfaceAlt,
                  opacity: busy ? 0.5 : pressed ? 0.8 : 1,
                },
              ]}
            >
              <Text
                style={{
                  color: active ? tokens.primaryText : tokens.textMuted,
                  fontSize: 13,
                  fontWeight: active ? '600' : '500',
                }}
              >
                {taskTagLabel(tag.id)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </Field>
  );
}
