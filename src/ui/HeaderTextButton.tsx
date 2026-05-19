import { Pressable, Text } from 'react-native';

import { useThemedStyles } from '../hooks/useThemedStyles';
import { pressOpacity } from './pressable';
import { createHeaderTextButtonStyles } from './headerTextButton.styles';

type Props = {
  label: string;
  variant?: 'primary' | 'danger';
  disabled?: boolean;
  onPress: () => void;
};

export function HeaderTextButton({
  label,
  variant = 'primary',
  disabled = false,
  onPress,
}: Props) {
  const styles = useThemedStyles(createHeaderTextButtonStyles);

  return (
    <Pressable
      onPress={onPress}
      hitSlop={12}
      disabled={disabled}
      style={({ pressed }) => [
        styles.btn,
        { opacity: pressOpacity(disabled, pressed) },
      ]}
    >
      <Text style={variant === 'danger' ? styles.labelDanger : styles.labelPrimary}>
        {label}
      </Text>
    </Pressable>
  );
}
