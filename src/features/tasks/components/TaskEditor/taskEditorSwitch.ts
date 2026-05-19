import type { ThemeTokens } from '../../../../theme';

export function taskEditorSwitchColors(tokens: ThemeTokens, isDark: boolean) {
  return {
    trackColor: {
      false: isDark ? '#3f3f46' : '#cbd5e1',
      true: tokens.primary,
    },
    thumbOff: isDark ? '#d4d4d8' : '#ffffff',
    thumbOn: '#ffffff',
  };
}
