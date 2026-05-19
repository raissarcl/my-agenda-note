import { StyleSheet } from 'react-native';
import type { ThemeTokens } from '../../../theme';

export function createSettingsSectionStyles(tokens: ThemeTokens) {
  return StyleSheet.create({
    section: { marginBottom: 24 },
    sectionTitle: {
      fontSize: 12,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 10,
      color: tokens.textMuted,
    },
    sectionSubtitle: {
      fontSize: 12,
      lineHeight: 16,
      marginTop: -6,
      marginBottom: 10,
      color: tokens.textFaint,
    },
  });
}
