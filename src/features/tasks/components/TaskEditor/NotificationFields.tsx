import { Pressable, Text, View } from 'react-native';

import {
  ALERT_MODE_OPTIONS,
  NOTIFICATION_LEAD_VALUES,
} from '../../../../types';
import { notificationLeadLabel, t } from '../../../../lib/i18n';
import { TaskEditorField as Field } from './TaskEditorField';
import { taskEditorStyles as styles } from './taskEditor.styles';
import type { TaskEditorState } from './useTaskEditorState';

type Props = { state: TaskEditorState };

export function NotificationFields({ state }: Props) {
  const { tokens, reminderLead, setReminderLead, alertMode, setAlertMode } = state;
  return (
    <>
      <Field label={t.notification} tokens={tokens}>
        <View style={styles.chipRow}>
          {NOTIFICATION_LEAD_VALUES.map((value) => {
            const active = reminderLead === value;
            return (
              <Pressable
                key={String(value)}
                onPress={() => setReminderLead(value)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: active ? tokens.primary : tokens.surfaceAlt,
                    borderColor: active ? tokens.primary : tokens.border,
                  },
                ]}
              >
                <Text
                  style={{
                    color: active ? tokens.primaryText : tokens.text,
                    fontSize: 13,
                    fontWeight: active ? '600' : '500',
                  }}
                >
                  {notificationLeadLabel(value)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Field>

      <Field label={t.alertMode} tokens={tokens}>
        <View style={styles.chipRow}>
          {ALERT_MODE_OPTIONS.map((opt) => {
            const active = alertMode === opt.value;
            const isStrong = opt.value === 'strong';
            const label = opt.value === 'normal' ? t.alertModeNormal : t.alertModeStrong;
            const bg = isStrong
              ? active
                ? tokens.danger
                : `${tokens.danger}18`
              : active
                ? tokens.primary
                : tokens.surfaceAlt;
            const border = isStrong
              ? tokens.danger
              : active
                ? tokens.primary
                : tokens.border;
            const labelColor = isStrong
              ? active
                ? '#ffffff'
                : tokens.danger
              : active
                ? tokens.primaryText
                : tokens.text;
            return (
              <Pressable
                key={opt.value}
                onPress={() => setAlertMode(opt.value)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: bg,
                    borderColor: border,
                    borderWidth: isStrong ? 2 : 1,
                  },
                ]}
              >
                <Text
                  style={{
                    color: labelColor,
                    fontSize: 13,
                    fontWeight: active ? '700' : isStrong ? '600' : '500',
                  }}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        {alertMode === 'strong' ? (
          <Text style={{ fontSize: 12, color: tokens.textMuted, marginTop: 6 }}>
            {t.alertModeStrongHint}
          </Text>
        ) : null}
      </Field>
    </>
  );
}
