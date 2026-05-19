import { StyleSheet } from 'react-native';
import type { ThemeTokens } from '../theme';

export function createScreenBusyOverlayStyles(tokens: ThemeTokens) {
  return StyleSheet.create({
    overlay: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: tokens.overlay,
    },
  });
}
