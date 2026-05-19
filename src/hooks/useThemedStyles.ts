import { useMemo } from 'react';
import { useTheme, type ThemeTokens } from '../theme';

export function useThemedStyles<T>(factory: (tokens: ThemeTokens) => T): T {
  const { tokens } = useTheme();
  return useMemo(() => factory(tokens), [tokens, factory]);
}
