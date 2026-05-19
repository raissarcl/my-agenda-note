import { Switch, View } from 'react-native';

import { t } from '../../../../lib/i18n';
import { TaskEditorField as Field } from './TaskEditorField';
import { taskEditorStyles as styles } from './taskEditor.styles';
import type { TaskEditorState } from './useTaskEditorState';

type Props = { state: TaskEditorState };

export function AllDayToggle({ state }: Props) {
  const {
    tokens,
    busy,
    allDay,
    setAllDay,
    setReminderLead,
    setAlertMode,
    defaultLead,
    switchColors,
  } = state;
  return (
    <Field label={t.allDay} tokens={tokens}>
      <View style={styles.rowEnd}>
        <Switch
          value={allDay}
          disabled={busy}
          trackColor={switchColors.trackColor}
          thumbColor={allDay ? switchColors.thumbOn : switchColors.thumbOff}
          ios_backgroundColor={switchColors.trackColor.false}
          onValueChange={(v) => {
            setAllDay(v);
            if (v) {
              setReminderLead(null);
              setAlertMode('normal');
            } else {
              setReminderLead(defaultLead);
            }
          }}
        />
      </View>
    </Field>
  );
}
