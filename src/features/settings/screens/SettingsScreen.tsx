import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Switch,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

import { useTheme } from '../../../theme';
import { useThemedStyles } from '../../../hooks/useThemedStyles';
import { useSettingsStore } from '../../../store/settings';
import { useTasksStore } from '../../../store/tasks';
import { exportBackup, importBackup } from '../../../lib/backup';
import {
  alertError,
  formatLastBackupLabel,
  notificationLeadLabel,
  t,
} from '../../../lib/i18n';
import { ensureAndroidChannel, requestPermissionIfNeeded } from '../../../lib/notifications';
import {
  BACKUP_REMINDER_INTERVAL_OPTIONS,
  NOTIFICATION_LEAD_VALUES,
  type ThemeMode,
} from '../../../types';
import { SettingsSection } from '../components/SettingsSection';
import { createSettingsScreenStyles } from '../styles/settingsScreen.styles';

const THEME_OPTIONS: Array<{
  value: ThemeMode;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}> = [
  { value: 'system', label: t.themeSystem, icon: 'phone-portrait-outline' },
  { value: 'light', label: t.themeLight, icon: 'sunny-outline' },
  { value: 'dark', label: t.themeDark, icon: 'moon-outline' },
];

export function SettingsScreen() {
  const { tokens } = useTheme();
  const styles = useThemedStyles(createSettingsScreenStyles);
  const settings = useSettingsStore((s) => s.settings);
  const update = useSettingsStore((s) => s.update);
  const taskCount = useTasksStore((s) => s.tasks.length);

  const [busy, setBusy] = useState<'export' | 'import' | 'test' | null>(null);
  const appVersion = Constants.expoConfig?.version ?? '1.0.0';

  const onExport = async () => {
    try {
      setBusy('export');
      const res = await exportBackup();
      if (!res.shared) {
        Alert.alert(t.exportSuccess);
      }
    } catch (e) {
      alertError(e);
    } finally {
      setBusy(null);
    }
  };

  const onToggleBackupReminder = async (enabled: boolean) => {
    if (enabled) {
      const granted = await requestPermissionIfNeeded();
      if (!granted) {
        Alert.alert(t.permissionDenied);
        return;
      }
      await ensureAndroidChannel();
    }
    try {
      await update({ backupReminderEnabled: enabled });
    } catch (e) {
      alertError(e);
    }
  };

  const onImport = () => {
    Alert.alert(t.importMode, undefined, [
      { text: t.cancel, style: 'cancel' },
      { text: t.importMerge, onPress: () => void doImport('merge') },
      { text: t.importReplace, style: 'destructive', onPress: () => void doImport('replace') },
    ]);
  };

  const doImport = async (mode: 'merge' | 'replace') => {
    try {
      setBusy('import');
      const res = await importBackup(mode);
      if (res.ok) {
        Alert.alert(
          t.importSuccess,
          t.importSuccessCounts
            .replace('{tasks}', String(res.tasksAdded))
            .replace('{notes}', String(res.notesAdded))
            .replace('{quick}', String(res.quickAdded))
        );
      } else if (res.reason !== 'cancelled') {
        Alert.alert(t.importInvalid);
      }
    } catch (e) {
      alertError(e);
    } finally {
      setBusy(null);
    }
  };

  const onTestNotification = async () => {
    try {
      setBusy('test');
      const granted = await requestPermissionIfNeeded();
      if (!granted) {
        Alert.alert(t.permissionDenied);
        return;
      }
      await ensureAndroidChannel();
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Teste MyAgenda',
          body: 'Funcionou!',
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.MAX,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 10,
          channelId: 'mycalendar-alerts-v2',
        } as Notifications.TimeIntervalTriggerInput,
      });
      Alert.alert(t.testNotificationDone);
    } catch (e) {
      alertError(e);
    } finally {
      setBusy(null);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: tokens.bg }}>
      <ScrollView
        style={{ flex: 1, backgroundColor: tokens.bg }}
        contentContainerStyle={styles.scroll}
      >
        <SettingsSection title={t.theme}>
          <View style={styles.chipRow}>
            {THEME_OPTIONS.map((opt) => {
              const active = settings.theme === opt.value;
              return (
                <Pressable
                  key={opt.value}
                  onPress={() => update({ theme: opt.value })}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: active ? tokens.primary : tokens.surfaceAlt,
                      borderColor: active ? tokens.primary : tokens.border,
                    },
                  ]}
                >
                  <Ionicons
                    name={opt.icon}
                    size={16}
                    color={active ? tokens.primaryText : tokens.text}
                  />
                  <Text
                    style={{
                      color: active ? tokens.primaryText : tokens.text,
                      fontSize: 13,
                      fontWeight: active ? '600' : '500',
                    }}
                  >
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </SettingsSection>

        <SettingsSection title={t.defaultNotification}>
          <View style={styles.chipRow}>
            {NOTIFICATION_LEAD_VALUES.map((value) => {
              const active = settings.defaultReminderLeadMinutes === value;
              return (
                <Pressable
                  key={String(value)}
                  onPress={() => update({ defaultReminderLeadMinutes: value })}
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
        </SettingsSection>

        <SettingsSection title={t.data} subtitle={t.backupDataHint}>
          <View style={{ gap: 8 }}>
            <Text style={styles.hint}>{formatLastBackupLabel(settings.lastExportAt)}</Text>
            <View
              style={[
                styles.settingRow,
                {
                  borderColor: tokens.border,
                  backgroundColor: tokens.surfaceAlt,
                },
              ]}
            >
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={[styles.settingRowTitle, { color: tokens.text }]}>
                  {t.backupReminder}
                </Text>
                <Text style={styles.hint}>{t.backupReminderHint}</Text>
              </View>
              <Switch
                value={settings.backupReminderEnabled}
                onValueChange={(v) => void onToggleBackupReminder(v)}
                disabled={busy !== null}
              />
            </View>
            {settings.backupReminderEnabled ? (
              <View style={{ gap: 6 }}>
                <Text style={[styles.hint, { marginTop: 0 }]}>
                  {t.backupReminderInterval}
                </Text>
                <View style={styles.chipRow}>
                  {BACKUP_REMINDER_INTERVAL_OPTIONS.map((days) => {
                    const active = settings.backupReminderIntervalDays === days;
                    return (
                      <Pressable
                        key={days}
                        onPress={() =>
                          void update({ backupReminderIntervalDays: days })
                        }
                        disabled={busy !== null}
                        style={[
                          styles.chip,
                          {
                            backgroundColor: active
                              ? tokens.primary
                              : tokens.surfaceAlt,
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
                          {days}d
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ) : null}
            <Pressable
              onPress={() => void onExport()}
              disabled={busy !== null}
              style={({ pressed }) => [
                styles.bigBtn,
                { opacity: pressed || busy ? 0.7 : 1 },
              ]}
            >
              <Ionicons name="download-outline" size={20} color={tokens.text} />
              <Text style={styles.bigBtnText}>{t.exportJson}</Text>
            </Pressable>
            <Pressable
              onPress={onImport}
              disabled={busy !== null}
              style={({ pressed }) => [
                styles.bigBtn,
                { opacity: pressed || busy ? 0.7 : 1 },
              ]}
            >
              <Ionicons name="cloud-upload-outline" size={20} color={tokens.text} />
              <Text style={styles.bigBtnText}>{t.importJson}</Text>
            </Pressable>
            <Pressable
              onPress={() => void onTestNotification()}
              disabled={busy !== null}
              style={({ pressed }) => [
                styles.bigBtn,
                { opacity: pressed || busy ? 0.7 : 1 },
              ]}
            >
              <Ionicons name="notifications-outline" size={20} color={tokens.text} />
              <Text style={styles.bigBtnText}>{t.testNotification}</Text>
            </Pressable>
            <Text style={styles.hint}>
              {taskCount} {taskCount === 1 ? 'tarefa salva' : 'tarefas salvas'}.
            </Text>
            <Text style={styles.hint}>
              {t.appVersion}: {t.appName} v{appVersion}
            </Text>
          </View>
        </SettingsSection>
      </ScrollView>
      {busy !== null ? (
        <View
          style={[styles.busyOverlay, { backgroundColor: tokens.overlay }]}
          pointerEvents="auto"
        >
          <ActivityIndicator size="large" color={tokens.primary} />
        </View>
      ) : null}
    </View>
  );
}
