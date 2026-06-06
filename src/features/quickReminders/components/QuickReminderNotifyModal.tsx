import { useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';

import { useTheme } from '../../../theme';
import { useThemedStyles } from '../../../hooks/useThemedStyles';
import { alertError, t } from '../../../lib/i18n';
import { combineDateTime, formatDateISOLocal } from '../../../lib/format';
import { requestPermissionIfNeeded } from '../../../lib/notifications';
import { createQuickRemindersScreenStyles } from '../styles/quickRemindersScreen.styles';

type Props = {
  visible: boolean;
  text: string;
  notifyAt: string | null;
  onClose: () => void;
  onSave: (notifyAt: string | null) => void;
};

function defaultNotifyParts(): { date: string; time: string } {
  const d = new Date();
  d.setMinutes(0, 0, 0);
  d.setHours(d.getHours() + 1);
  return { date: formatDateISOLocal(d), time: format(d, 'HH:mm') };
}

function partsFromNotifyAt(iso: string | null): { date: string; time: string } {
  if (!iso) return defaultNotifyParts();
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return defaultNotifyParts();
    return { date: formatDateISOLocal(d), time: format(d, 'HH:mm') };
  } catch {
    return defaultNotifyParts();
  }
}

export function QuickReminderNotifyModal({
  visible,
  text,
  notifyAt,
  onClose,
  onSave,
}: Props) {
  const { tokens } = useTheme();
  const styles = useThemedStyles(createQuickRemindersScreenStyles);
  const [date, setDate] = useState(() => partsFromNotifyAt(notifyAt).date);
  const [time, setTime] = useState(() => partsFromNotifyAt(notifyAt).time);
  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);

  useEffect(() => {
    if (!visible) return;
    const parts = partsFromNotifyAt(notifyAt);
    setDate(parts.date);
    setTime(parts.time);
    setShowDate(false);
    setShowTime(false);
  }, [visible, notifyAt]);

  const dateAsObj = useMemo(() => combineDateTime(date, '12:00'), [date]);
  const timeAsObj = useMemo(() => combineDateTime(date, time), [date, time]);

  const onSchedule = async () => {
    const fireAt = combineDateTime(date, time);
    if (fireAt.getTime() <= Date.now() + 1000) {
      alertError(new Error(t.quickRemindersNotifyPast));
      return;
    }
    const granted = await requestPermissionIfNeeded();
    if (!granted) {
      alertError(new Error(t.permissionDenied));
      return;
    }
    onSave(fireAt.toISOString());
    onClose();
  };

  const onRemove = () => {
    onSave(null);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.editModalRoot}
      >
        <Pressable style={styles.editOverlay} onPress={onClose} />
        <View style={styles.editCard}>
          <Text style={styles.editTitle}>{t.quickRemindersNotifyTitle}</Text>
          <Text style={[styles.hint, { color: tokens.textMuted, marginTop: 0 }]} numberOfLines={2}>
            {text}
          </Text>
          <Pressable
            onPress={() => setShowDate(true)}
            style={[styles.notifyPickerBtn, { borderColor: tokens.border }]}
          >
            <Ionicons name="calendar-outline" size={18} color={tokens.text} />
            <Text style={{ color: tokens.text, fontSize: 15 }}>{date}</Text>
          </Pressable>
          {showDate ? (
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
          <Pressable
            onPress={() => setShowTime(true)}
            style={[styles.notifyPickerBtn, { borderColor: tokens.border }]}
          >
            <Ionicons name="time-outline" size={18} color={tokens.text} />
            <Text style={{ color: tokens.text, fontSize: 15 }}>{time}</Text>
          </Pressable>
          {showTime ? (
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
          <View style={styles.editActions}>
            {notifyAt ? (
              <Pressable
                onPress={onRemove}
                style={({ pressed }) => [
                  styles.editBtn,
                  styles.editBtnSecondary,
                  { opacity: pressed ? 0.85 : 1 },
                ]}
              >
                <Text style={styles.editBtnText}>{t.quickRemindersNotifyRemove}</Text>
              </Pressable>
            ) : null}
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [
                styles.editBtn,
                styles.editBtnSecondary,
                { opacity: pressed ? 0.85 : 1 },
              ]}
            >
              <Text style={styles.editBtnText}>{t.cancel}</Text>
            </Pressable>
            <Pressable
              onPress={() => void onSchedule()}
              style={({ pressed }) => [
                styles.editBtn,
                styles.editBtnPrimary,
                { opacity: pressed ? 0.85 : 1 },
              ]}
            >
              <Text style={styles.editBtnTextPrimary}>{t.quickRemindersNotifySchedule}</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
