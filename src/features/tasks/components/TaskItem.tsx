import { useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Pressable,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Swipeable, GestureHandlerRootView } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';

import { useTheme } from '../../../theme';
import { useTasksStore } from '../../../store/tasks';
import { colorForId } from '../../../lib/colors';
import { formatDateISOLocal, formatShortDate, parseISODate } from '../../../lib/format';
import {
  getTimeBucket,
  getTimeBucketLabel,
  getTimeBucketStyles,
} from '../../../lib/timeBuckets';
import { alertError, formatTaskCountdown, t } from '../../../lib/i18n';
import { taskTagColor, taskTagLabel } from '../../../lib/taskTags';
import { isOccurrenceDone } from '../../../lib/taskCompletion';
import type { TaskOccurrence } from '../../../types';
import { taskItemStyles as styles } from '../styles/taskItem.styles';

type Props = {
  occurrence: TaskOccurrence;
  showDate?: boolean;
};

export function TaskItem({ occurrence, showDate = true }: Props) {
  const { tokens, isDark } = useTheme();
  const router = useRouter();
  const remove = useTasksStore((s) => s.remove);
  const toggleOccurrenceDone = useTasksStore((s) => s.toggleOccurrenceDone);
  const swipeRef = useRef<Swipeable | null>(null);
  const [toggleBusy, setToggleBusy] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const occurrenceCompleted = isOccurrenceDone(occurrence, occurrence.occurrenceDate);
  const isPast = isPastOccurrence(occurrence);
  const isStrongAlert = occurrence.alertMode === 'strong';
  const strongAccent = isStrongAlert && !occurrenceCompleted && !isPast;
  const timeLeftText = useMemo(() => timeLeftForToday(occurrence), [occurrence]);
  const color = colorForId(occurrence.id, isDark);
  const strongBarColor = strongAccent ? color : `${color}66`;
  const bucket = getTimeBucket(occurrence.time, occurrence.allDay);
  const bucketStyles = getTimeBucketStyles(bucket, tokens, isDark);

  const onEdit = () => {
    if (deleteBusy) return;
    swipeRef.current?.close();
    router.push({
      pathname: '/task/[id]',
      params: { id: occurrence.id },
    });
  };

  const onToggleDone = () => {
    if (toggleBusy || deleteBusy) return;
    setToggleBusy(true);
    void toggleOccurrenceDone(occurrence.id, occurrence.occurrenceDate).finally(() =>
      setToggleBusy(false)
    );
  };

  const onDelete = () => {
    Alert.alert(t.confirmDelete, t.confirmDeleteMessage, [
      { text: t.cancel, style: 'cancel', onPress: () => swipeRef.current?.close() },
      {
        text: t.delete,
        style: 'destructive',
        onPress: () => {
          setDeleteBusy(true);
          void remove(occurrence.id)
            .then(() => swipeRef.current?.close())
            .catch((e) => alertError(e))
            .finally(() => setDeleteBusy(false));
        },
      },
    ]);
  };

  const renderRightActions = (
    _progress: Animated.AnimatedInterpolation<number>,
    _drag: Animated.AnimatedInterpolation<number>
  ) => (
    <Pressable
      onPress={onDelete}
      style={[styles.deleteAction, { backgroundColor: tokens.danger }]}
    >
      <Ionicons name="trash-outline" size={22} color="#fff" />
      <Text style={styles.deleteText}>{t.delete}</Text>
    </Pressable>
  );

  return (
    <GestureHandlerRootView style={styles.swipeWrap}>
      <Swipeable
        ref={(r) => {
          swipeRef.current = r;
        }}
        renderRightActions={renderRightActions}
        rightThreshold={40}
        overshootRight={false}
        enabled={!deleteBusy}
      >
        <View style={styles.rowOuter}>
          <View
            style={[
              styles.row,
              {
                backgroundColor:
                  occurrenceCompleted || isPast ? tokens.surface : bucketStyles.bg,
                borderBottomColor: tokens.border,
                borderLeftWidth: isStrongAlert ? (strongAccent ? 3 : 2) : 0,
                borderLeftColor: isStrongAlert ? strongBarColor : 'transparent',
                opacity: deleteBusy ? 0.55 : isPast || occurrenceCompleted ? 0.55 : 1,
              },
            ]}
          >
            <View style={styles.rowMainHit}>
              <Pressable
                onPress={onToggleDone}
                disabled={toggleBusy || deleteBusy}
                hitSlop={{ top: 10, bottom: 10, left: 4, right: 10 }}
                android_ripple={{ color: tokens.surfaceAlt, borderless: true }}
                style={({ pressed }) => [
                  styles.doneHit,
                  { opacity: pressed && !toggleBusy ? 0.85 : 1 },
                ]}
                accessibilityRole="checkbox"
                accessibilityState={{
                  checked: occurrenceCompleted,
                  disabled: toggleBusy || deleteBusy,
                }}
              >
                <View
                  style={[
                    styles.colorDot,
                    {
                      backgroundColor: occurrenceCompleted ? tokens.surfaceAlt : color,
                      borderColor: color,
                      opacity: toggleBusy ? 0.65 : 1,
                    },
                  ]}
                >
                  {toggleBusy ? (
                    <ActivityIndicator
                      size="small"
                      color={occurrenceCompleted ? color : '#fff'}
                    />
                  ) : occurrenceCompleted ? (
                    <Ionicons name="checkmark" size={14} color={color} />
                  ) : null}
                </View>
              </Pressable>
              <View style={styles.body}>
                <Text
                  numberOfLines={1}
                  style={[
                    styles.title,
                    {
                      color: tokens.text,
                      textDecorationLine: occurrenceCompleted ? 'line-through' : 'none',
                    },
                  ]}
                >
                  {occurrence.title}
                </Text>
                {occurrence.description ? (
                  <Text
                    numberOfLines={2}
                    style={[styles.description, { color: tokens.textMuted }]}
                  >
                    {occurrence.description}
                  </Text>
                ) : null}
                <View style={styles.metaRow}>
                  {showDate ? (
                    <Text style={[styles.meta, { color: tokens.textMuted }]}>
                      {formatShortDate(occurrence.occurrenceDate)}
                    </Text>
                  ) : null}
                  <Text style={[styles.meta, { color: tokens.textMuted }]}>
                    {occurrence.allDay ? 'Dia inteiro' : occurrence.time}
                  </Text>
                  <View
                    style={[
                      styles.badge,
                      {
                        backgroundColor: bucketStyles.badgeBg,
                        borderColor: bucketStyles.border,
                      },
                    ]}
                  >
                    <Text style={[styles.badgeText, { color: bucketStyles.badgeText }]}>
                      {getTimeBucketLabel(bucket)}
                    </Text>
                  </View>
                  {occurrence.tagId ? (
                    <View
                      style={[
                        styles.badge,
                        {
                          backgroundColor: `${taskTagColor(occurrence.tagId, isDark)}22`,
                          borderColor: taskTagColor(occurrence.tagId, isDark),
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.badgeText,
                          { color: taskTagColor(occurrence.tagId, isDark) },
                        ]}
                      >
                        {taskTagLabel(occurrence.tagId)}
                      </Text>
                    </View>
                  ) : null}
                  {timeLeftText ? (
                    <Text style={[styles.meta, { color: tokens.danger }]}>
                      {timeLeftText}
                    </Text>
                  ) : null}
                  {occurrence.isOccurrence ? (
                    <View
                      style={[
                        styles.badge,
                        {
                          backgroundColor: tokens.surfaceAlt,
                          borderColor: tokens.border,
                        },
                      ]}
                    >
                      <Ionicons name="repeat" size={10} color={tokens.textMuted} />
                      <Text style={[styles.badgeText, { color: tokens.textMuted }]}>
                        {t.occurrenceBadge}
                      </Text>
                    </View>
                  ) : null}
                  {occurrence.reminderLeadMinutes !== null ? (
                    <Ionicons
                      name="notifications-outline"
                      size={12}
                      color={tokens.textMuted}
                    />
                  ) : null}
                </View>
              </View>
            </View>
            <Pressable
              onPress={onEdit}
              hitSlop={10}
              disabled={deleteBusy}
              style={({ pressed }) => [
                styles.iconBtn,
                { opacity: deleteBusy ? 0.4 : pressed ? 0.5 : 1 },
              ]}
            >
              <Ionicons name="pencil" size={18} color={tokens.textMuted} />
            </Pressable>
          </View>
          {deleteBusy ? (
            <View
              style={[styles.rowBusyOverlay, { backgroundColor: tokens.overlay }]}
              pointerEvents="none"
            >
              <ActivityIndicator size="small" color={tokens.primary} />
            </View>
          ) : null}
        </View>
      </Swipeable>
    </GestureHandlerRootView>
  );
}

function isPastOccurrence(o: TaskOccurrence): boolean {
  const now = new Date();
  const d = parseISODate(o.occurrenceDate);
  if (o.allDay) {
    const todayStr = formatDateISOLocal(now);
    return o.occurrenceDate < todayStr;
  }
  const [h, m] = o.time.split(':').map(Number);
  d.setHours(h ?? 0, m ?? 0, 0, 0);
  return d.getTime() < now.getTime();
}

function timeLeftForToday(o: TaskOccurrence): string | null {
  if (isOccurrenceDone(o, o.occurrenceDate) || o.allDay) return null;
  const todayStr = formatDateISOLocal(new Date());
  if (o.occurrenceDate !== todayStr) return null;

  const now = new Date();
  const target = parseISODate(o.occurrenceDate);
  const [h, m] = o.time.split(':').map(Number);
  target.setHours(h ?? 0, m ?? 0, 0, 0);

  const diffMs = target.getTime() - now.getTime();
  if (diffMs <= 0) return null;

  const totalMinutes = Math.ceil(diffMs / 60_000);
  return formatTaskCountdown(totalMinutes);
}
