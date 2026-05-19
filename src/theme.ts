import { useColorScheme } from 'react-native';
import { useSettingsStore } from './store/settings';

export type ThemeTokens = {
  bg: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  text: string;
  textMuted: string;
  textFaint: string;
  primary: string;
  primaryText: string;
  danger: string;
  success: string;
  overlay: string;
};

const lightTokens: ThemeTokens = {
  bg: '#ffffff',
  surface: '#ffffff',
  surfaceAlt: '#f4f4f5',
  border: '#e4e4e7',
  text: '#18181b',
  textMuted: '#52525b',
  textFaint: '#a1a1aa',
  primary: '#3b82f6',
  primaryText: '#ffffff',
  danger: '#ef4444',
  success: '#10b981',
  overlay: 'rgba(0,0,0,0.45)',
};

const darkTokens: ThemeTokens = {
  bg: '#0b0b0f',
  surface: '#141419',
  surfaceAlt: '#1f1f27',
  border: '#34343f',
  text: '#f4f4f5',
  textMuted: '#b4b4be',
  textFaint: '#6e6e7a',
  primary: '#7cb4ff',
  primaryText: '#0a0f18',
  danger: '#fb8f8f',
  success: '#4ade9b',
  overlay: 'rgba(0,0,0,0.65)',
};

export function useTheme(): { tokens: ThemeTokens; isDark: boolean } {
  const system = useColorScheme();
  const themeMode = useSettingsStore((s) => s.settings.theme);
  const resolved =
    themeMode === 'system' ? (system === 'dark' ? 'dark' : 'light') : themeMode;
  return {
    tokens: resolved === 'dark' ? darkTokens : lightTokens,
    isDark: resolved === 'dark',
  };
}
