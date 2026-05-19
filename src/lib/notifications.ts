import * as Notifications from 'expo-notifications';
import { format } from 'date-fns';
import { Platform } from 'react-native';
import type { Task } from '../types';
import { combineDateTime, formatDateISOLocal } from './format';
import { notificationStrongFollowupBody, t } from './i18n';
import { nextOccurrencesForScheduling } from './recurrence';
import { isOccurrenceDone } from './taskCompletion';

const MAX_SCHEDULED_PER_TASK = 732;
const CHANNEL_NORMAL_ID = 'mycalendar-alerts-normal-v1';
const CHANNEL_STRONG_ID = 'mycalendar-alerts-strong-v2';
const STRONG_FOLLOWUP_MINUTES = 10;

let configured = false;

export function configureNotificationHandler() {
  if (configured) return;
  configured = true;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export async function ensureAndroidChannel() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CHANNEL_NORMAL_ID, {
    name: 'Notificações',
    importance: Notifications.AndroidImportance.MAX,
    sound: 'default',
    enableVibrate: true,
    vibrationPattern: [0, 220, 180, 220],
    lightColor: '#3b82f6',
  });
  await Notifications.setNotificationChannelAsync(CHANNEL_STRONG_ID, {
    name: 'Notificações fortes',
    importance: Notifications.AndroidImportance.MAX,
    sound: 'default',
    enableVibrate: true,
    vibrationPattern: [0, 650, 200, 650, 200, 650, 250, 900],
    lightColor: '#ef4444',
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
  });
}

export async function requestPermissionIfNeeded(): Promise<boolean> {
  const settings = await Notifications.getPermissionsAsync();
  if (settings.granted) {
    return true;
  }
  if (!settings.canAskAgain) return false;
  const req = await Notifications.requestPermissionsAsync({
    android: {},
  });
  return req.granted;
}

export function notificationsSuppressedForTask(task: Task, todayISO: string): boolean {
  if (!task.notificationsPaused) return false;
  const until = task.notificationsPausedUntil;
  if (until == null || until === '') return true;
  return todayISO <= until;
}

export function stripExpiredNotificationPauses(tasks: Task[], todayISO: string): Task[] {
  let changed = false;
  const out = tasks.map((t) => {
    if (
      t.notificationsPaused &&
      t.notificationsPausedUntil != null &&
      t.notificationsPausedUntil !== '' &&
      todayISO > t.notificationsPausedUntil
    ) {
      changed = true;
      return {
        ...t,
        notificationsPaused: false,
        notificationsPausedUntil: null,
      };
    }
    return t;
  });
  return changed ? out : tasks;
}

function reminderInstantFor(task: Task, occurrenceDate: Date): Date {
  const dateISO = format(occurrenceDate, 'yyyy-MM-dd');
  const time = task.allDay ? '09:00' : task.time;
  const base = combineDateTime(dateISO, time);
  const lead = task.reminderLeadMinutes ?? 0;
  return new Date(base.getTime() - lead * 60_000);
}

export async function scheduleTaskNotifications(task: Task): Promise<string[]> {
  const todayISO = formatDateISOLocal(new Date());
  if (
    task.reminderLeadMinutes === null ||
    notificationsSuppressedForTask(task, todayISO)
  ) {
    return [];
  }
  if (task.done) return [];

  const granted = await requestPermissionIfNeeded();
  if (!granted) return [];
  await ensureAndroidChannel();

  const now = new Date();
  const occurrences = nextOccurrencesForScheduling(
    task,
    now,
    MAX_SCHEDULED_PER_TASK
  );

  const ids: string[] = [];
  const isStrong = task.alertMode === 'strong';
  const channelId = isStrong ? CHANNEL_STRONG_ID : CHANNEL_NORMAL_ID;
  for (const occ of occurrences) {
    const occurrenceDate = format(occ, 'yyyy-MM-dd');
    if (isOccurrenceDone(task, occurrenceDate)) continue;

    const fireAt = reminderInstantFor(task, occ);
    const fireSoonEnough = fireAt.getTime() > now.getTime() + 1000;

    if (fireSoonEnough) {
      try {
        const id = await Notifications.scheduleNotificationAsync({
          content: {
            title: task.title,
            body: task.allDay
              ? 'Hoje'
              : `${occurrenceDate} às ${task.time}`,
            data: { taskId: task.id, occurrenceDate },
            sound: 'default',
            priority: Notifications.AndroidNotificationPriority.MAX,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: fireAt,
            channelId,
          } as Notifications.DateTriggerInput,
        });
        ids.push(id);

        if (isStrong) {
          const repeatAt = new Date(
            fireAt.getTime() + STRONG_FOLLOWUP_MINUTES * 60_000
          );
          if (repeatAt.getTime() > now.getTime() + 1000) {
            try {
              const repeatId = await Notifications.scheduleNotificationAsync({
                content: {
                  title: t.notificationStrongFollowupTitle,
                  body: notificationStrongFollowupBody(
                    task.title,
                    STRONG_FOLLOWUP_MINUTES
                  ),
                  data: {
                    taskId: task.id,
                    occurrenceDate,
                    followupMinutes: STRONG_FOLLOWUP_MINUTES,
                  },
                  sound: 'default',
                  priority: Notifications.AndroidNotificationPriority.MAX,
                },
                trigger: {
                  type: Notifications.SchedulableTriggerInputTypes.DATE,
                  date: repeatAt,
                  channelId,
                } as Notifications.DateTriggerInput,
              });
              ids.push(repeatId);
            } catch {}
          }
        }
      } catch {}
      continue;
    }
  }
  return ids;
}

async function cancelScheduledNotificationsMatchingTaskId(taskId: string): Promise<void> {
  try {
    const all = await Notifications.getAllScheduledNotificationsAsync();
    for (const req of all) {
      const data = req.content.data as Record<string, unknown> | undefined;
      if (data && data.taskId === taskId) {
        try {
          await Notifications.cancelScheduledNotificationAsync(req.identifier);
        } catch {}
      }
    }
  } catch {}
}

export async function cancelTaskNotifications(task: Task): Promise<void> {
  await cancelScheduledNotificationsMatchingTaskId(task.id);
  for (const id of task.notificationIds) {
    try {
      await Notifications.cancelScheduledNotificationAsync(id);
    } catch {}
  }
}

export async function cancelAllNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {}
}
