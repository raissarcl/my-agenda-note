import { StyleSheet } from 'react-native';
import type { ThemeTokens } from '../../../theme';

export function createListScreenStyles(tokens: ThemeTokens) {
  return StyleSheet.create({
    container: { flex: 1 },
    sectionHeader: {
      paddingHorizontal: 14,
      paddingVertical: 6,
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
    sectionTitle: {
      fontSize: 12,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    actionsRow: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderBottomWidth: StyleSheet.hairlineWidth,
      gap: 8,
    },
    filterRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    filterChip: {
      borderWidth: StyleSheet.hairlineWidth,
      borderRadius: 14,
      paddingHorizontal: 10,
      paddingVertical: 7,
    },
    filterChipText: {
      fontSize: 12,
      fontWeight: '600',
    },
    collapseRow: {
      borderWidth: StyleSheet.hairlineWidth,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 9,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    collapseRowText: {
      fontSize: 13,
      fontWeight: '600',
    },
    inlineActionRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    searchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    searchInput: {
      flex: 1,
      borderWidth: 1,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 8,
      fontSize: 14,
      color: tokens.text,
      borderColor: tokens.border,
      backgroundColor: tokens.surface,
    },
    clearBtn: {
      alignSelf: 'flex-start',
      borderRadius: 14,
      borderWidth: StyleSheet.hairlineWidth,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    clearBtnText: {
      fontSize: 12,
      fontWeight: '600',
    },
    busyOverlay: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
}
