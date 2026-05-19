import { useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../../../../theme';
import { useTasksStore } from '../../../../store/tasks';
import { useSettingsStore } from '../../../../store/settings';
import { useNewTaskDraftStore } from '../../../../store/newTaskDraft';
import { t } from '../../../../lib/i18n';
import { isOccurrenceDone } from '../../../../lib/taskCompletion';
import {
  clampRecurrenceEndToBounds,
  defaultRecurrenceEndISO,
  maxRecurrenceEndISO,
} from '../../../../lib/recurrenceBounds';
import {
  combineDateTime,
  defaultNewTaskTime,
  parseISODate,
  todayISO,
} from '../../../../lib/format';
import type { AlertMode, Recurrence, Task, TaskTagId } from '../../../../types';
import type { TaskEditorProps } from './types';
import { taskEditorSwitchColors } from './taskEditorSwitch';

export function useTaskEditorState({ mode, onClose }: TaskEditorProps) {
  const { tokens, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const tasks = useTasksStore((s) => s.tasks);
  const create = useTasksStore((s) => s.create);
  const update = useTasksStore((s) => s.update);
  const remove = useTasksStore((s) => s.remove);
  const defaultLead = useSettingsStore((s) => s.settings.defaultReminderLeadMinutes);
  const draft = useNewTaskDraftStore((s) => s.draft);
  const hasDraft = useNewTaskDraftStore((s) => s.hasDraft);
  const setDraft = useNewTaskDraftStore((s) => s.setDraft);
  const clearDraft = useNewTaskDraftStore((s) => s.clearDraft);

  const existing =
    mode.kind === 'edit' ? tasks.find((task) => task.id === mode.taskId) ?? null : null;

  const initialAllDay =
    existing?.allDay ?? (mode.kind === 'new' && hasDraft ? draft.allDay : false);

  const [title, setTitle] = useState(
    existing?.title ?? (mode.kind === 'new' && hasDraft ? draft.title : '')
  );
  const [description, setDescription] = useState(
    existing?.description ?? (mode.kind === 'new' && hasDraft ? draft.description : '')
  );
  const [date, setDate] = useState(() => {
    if (existing?.date) return existing.date;
    if (mode.kind !== 'new') return todayISO();
    const fromRoute =
      typeof mode.initialDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(mode.initialDate)
        ? mode.initialDate
        : undefined;
    if (fromRoute) return fromRoute;
    if (hasDraft) return draft.date;
    return todayISO();
  });
  const [time, setTime] = useState(
    existing?.time ?? (mode.kind === 'new' && hasDraft ? draft.time : defaultNewTaskTime())
  );
  const [allDay, setAllDay] = useState(initialAllDay);
  const [recurrence, setRecurrence] = useState<Recurrence>(
    existing?.recurrence ?? (mode.kind === 'new' && hasDraft ? draft.recurrence : 'none')
  );
  const [recurrenceEnd, setRecurrenceEnd] = useState<string | undefined>(
    existing?.recurrenceEnd ?? (mode.kind === 'new' && hasDraft ? draft.recurrenceEnd : undefined)
  );
  const [reminderLead, setReminderLead] = useState<number | null>(
    initialAllDay
      ? null
      : existing
        ? existing.reminderLeadMinutes
        : mode.kind === 'new' && hasDraft
          ? draft.reminderLeadMinutes
          : defaultLead
  );
  const [done, setDone] = useState(
    existing
      ? isOccurrenceDone(existing, existing.date)
      : mode.kind === 'new' && hasDraft
        ? draft.done
        : false
  );
  const [notificationsPaused, setNotificationsPaused] = useState(
    existing?.notificationsPaused ??
      (mode.kind === 'new' && hasDraft ? draft.notificationsPaused : false)
  );
  const [notificationsPausedUntil, setNotificationsPausedUntil] = useState<string | null>(
    existing?.notificationsPausedUntil ??
      (mode.kind === 'new' && hasDraft ? draft.notificationsPausedUntil : null) ??
      null
  );
  const [customWeekdays, setCustomWeekdays] = useState<number[]>(
    existing?.customWeekdays ??
      (mode.kind === 'new' && hasDraft ? draft.customWeekdays : []) ??
      []
  );
  const [alertMode, setAlertMode] = useState<AlertMode>(
    initialAllDay
      ? 'normal'
      : existing?.alertMode ?? (mode.kind === 'new' && hasDraft ? draft.alertMode : 'normal')
  );
  const [tagId, setTagId] = useState<TaskTagId | null>(
    existing?.tagId ?? (mode.kind === 'new' && hasDraft ? draft.tagId : null)
  );

  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);
  const [showRecEnd, setShowRecEnd] = useState(false);
  const [showPauseUntilPick, setShowPauseUntilPick] = useState(false);
  const [busy, setBusy] = useState(false);
  const [saveInFlight, setSaveInFlight] = useState(false);

  const switchColors = taskEditorSwitchColors(tokens, isDark);

  useEffect(() => {
    if (mode.kind === 'edit' && !existing) onClose();
  }, [mode, existing, onClose]);

  useEffect(() => {
    if (mode.kind !== 'edit' || !existing || existing.recurrence === 'none') return;
    setDone(isOccurrenceDone(existing, date));
  }, [mode.kind, existing, date]);

  useEffect(() => {
    if (!busy) return;
    setShowDate(false);
    setShowTime(false);
    setShowRecEnd(false);
    setShowPauseUntilPick(false);
  }, [busy]);

  useEffect(() => {
    if (mode.kind !== 'new') return;
    setDraft({
      title,
      description,
      date,
      time,
      allDay,
      recurrence,
      recurrenceEnd,
      reminderLeadMinutes: reminderLead,
      alertMode,
      done,
      notificationsPaused,
      notificationsPausedUntil,
      customWeekdays,
      tagId,
    });
  }, [
    mode.kind,
    title,
    description,
    date,
    time,
    allDay,
    recurrence,
    recurrenceEnd,
    reminderLead,
    alertMode,
    done,
    notificationsPaused,
    notificationsPausedUntil,
    customWeekdays,
    tagId,
    setDraft,
  ]);

  useEffect(() => {
    if (allDay || recurrence === 'none') return;
    setRecurrenceEnd((prev) =>
      clampRecurrenceEndToBounds(date, prev ?? defaultRecurrenceEndISO(date))
    );
  }, [date, recurrence, allDay]);

  const validation = useMemo(() => {
    if (!title.trim()) return t.validationTitle;
    if (recurrence !== 'none') {
      if (!recurrenceEnd) return t.validationRecurrenceEndRequired;
      if (recurrenceEnd < date) return t.validationEndDate;
      if (recurrenceEnd > maxRecurrenceEndISO(date)) return t.validationRecurrenceEndMax;
    }
    if (recurrence === 'custom' && customWeekdays.length === 0) {
      return t.validationCustomWeekdays;
    }
    return null;
  }, [title, recurrenceEnd, date, recurrence, customWeekdays.length]);

  const isPastSelection = useMemo(() => {
    if (done) return false;
    const now = new Date();
    if (allDay) return date < todayISO();
    return combineDateTime(date, time).getTime() < now.getTime();
  }, [allDay, date, time, done]);

  const buildPayload = (): Omit<
    Task,
    'id' | 'color' | 'notificationIds' | 'createdAt' | 'updatedAt'
  > => {
    const sortedWeekdays =
      recurrence === 'custom'
        ? [...new Set(customWeekdays.filter((n) => n >= 0 && n <= 6))].sort((a, b) => a - b)
        : [];
    const completedForSave = (() => {
      if (recurrence === 'none') return done ? [date] : [];
      if (!existing) return [] as string[];
      const s = new Set(existing.completedOccurrenceDates);
      if (existing.date !== date) s.delete(existing.date);
      if (done) s.add(date);
      else s.delete(date);
      return [...s].sort();
    })();
    const recurrenceEndValue =
      recurrence === 'none'
        ? undefined
        : clampRecurrenceEndToBounds(date, recurrenceEnd ?? defaultRecurrenceEndISO(date));

    return {
      title: title.trim(),
      description: description.trim() || undefined,
      date,
      time: allDay ? '09:00' : time,
      allDay,
      recurrence,
      recurrenceEnd: recurrenceEndValue,
      reminderLeadMinutes: allDay ? null : reminderLead,
      alertMode: allDay ? 'normal' : alertMode,
      done: recurrence === 'none' ? done : false,
      completedOccurrenceDates:
        mode.kind === 'edit'
          ? completedForSave
          : recurrence === 'none'
            ? done
              ? [date]
              : []
            : [],
      notificationsPaused,
      notificationsPausedUntil: notificationsPaused ? notificationsPausedUntil : null,
      customWeekdays: recurrence === 'custom' ? sortedWeekdays : [],
      tagId,
    };
  };

  const persistTask = async () => {
    const payload = buildPayload();
    setBusy(true);
    setSaveInFlight(true);
    try {
      if (mode.kind === 'new') await create(payload);
      else if (existing) await update(existing.id, payload);
    } catch (error) {
      setBusy(false);
      setSaveInFlight(false);
      Alert.alert('Erro ao salvar', String(error));
      return;
    }
    setBusy(false);
    setSaveInFlight(false);
    onClose();
    if (mode.kind === 'new') queueMicrotask(() => clearDraft());
  };

  const onSave = async () => {
    if (validation) {
      Alert.alert(validation);
      return;
    }
    if (isPastSelection) {
      Alert.alert(t.validationPastTitle, t.validationPastMessage, [
        { text: t.cancel, style: 'cancel' },
        { text: t.validationPastContinue, onPress: () => void persistTask() },
      ]);
      return;
    }
    try {
      await persistTask();
    } catch (error) {
      Alert.alert('Erro ao salvar', String(error));
    }
  };

  const onDelete = () => {
    if (mode.kind !== 'edit' || !existing) return;
    Alert.alert(t.confirmDelete, t.confirmDeleteMessage, [
      { text: t.cancel, style: 'cancel' },
      {
        text: t.delete,
        style: 'destructive',
        onPress: () => {
          void (async () => {
            setBusy(true);
            try {
              await remove(existing.id);
            } catch (error) {
              setBusy(false);
              Alert.alert('Erro ao excluir', String(error));
              return;
            }
            setBusy(false);
            onClose();
          })();
        },
      },
    ]);
  };

  const onDuplicate = async () => {
    if (mode.kind !== 'edit' || !existing) return;
    const payload = {
      title: `${existing.title} (cópia)`,
      description: existing.description,
      date: existing.date,
      time: existing.allDay ? '09:00' : existing.time,
      allDay: existing.allDay,
      recurrence: existing.recurrence,
      recurrenceEnd:
        existing.recurrence === 'none'
          ? undefined
          : clampRecurrenceEndToBounds(
              existing.date,
              existing.recurrenceEnd ?? defaultRecurrenceEndISO(existing.date)
            ),
      reminderLeadMinutes: existing.allDay ? null : existing.reminderLeadMinutes,
      alertMode: existing.allDay ? 'normal' : existing.alertMode,
      done: false,
      completedOccurrenceDates: [] as string[],
      notificationsPaused: false,
      notificationsPausedUntil: null,
      customWeekdays:
        existing.recurrence === 'custom' ? [...existing.customWeekdays] : [],
      tagId: existing.tagId,
    };
    setBusy(true);
    setSaveInFlight(false);
    try {
      await create(payload);
    } catch (error) {
      setBusy(false);
      Alert.alert('Erro ao duplicar', String(error));
      return;
    }
    setBusy(false);
    onClose();
  };

  const onClear = () => {
    setTitle('');
    setDescription('');
    setDate(mode.kind === 'new' ? mode.initialDate ?? todayISO() : todayISO());
    setTime(defaultNewTaskTime());
    setAllDay(false);
    setRecurrence('none');
    setRecurrenceEnd(undefined);
    setReminderLead(defaultLead);
    setAlertMode('normal');
    setDone(false);
    setNotificationsPaused(false);
    setNotificationsPausedUntil(null);
    setCustomWeekdays([]);
    setTagId(null);
    clearDraft();
  };

  const dateAsObj = parseISODate(date);
  const timeAsObj = (() => {
    const [h, m] = time.split(':').map(Number);
    const d = new Date();
    d.setHours(h ?? 0, m ?? 0, 0, 0);
    return d;
  })();

  return {
    mode,
    existing,
    tokens,
    insets,
    busy,
    saveInFlight,
    switchColors,
    defaultLead,
    title,
    setTitle,
    description,
    setDescription,
    allDay,
    setAllDay,
    date,
    setDate,
    time,
    setTime,
    recurrence,
    setRecurrence,
    recurrenceEnd,
    setRecurrenceEnd,
    reminderLead,
    setReminderLead,
    alertMode,
    setAlertMode,
    done,
    setDone,
    notificationsPaused,
    setNotificationsPaused,
    notificationsPausedUntil,
    setNotificationsPausedUntil,
    customWeekdays,
    setCustomWeekdays,
    tagId,
    setTagId,
    showDate,
    setShowDate,
    showTime,
    setShowTime,
    showRecEnd,
    setShowRecEnd,
    showPauseUntilPick,
    setShowPauseUntilPick,
    validation,
    isPastSelection,
    dateAsObj,
    timeAsObj,
    onSave,
    onDelete,
    onDuplicate,
    onClear,
    onClose,
  };
}

export type TaskEditorState = ReturnType<typeof useTaskEditorState>;
