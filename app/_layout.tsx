import { useEffect, useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  View,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Stack, useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppState } from 'react-native';

import { useSettingsStore } from '../src/store/settings';
import { useTasksStore } from '../src/store/tasks';
import { useTheme } from '../src/theme';
import { configureLocale, t } from '../src/lib/i18n';
import {
  configureNotificationHandler,
  ensureAndroidChannel,
  isBackupReminderNotificationData,
  requestPermissionIfNeeded,
  syncBackupReminderFromSettings,
  syncQuickReminderNotifications,
} from '../src/lib/notifications';
import { syncAndroidWidgets } from '../src/lib/homeScreenWidget';
import {
  loadQuickReminders,
  saveAllQuickReminders,
} from '../src/lib/quickReminders';
import { NoteMovePickerProvider } from '../src/features/notes/components/NoteMovePickerProvider';

configureLocale();
configureNotificationHandler();

export default function RootLayout() {
  const [bootReady, setBootReady] = useState(false);
  const router = useRouter();
  const hydrateSettings = useSettingsStore((s) => s.hydrate);
  const hydrateTasks = useTasksStore((s) => s.hydrate);
  const rescheduleAll = useTasksStore((s) => s.rescheduleAll);
  const tasks = useTasksStore((s) => s.tasks);
  const tasksHydrated = useTasksStore((s) => s.hydrated);
  const settingsHydrated = useSettingsStore((s) => s.hydrated);

  useEffect(() => {
    void (async () => {
      try {
        await hydrateSettings();
        await hydrateTasks();
        await ensureAndroidChannel();
        await requestPermissionIfNeeded();
        await rescheduleAll();
        await syncBackupReminderFromSettings();
        const quick = await loadQuickReminders();
        const quickSynced = await syncQuickReminderNotifications(quick);
        if (JSON.stringify(quickSynced) !== JSON.stringify(quick)) {
          await saveAllQuickReminders(quickSynced);
        }
      } finally {
        setBootReady(true);
      }
    })();
  }, [hydrateSettings, hydrateTasks, rescheduleAll]);

  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data as
          | Record<string, unknown>
          | undefined;
        if (isBackupReminderNotificationData(data)) {
          router.push('/settings');
        }
      }
    );
    return () => sub.remove();
  }, [router]);

  useEffect(() => {
    if (!tasksHydrated || !settingsHydrated) return;
    void syncAndroidWidgets(tasks);
  }, [tasksHydrated, settingsHydrated, tasks]);

  useEffect(() => {
    if (!tasksHydrated || !settingsHydrated) return;
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        void rescheduleAll();
        void syncBackupReminderFromSettings();
        void syncAndroidWidgets(tasks);
      }
    });
    return () => sub.remove();
  }, [tasksHydrated, settingsHydrated, rescheduleAll, tasks]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NoteMovePickerProvider>
          <BootLoadingGate ready={bootReady}>
            <ThemedStack />
          </BootLoadingGate>
        </NoteMovePickerProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function BootLoadingGate({
  ready,
  children,
}: {
  ready: boolean;
  children: ReactNode;
}) {
  const { tokens } = useTheme();
  if (ready) return <>{children}</>;
  return (
    <View style={[styles.bootRoot, { backgroundColor: tokens.bg }]}>
      <ActivityIndicator size="large" color={tokens.primary} />
    </View>
  );
}

function ThemedStack() {
  const { tokens, isDark } = useTheme();
  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: tokens.bg },
          headerStyle: { backgroundColor: tokens.bg },
          headerTitleStyle: { color: tokens.text },
          headerTintColor: tokens.text,
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="task/new"
          options={{
            presentation: 'modal',
            title: t.newTask,
          }}
        />
        <Stack.Screen
          name="task/[id]"
          options={{
            presentation: 'modal',
            title: t.editTask,
          }}
        />
        <Stack.Screen
          name="note/new"
          options={{
            presentation: 'modal',
            title: t.newNote,
          }}
        />
        <Stack.Screen
          name="note/[id]"
          options={{
            presentation: 'modal',
            title: t.editNote,
          }}
        />
        <Stack.Screen
          name="notebook/new"
          options={{
            presentation: 'modal',
            title: t.newNotebook,
          }}
        />
        <Stack.Screen
          name="notebook/[id]"
          options={{
            title: t.notebooksSection,
          }}
        />
        <Stack.Screen
          name="notebook/delete"
          options={{
            presentation: 'modal',
            title: t.notebookDeleteTitle,
          }}
        />
        <Stack.Screen
          name="settings"
          options={{
            presentation: 'modal',
            title: t.settings,
          }}
        />
      </Stack>
    </>
  );
}

const styles = StyleSheet.create({
  bootRoot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
