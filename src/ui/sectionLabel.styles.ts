import { StyleSheet } from 'react-native';
import type { ThemeTokens } from '../theme';

export function createSectionLabelStyles(tokens: ThemeTokens) {
  return StyleSheet.create({
    label: {
      fontSize: 13,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.4,
      color: tokens.textMuted,
      marginBottom: 4,
    },
  });
}
