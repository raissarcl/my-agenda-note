import { Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../theme';
import { pressOpacity } from './pressable';

type Props = {
  disabled?: boolean;
};

export function SettingsHeaderButton({ disabled = false }: Props) {
  const { tokens } = useTheme();
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push('/settings')}
      hitSlop={12}
      disabled={disabled}
      style={({ pressed }) => ({
        paddingHorizontal: 12,
        opacity: pressOpacity(disabled, pressed, 1, 0.5),
      })}
    >
      <Ionicons name="settings-outline" size={22} color={tokens.text} />
    </Pressable>
  );
}
