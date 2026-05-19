import { StyleSheet } from 'react-native';
import type { ThemeTokens } from '../../../theme';

export function createNotesExpandableFabStyles(tokens: ThemeTokens) {
  return StyleSheet.create({
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: tokens.overlay,
      zIndex: 10,
    },
    wrap: {
      position: 'absolute',
      right: 20,
      alignItems: 'flex-end',
      gap: 12,
      zIndex: 11,
    },
    actionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    actionLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: tokens.text,
      backgroundColor: tokens.surface,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 10,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: tokens.border,
      overflow: 'hidden',
    },
    miniBtn: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: tokens.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: tokens.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 4,
    },
    mainBtn: {
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: tokens.primary,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.25,
      shadowRadius: 6,
      elevation: 6,
    },
  });
}
