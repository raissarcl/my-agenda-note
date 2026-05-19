import { Pressable, Switch, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getDay } from 'date-fns';

import { RECURRENCE_VALUES } from '../../../../types';
import {
  capitalize,
  formatDateISOLocal,
  formatLongDate,
  parseISODate,
} from '../../../../lib/format';
import {
  clampRecurrenceEndToBounds,
  defaultRecurrenceEndISO,
  maxRecurrenceEndISO,
} from '../../../../lib/recurrenceBounds';
import {
  recurrenceLabel,
  t,
  WEEKDAY_PICK_ORDER,
  weekdayShortPt,
} from '../../../../lib/i18n';
import { TaskEditorField as Field } from './TaskEditorField';
import { taskEditorStyles as styles } from './taskEditor.styles';
import type { TaskEditorState } from './useTaskEditorState';

type Props = { state: TaskEditorState };

export function RecurrenceFields({ state }: Props) {
  const {
    tokens,
    busy,
    allDay,
    date,
    recurrence,
    setRecurrence,
    recurrenceEnd,
    setRecurrenceEnd,
    customWeekdays,
    setCustomWeekdays,
    notificationsPaused,
    setNotificationsPaused,
    notificationsPausedUntil,
    setNotificationsPausedUntil,
    showRecEnd,
    setShowRecEnd,
    showPauseUntilPick,
    setShowPauseUntilPick,
    switchColors,
  } = state;

  return (
    <>
      <Field label={t.recurrence} tokens={tokens}>
        <View style={styles.chipRow}>
          {RECURRENCE_VALUES.map((value) => {
            const active = recurrence === value;
            return (
              <Pressable
                key={value}
                onPress={() => {
                  if (value === 'none') {
                    setRecurrence('none');
                    setRecurrenceEnd(undefined);
                    return;
                  }
                  setRecurrence(value);
                  setRecurrenceEnd((prev) =>
                    clampRecurrenceEndToBounds(date, prev ?? defaultRecurrenceEndISO(date))
                  );
                  if (value === 'custom' && customWeekdays.length === 0) {
                    setCustomWeekdays([getDay(parseISODate(date))]);
                  }
                }}
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
                  {recurrenceLabel(value)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Field>

      {recurrence === 'custom' ? (
        <Field label={t.recurrenceCustomWeekdays} tokens={tokens}>
          <Text style={{ fontSize: 12, color: tokens.textMuted, marginBottom: 8 }}>
            {t.customWeekdaysHint}
          </Text>
          <View style={[styles.chipRow, { marginTop: 4 }]}>
            {WEEKDAY_PICK_ORDER.map((d) => {
              const active = customWeekdays.includes(d);
              return (
                <Pressable
                  key={d}
                  onPress={() => {
                    setCustomWeekdays((prev) => {
                      if (prev.includes(d)) return prev.filter((x) => x !== d);
                      return [...prev, d].sort((a, b) => a - b);
                    });
                  }}
                  style={[
                    styles.chip,
                    {
                      minWidth: 44,
                      paddingHorizontal: 10,
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
                    {weekdayShortPt(d)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Field>
      ) : null}

      {recurrence !== 'none' ? (
        <Field label={t.recurrenceEnd} tokens={tokens}>
          <Text style={{ fontSize: 12, color: tokens.textMuted, marginBottom: 8 }}>
            {t.recurrenceEndHint}
          </Text>
          <Pressable
            onPress={() => setShowRecEnd(true)}
            style={[styles.pickerBtn, { borderColor: tokens.border }]}
          >
            <Ionicons name="calendar-outline" size={18} color={tokens.text} />
            <Text style={[styles.pickerText, { color: tokens.text }]}>
              {recurrenceEnd
                ? capitalize(formatLongDate(recurrenceEnd))
                : t.recurrenceEndPick}
            </Text>
          </Pressable>
          {showRecEnd && !busy ? (
            <DateTimePicker
              value={parseISODate(recurrenceEnd ?? defaultRecurrenceEndISO(date))}
              mode="date"
              display="default"
              minimumDate={parseISODate(date)}
              maximumDate={parseISODate(maxRecurrenceEndISO(date))}
              onChange={(_, d) => {
                setShowRecEnd(false);
                if (d) {
                  setRecurrenceEnd(clampRecurrenceEndToBounds(date, formatDateISOLocal(d)));
                }
              }}
            />
          ) : null}
        </Field>
      ) : null}

      {allDay && recurrence !== 'none' ? (
        <Text style={{ fontSize: 12, color: tokens.textMuted, marginBottom: 8 }}>
          {t.allDayRecurrenceHint}
        </Text>
      ) : null}

      {recurrence !== 'none' ? (
        <Field label={t.notificationsPaused} tokens={tokens}>
          <View style={styles.rowEnd}>
            <Switch
              value={notificationsPaused}
              disabled={busy}
              trackColor={switchColors.trackColor}
              thumbColor={notificationsPaused ? switchColors.thumbOn : switchColors.thumbOff}
              ios_backgroundColor={switchColors.trackColor.false}
              onValueChange={(v) => {
                setNotificationsPaused(v);
                if (!v) setNotificationsPausedUntil(null);
              }}
            />
          </View>
          <Text style={{ fontSize: 12, color: tokens.textMuted, marginTop: 6 }}>
            {t.notificationsPausedHint}
          </Text>
          {notificationsPaused ? (
            <>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: '600',
                  color: tokens.textMuted,
                  marginTop: 10,
                }}
              >
                {t.pauseUntil}
              </Text>
              <Text style={{ fontSize: 12, color: tokens.textMuted, marginTop: 4 }}>
                {t.pauseUntilHint}
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                  marginTop: 8,
                  flexWrap: 'wrap',
                }}
              >
                <Pressable
                  onPress={() => setShowPauseUntilPick(true)}
                  style={[
                    styles.pickerBtn,
                    { borderColor: tokens.border, flex: 1, minWidth: 160 },
                  ]}
                >
                  <Ionicons name="calendar-outline" size={18} color={tokens.text} />
                  <Text style={[styles.pickerText, { color: tokens.text }]}>
                    {notificationsPausedUntil
                      ? capitalize(formatLongDate(notificationsPausedUntil))
                      : t.pauseUntilNone}
                  </Text>
                </Pressable>
                {notificationsPausedUntil ? (
                  <Pressable onPress={() => setNotificationsPausedUntil(null)} hitSlop={10}>
                    <Text style={{ color: tokens.danger, fontSize: 14, fontWeight: '600' }}>
                      {t.clear}
                    </Text>
                  </Pressable>
                ) : null}
              </View>
              {showPauseUntilPick && !busy ? (
                <DateTimePicker
                  value={
                    notificationsPausedUntil
                      ? parseISODate(notificationsPausedUntil)
                      : new Date()
                  }
                  mode="date"
                  display="default"
                  minimumDate={new Date()}
                  onChange={(_, d) => {
                    setShowPauseUntilPick(false);
                    if (d) setNotificationsPausedUntil(formatDateISOLocal(d));
                  }}
                />
              ) : null}
            </>
          ) : null}
        </Field>
      ) : null}
    </>
  );
}
