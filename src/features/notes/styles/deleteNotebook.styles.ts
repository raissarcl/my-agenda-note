import { StyleSheet } from 'react-native';
import type { ThemeTokens } from '../../../theme';

export function createDeleteNotebookStyles(tokens: ThemeTokens) {
  return StyleSheet.create({
    centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: tokens.bg,
    },
    container: {
      flex: 1,
      padding: 16,
      gap: 12,
      backgroundColor: tokens.bg,
    },
    title: {
      fontSize: 20,
      fontWeight: '700',
      color: tokens.text,
    },
    list: { gap: 8, paddingBottom: 8 },
    noteRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      padding: 12,
      borderRadius: 12,
      borderWidth: StyleSheet.hairlineWidth,
      backgroundColor: tokens.surface,
      borderColor: tokens.border,
    },
    noteRowSelected: {
      borderColor: tokens.primary,
    },
    noteLabel: {
      flex: 1,
      fontSize: 15,
      color: tokens.text,
    },
    empty: {
      fontSize: 15,
      marginVertical: 24,
      color: tokens.textMuted,
    },
    btn: {
      borderRadius: 12,
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderWidth: 2,
      borderColor: tokens.primary,
    },
    btnLabelPrimary: {
      color: tokens.primary,
      fontWeight: '600',
      textAlign: 'center',
    },
    btnDanger: {
      borderWidth: 0,
      backgroundColor: tokens.danger,
    },
    btnLabelDanger: {
      color: tokens.primaryText,
      fontWeight: '600',
      textAlign: 'center',
    },
  });
}
