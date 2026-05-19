import { Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme';
import { t } from '../lib/i18n';

type Props = {
  active: boolean;
  onPress: () => void;
  disabled?: boolean;
};

export function HideCompletedToggle({ active, onPress, disabled }: Props) {
  const { tokens } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={10}
      accessibilityRole="button"
      accessibilityLabel={
        active ? t.showCompletedOccurrences : t.hideCompletedOccurrences
      }
      accessibilityState={{ selected: active, disabled: !!disabled }}
      style={({ pressed }) => [
        styles.btn,
        {
          backgroundColor: active ? tokens.primary : tokens.surfaceAlt,
          borderColor: active ? tokens.primary : tokens.border,
          opacity: disabled ? 0.4 : pressed ? 0.7 : 1,
        },
      ]}
    >
      <Ionicons
        name={active ? 'eye-off-outline' : 'eye-outline'}
        size={20}
        color={active ? tokens.primaryText : tokens.textMuted}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
