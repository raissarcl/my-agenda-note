import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme';

type Props = {
  message: string;
  icon?: keyof typeof Ionicons.glyphMap;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({
  message,
  icon = 'calendar-outline',
  actionLabel,
  onAction,
}: Props) {
  const { tokens } = useTheme();
  return (
    <View style={styles.wrap}>
      <Ionicons name={icon} size={48} color={tokens.textFaint} />
      <Text style={[styles.text, { color: tokens.textMuted }]}>{message}</Text>
      {actionLabel && onAction ? (
        <Pressable
          onPress={onAction}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          style={({ pressed }) => [
            styles.actionBtn,
            {
              borderColor: tokens.primary,
              backgroundColor: tokens.surfaceAlt,
              opacity: pressed ? 0.75 : 1,
            },
          ]}
        >
          <Text style={[styles.actionText, { color: tokens.primary }]}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingVertical: 48,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  text: {
    fontSize: 15,
    textAlign: 'center',
  },
  actionBtn: {
    marginTop: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
