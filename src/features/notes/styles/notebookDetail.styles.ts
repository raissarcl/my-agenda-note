import { StyleSheet } from 'react-native';
import type { ThemeTokens } from '../../../theme';

export function createNotebookDetailStyles(tokens: ThemeTokens) {
  return StyleSheet.create({
    centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: tokens.bg,
    },
    container: {
      flex: 1,
      backgroundColor: tokens.bg,
    },
    listContent: { padding: 16, paddingBottom: 100, gap: 8 },
  });
}
