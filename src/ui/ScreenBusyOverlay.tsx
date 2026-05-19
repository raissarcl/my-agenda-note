import { ActivityIndicator, View } from 'react-native';

import { useTheme } from '../theme';
import { useThemedStyles } from '../hooks/useThemedStyles';
import { createScreenBusyOverlayStyles } from './screenBusyOverlay.styles';

type Props = {
  visible: boolean;
};

export function ScreenBusyOverlay({ visible }: Props) {
  const { tokens } = useTheme();
  const styles = useThemedStyles(createScreenBusyOverlayStyles);

  if (!visible) return null;

  return (
    <View style={styles.overlay} pointerEvents="auto">
      <ActivityIndicator size="large" color={tokens.primary} />
    </View>
  );
}
