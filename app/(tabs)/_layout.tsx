import { Tabs, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Pressable } from 'react-native';
import { useTheme } from '../../src/theme';
import { t } from '../../src/lib/i18n';

export default function TabsLayout() {
  const { tokens } = useTheme();
  const router = useRouter();

  const headerRight = () => (
    <Pressable
      onPress={() => router.push('/settings')}
      hitSlop={12}
      style={({ pressed }) => ({
        paddingHorizontal: 12,
        opacity: pressed ? 0.5 : 1,
      })}
    >
      <Ionicons name="settings-outline" size={22} color={tokens.text} />
    </Pressable>
  );

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: tokens.bg },
        headerTitleStyle: { color: tokens.text, fontWeight: '600' },
        headerTintColor: tokens.text,
        headerShadowVisible: false,
        tabBarStyle: {
          backgroundColor: tokens.bg,
          borderTopColor: tokens.border,
        },
        tabBarActiveTintColor: tokens.primary,
        tabBarInactiveTintColor: tokens.textMuted,
        sceneStyle: { backgroundColor: tokens.bg },
        headerRight,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t.tabCalendar,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="list"
        options={{
          title: t.tabList,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="quick"
        options={{
          title: t.tabQuickReminders,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="clipboard-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="notes"
        options={{
          title: t.tabNotes,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="document-text-outline" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
