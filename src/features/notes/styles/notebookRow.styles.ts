import { StyleSheet } from 'react-native';
import type { ThemeTokens } from '../../../theme';

export function createNotebookRowStyles(tokens: ThemeTokens) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 12,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: tokens.border,
      backgroundColor: tokens.surface,
      paddingLeft: 10,
      paddingVertical: 4,
    },
    main: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingVertical: 10,
    },
    textWrap: { flex: 1, gap: 4 },
    title: {
      fontSize: 16,
      fontWeight: '600',
      color: tokens.text,
    },
    meta: {
      fontSize: 13,
      color: tokens.textMuted,
    },
    menuBtn: { paddingHorizontal: 12, paddingVertical: 12 },
  });
}
