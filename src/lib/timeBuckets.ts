import type { ThemeTokens } from '../theme';

export type TimeBucket = 'morning' | 'afternoon' | 'night' | 'allDay';

export function getTimeBucket(time: string, allDay: boolean): TimeBucket {
  if (allDay) return 'allDay';
  const [hour] = time.split(':').map(Number);
  const h = hour ?? 0;
  if (h < 12) return 'morning';
  if (h < 18) return 'afternoon';
  return 'night';
}

export function getTimeBucketLabel(bucket: TimeBucket): string {
  if (bucket === 'morning') return 'Manhã';
  if (bucket === 'afternoon') return 'Tarde';
  if (bucket === 'night') return 'Noite';
  return 'Dia inteiro';
}

export function getTimeBucketStyles(
  bucket: TimeBucket,
  tokens: ThemeTokens,
  isDark: boolean
): { bg: string; badgeBg: string; badgeText: string; border: string } {
  if (isDark) {
    if (bucket === 'morning') {
      return {
        bg: 'rgba(14, 165, 233, 0.17)',
        badgeBg: 'rgba(14, 165, 233, 0.32)',
        badgeText: '#bae6fd',
        border: 'rgba(56, 189, 248, 0.42)',
      };
    }
    if (bucket === 'afternoon') {
      return {
        bg: 'rgba(217, 119, 6, 0.18)',
        badgeBg: 'rgba(245, 158, 11, 0.32)',
        badgeText: '#fde68a',
        border: 'rgba(251, 191, 36, 0.45)',
      };
    }
    if (bucket === 'night') {
      return {
        bg: 'rgba(124, 58, 237, 0.2)',
        badgeBg: 'rgba(109, 40, 217, 0.34)',
        badgeText: '#e9d5ff',
        border: 'rgba(167, 139, 250, 0.48)',
      };
    }
    return {
      bg: 'rgba(5, 150, 105, 0.16)',
      badgeBg: 'rgba(16, 185, 129, 0.3)',
      badgeText: '#a7f3d0',
      border: 'rgba(52, 211, 153, 0.42)',
    };
  }

  if (bucket === 'morning') {
    return {
      bg: 'rgba(59, 130, 246, 0.08)',
      badgeBg: 'rgba(59, 130, 246, 0.16)',
      badgeText: '#1d4ed8',
      border: tokens.border,
    };
  }
  if (bucket === 'afternoon') {
    return {
      bg: 'rgba(245, 158, 11, 0.10)',
      badgeBg: 'rgba(245, 158, 11, 0.18)',
      badgeText: '#b45309',
      border: tokens.border,
    };
  }
  if (bucket === 'night') {
    return {
      bg: 'rgba(109, 40, 217, 0.09)',
      badgeBg: 'rgba(109, 40, 217, 0.16)',
      badgeText: '#6d28d9',
      border: tokens.border,
    };
  }
  return {
    bg: 'rgba(16, 185, 129, 0.08)',
    badgeBg: 'rgba(16, 185, 129, 0.16)',
    badgeText: '#047857',
    border: tokens.border,
  };
}
