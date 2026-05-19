import { StyleSheet } from 'react-native';
import type { ThemeTokens } from '../../../theme';

export function createNotesScreenStyles(tokens: ThemeTokens) {
  return StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: 16,
      backgroundColor: tokens.bg,
    },
    hint: {
      fontSize: 14,
      lineHeight: 20,
      paddingHorizontal: 16,
      marginBottom: 12,
      color: tokens.textMuted,
    },
    loader: { marginTop: 48 },
    listContent: { paddingHorizontal: 16, paddingBottom: 100, gap: 8 },
    sectionSpaced: { marginTop: 16 },
  });
}
