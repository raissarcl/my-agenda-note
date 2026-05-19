import { StyleSheet } from 'react-native';
import type { ThemeTokens } from '../theme';

export function createHeaderTextButtonStyles(tokens: ThemeTokens) {
  return StyleSheet.create({
    btn: {
      paddingHorizontal: 8,
      paddingVertical: 6,
    },
    labelPrimary: {
      color: tokens.primary,
      fontSize: 16,
      fontWeight: '600',
    },
    labelDanger: {
      color: tokens.danger,
      fontSize: 16,
      fontWeight: '600',
    },
  });
}
