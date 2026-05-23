import { StyleSheet } from 'react-native';
import type { ThemeTokens } from '../../../theme';

export function createNoteRowStyles(tokens: ThemeTokens) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 12,
      paddingLeft: 10,
      paddingVertical: 6,
      gap: 4,
      backgroundColor: tokens.surface,
      borderColor: tokens.border,
      borderWidth: StyleSheet.hairlineWidth,
    },
    rowSelected: {
      borderColor: tokens.primary,
      borderWidth: 2,
    },
    rowCheck: {
      paddingVertical: 10,
      paddingRight: 4,
      justifyContent: 'center',
    },
    rowMain: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      gap: 8,
    },
    menuBtn: {
      paddingHorizontal: 8,
      paddingVertical: 12,
      justifyContent: 'center',
    },
    rowIconBtn: {
      paddingHorizontal: 8,
      paddingVertical: 12,
      justifyContent: 'center',
    },
    rowTextWrap: { flex: 1, gap: 4 },
    rowTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: tokens.text,
    },
    rowMeta: {
      fontSize: 13,
      color: tokens.textMuted,
    },
  });
}
