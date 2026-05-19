import { useEffect, useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  View,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Stack } from 'expo-router';
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
  requestPermissionIfNeeded,
} from '../src/lib/notifications';
import { syncAndroidWidgets } from '../src/lib/homeScreenWidget';

configureLocale();
configureNotificationHandler();

export default function RootLayout() {
  const [bootReady, setBootReady] = useState(false);
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
      } finally {
        setBootReady(true);
      }
    })();
  }, [hydrateSettings, hydrateTasks, rescheduleAll]);

  useEffect(() => {
    if (!tasksHydrated || !settingsHydrated) return;
    void syncAndroidWidgets(tasks);
  }, [tasksHydrated, settingsHydrated, tasks]);

  useEffect(() => {
    if (!tasksHydrated || !settingsHydrated) return;
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        void rescheduleAll();
        void syncAndroidWidgets(tasks);
      }
    });
    return () => sub.remove();
  }, [tasksHydrated, settingsHydrated, rescheduleAll, tasks]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <BootLoadingGate ready={bootReady}>
          <ThemedStack />
        </BootLoadingGate>
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
