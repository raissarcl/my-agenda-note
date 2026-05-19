import { Pressable, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

import { capitalize, formatDateISOLocal, formatLongDate } from '../../../../lib/format';
import { t } from '../../../../lib/i18n';
import { TaskEditorField as Field } from './TaskEditorField';
import { taskEditorStyles as styles } from './taskEditor.styles';
import type { TaskEditorState } from './useTaskEditorState';

type Props = { state: TaskEditorState };

export function DateTimeFields({ state }: Props) {
  const {
    tokens,
    busy,
    allDay,
    date,
    setDate,
    time,
    setTime,
    showDate,
    setShowDate,
    showTime,
    setShowTime,
    dateAsObj,
    timeAsObj,
  } = state;

  return (
    <>
      <Field label={t.date} tokens={tokens}>
        <Pressable
          onPress={() => setShowDate(true)}
          style={[styles.pickerBtn, { borderColor: tokens.border }]}
        >
          <Ionicons name="calendar-outline" size={18} color={tokens.text} />
          <Text style={[styles.pickerText, { color: tokens.text }]}>
            {capitalize(formatLongDate(date))}
          </Text>
        </Pressable>
        {showDate && !busy ? (
          <DateTimePicker
            value={dateAsObj}
            mode="date"
            display="default"
            onChange={(_, d) => {
              setShowDate(false);
              if (d) setDate(formatDateISOLocal(d));
            }}
          />
        ) : null}
      </Field>

      {!allDay ? (
        <Field label={t.time} tokens={tokens}>
          <Pressable
            onPress={() => setShowTime(true)}
            style={[styles.pickerBtn, { borderColor: tokens.border }]}
          >
            <Ionicons name="time-outline" size={18} color={tokens.text} />
            <Text style={[styles.pickerText, { color: tokens.text }]}>{time}</Text>
          </Pressable>
          {showTime && !busy ? (
            <DateTimePicker
              value={timeAsObj}
              mode="time"
              is24Hour
              display="default"
              onChange={(_, d) => {
                setShowTime(false);
                if (d) {
                  const hh = String(d.getHours()).padStart(2, '0');
                  const mm = String(d.getMinutes()).padStart(2, '0');
                  setTime(`${hh}:${mm}`);
                }
              }}
            />
          ) : null}
        </Field>
      ) : null}
    </>
  );
}
