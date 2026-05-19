import { StyleSheet } from 'react-native';
import type { ThemeTokens } from '../../../theme';

export function createCombinedScreenStyles(_tokens: ThemeTokens) {
  return StyleSheet.create({
    container: { flex: 1 },
    dayHeader: {
      paddingHorizontal: 14,
      paddingTop: 10,
      paddingBottom: 6,
      gap: 4,
    },
    dayTitle: { fontSize: 15, fontWeight: '600' },
    holidayTitle: { fontSize: 14, fontWeight: '600' },
    divider: { height: StyleSheet.hairlineWidth },
    list: { flex: 1 },
    listContent: { paddingBottom: 96 },
    listEmptyGrow: { flexGrow: 1, paddingBottom: 96 },
  });
}
