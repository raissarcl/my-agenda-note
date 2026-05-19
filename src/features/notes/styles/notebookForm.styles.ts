import { StyleSheet } from 'react-native';
import type { ThemeTokens } from '../../../theme';

export function createNotebookFormStyles(tokens: ThemeTokens) {
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
    label: {
      fontSize: 14,
      color: tokens.textMuted,
    },
    input: {
      borderWidth: StyleSheet.hairlineWidth,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 18,
      fontWeight: '600',
      color: tokens.text,
      borderColor: tokens.border,
      backgroundColor: tokens.surface,
    },
    saveBtn: {
      marginTop: 8,
      borderRadius: 12,
      paddingVertical: 14,
      alignItems: 'center',
      backgroundColor: tokens.primary,
    },
    saveBtnLabel: {
      color: tokens.primaryText,
      fontWeight: '600',
      fontSize: 16,
    },
  });
}
