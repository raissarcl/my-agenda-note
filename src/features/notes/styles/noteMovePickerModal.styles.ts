import { StyleSheet } from 'react-native';
import type { ThemeTokens } from '../../../theme';

export function createNoteMovePickerModalStyles(tokens: ThemeTokens) {
  return StyleSheet.create({
    root: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: tokens.overlay,
    },
    sheet: {
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      borderWidth: StyleSheet.hairlineWidth,
      borderBottomWidth: 0,
      borderColor: tokens.border,
      backgroundColor: tokens.surface,
      maxHeight: '70%',
    },
    header: {
      paddingHorizontal: 18,
      paddingTop: 18,
      paddingBottom: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: tokens.border,
    },
    title: {
      fontSize: 18,
      fontWeight: '700',
      color: tokens.text,
    },
    list: {
      flexGrow: 0,
    },
    listContent: {
      paddingVertical: 4,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingHorizontal: 18,
      paddingVertical: 14,
    },
    rowPressed: {
      backgroundColor: tokens.surfaceAlt,
    },
    rowLabel: {
      flex: 1,
      fontSize: 16,
      color: tokens.text,
    },
    footer: {
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: tokens.border,
      paddingHorizontal: 18,
      paddingTop: 8,
    },
    cancelBtn: {
      paddingVertical: 14,
      alignItems: 'center',
    },
    cancelText: {
      fontSize: 16,
      fontWeight: '600',
      color: tokens.textMuted,
    },
  });
}
