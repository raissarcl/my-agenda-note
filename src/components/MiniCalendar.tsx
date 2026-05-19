import { useMemo } from 'react';
import { Calendar, type DateData } from 'react-native-calendars';
import { useTheme } from '../theme';
import {
  calendarAccentForHolidayKind,
} from '../lib/calendarHolidayAccent';
import type { BrazilCalendarDayInfo } from '../lib/brHolidays';
import { HOLIDAY_KIND_ORDER } from '../lib/brHolidays';
import { colorForId } from '../lib/colors';
import type { TaskOccurrence } from '../types';

type Props = {
  year: number;
  monthIndex: number;
  occurrences: TaskOccurrence[];
  holidaysByDate?: Record<string, BrazilCalendarDayInfo>;
  selectedDate?: string;
  onSelectDate: (dateISO: string) => void;
  onMonthChange: (year: number, monthIndex: number) => void;
};

const MAX_DOTS = 4;

export function MiniCalendar({
  year,
  monthIndex,
  occurrences,
  holidaysByDate = {},
  selectedDate,
  onSelectDate,
  onMonthChange,
}: Props) {
  const { tokens, isDark } = useTheme();
  const monthString = `${year}-${String(monthIndex + 1).padStart(2, '0')}-01`;

  const markedDates = useMemo(() => {
    const map: Record<
      string,
      { marked?: boolean; dots?: Array<{ key: string; color: string }>; selected?: boolean; selectedColor?: string }
    > = {};
    for (const o of occurrences) {
      const key = o.occurrenceDate;
      if (!map[key]) map[key] = { dots: [] };
      const dots = map[key].dots ?? [];
      if (dots.length < 3) {
        dots.push({ key: o.id + dots.length, color: colorForId(o.id, isDark) });
      }
      map[key].dots = dots;
      map[key].marked = true;
    }
    for (const iso of Object.keys(holidaysByDate)) {
      const info = holidaysByDate[iso];
      if (!info?.kinds?.length) continue;
      if (!map[iso]) map[iso] = { dots: [] };
      const dots = map[iso].dots ?? [];
      for (let i = HOLIDAY_KIND_ORDER.length - 1; i >= 0; i--) {
        const kind = HOLIDAY_KIND_ORDER[i];
        if (!info.kinds.includes(kind)) continue;
        const key = `__holiday_${kind}`;
        if (!dots.some((x) => x.key === key)) {
          dots.unshift({
            key,
            color: calendarAccentForHolidayKind(kind, isDark),
          });
        }
      }
      map[iso].dots = dots.slice(0, MAX_DOTS);
      map[iso].marked = true;
    }
    if (selectedDate) {
      map[selectedDate] = {
        ...(map[selectedDate] ?? {}),
        selected: true,
        selectedColor: tokens.primary,
      };
    }
    return map;
  }, [occurrences, holidaysByDate, selectedDate, isDark, tokens.primary]);

  return (
    <Calendar
      key={`${year}-${monthIndex}-${isDark ? 'd' : 'l'}`}
      current={monthString}
      markingType="multi-dot"
      markedDates={markedDates}
      onDayPress={(d: DateData) => onSelectDate(d.dateString)}
      onMonthChange={(d: DateData) => onMonthChange(d.year, d.month - 1)}
      hideArrows
      renderHeader={() => null}
      hideExtraDays
      firstDay={0}
      enableSwipeMonths
      theme={{
        backgroundColor: tokens.bg,
        calendarBackground: tokens.bg,
        textSectionTitleColor: tokens.textMuted,
        dayTextColor: tokens.text,
        monthTextColor: tokens.text,
        todayTextColor: tokens.primary,
        selectedDayBackgroundColor: tokens.primary,
        selectedDayTextColor: tokens.primaryText,
        textDisabledColor: tokens.textFaint,
        arrowColor: tokens.text,
        indicatorColor: tokens.primary,
        textMonthFontWeight: '600',
        textDayFontSize: 14,
        textMonthFontSize: 16,
        textDayHeaderFontSize: 12,
      }}
      style={{
        backgroundColor: tokens.bg,
      }}
    />
  );
}
