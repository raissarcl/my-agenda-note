import { StyleSheet } from 'react-native';
import type { ThemeTokens } from '../../../theme';

export function createSettingsScreenStyles(tokens: ThemeTokens) {
  return StyleSheet.create({
    scroll: { padding: 16, gap: 4 },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 16,
      borderWidth: 1,
    },
    bigBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingHorizontal: 14,
      paddingVertical: 14,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: tokens.border,
      backgroundColor: tokens.surfaceAlt,
    },
    bigBtnText: { fontSize: 15, fontWeight: '500', color: tokens.text },
    hint: { fontSize: 12, marginTop: 4, color: tokens.textMuted },
    settingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderRadius: 12,
      borderWidth: 1,
    },
    settingRowTitle: { fontSize: 15, fontWeight: '500' },
    busyOverlay: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
}
