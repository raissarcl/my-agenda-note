import { useMemo, useState, useEffect, useCallback } from 'react';
import { FlatList, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { MiniCalendar } from '../../../components/MiniCalendar';
import { MonthHeader } from '../../../components/MonthHeader';
import { TaskItem } from '../../tasks/components/TaskItem';
import { Fab } from '../../../components/Fab';
import { EmptyState } from '../../../components/EmptyState';
import { useTheme } from '../../../theme';
import { useThemedStyles } from '../../../hooks/useThemedStyles';
import { useTasksStore } from '../../../store/tasks';
import {
  brazilCalendarDayInfoOnDate,
  brazilHolidaysInMonth,
} from '../../../lib/brHolidays';
import { expandTasksForDay, expandTasksForMonth } from '../../../lib/recurrence';
import { capitalize, formatLongDate } from '../../../lib/format';
import { initialTaskDateForCalendar } from '../utils/initialTaskDate';
import {
  calendarAccentForHolidayKind,
  pickStrongestHolidayKind,
} from '../../../lib/calendarHolidayAccent';
import { navigateMonth } from '../../../lib/monthNav';
import { t } from '../../../lib/i18n';
import { HideCompletedToggle } from '../../../components/HideCompletedToggle';
import { useSettingsStore } from '../../../store/settings';
import {
  isEmptyOnlyBecauseHideCompleted,
  withoutCompletedOccurrences,
} from '../../tasks/lib/listFilters';
import { createCombinedScreenStyles } from '../styles/combinedScreen.styles';

export function CombinedScreen() {
  const { tokens, isDark } = useTheme();
  const styles = useThemedStyles(createCombinedScreenStyles);
  const router = useRouter();
  const params = useLocalSearchParams<{ date?: string }>();
  const tasks = useTasksStore((s) => s.tasks);
  const hideCompleted = useSettingsStore((s) => s.settings.hideCompletedOccurrences);
  const updateSettings = useSettingsStore((s) => s.update);
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [monthIndex, setMonthIndex] = useState(() => new Date().getMonth());
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    if (typeof params.date === 'string' && params.date) {
      const [y, m] = params.date.split('-').map((n) => parseInt(n, 10));
      if (!isNaN(y) && !isNaN(m)) {
        setYear(y);
        setMonthIndex(m - 1);
        setSelected(params.date);
      }
    }
  }, [params.date]);

  const monthUnfiltered = useMemo(
    () => expandTasksForMonth(tasks, year, monthIndex),
    [tasks, year, monthIndex]
  );

  const monthOccurrences = useMemo(
    () =>
      hideCompleted ? withoutCompletedOccurrences(monthUnfiltered) : monthUnfiltered,
    [monthUnfiltered, hideCompleted]
  );

  const holidaysInMonth = useMemo(
    () => brazilHolidaysInMonth(year, monthIndex),
    [year, monthIndex]
  );

  const selectedHolidayInfo = useMemo(() => {
    if (!selected) return null;
    const fromMonth = holidaysInMonth[selected];
    if (fromMonth?.label) return fromMonth;
    return brazilCalendarDayInfoOnDate(selected);
  }, [selected, holidaysInMonth]);

  const selectedHolidayTitleColor = useMemo(() => {
    if (!selectedHolidayInfo?.kinds?.length) return null;
    return calendarAccentForHolidayKind(
      pickStrongestHolidayKind(selectedHolidayInfo.kinds),
      isDark
    );
  }, [selectedHolidayInfo, isDark]);

  const unfilteredOccurrences = useMemo(
    () => (selected ? expandTasksForDay(tasks, selected) : monthUnfiltered),
    [selected, tasks, monthUnfiltered]
  );

  const visibleOccurrences = useMemo(
    () =>
      hideCompleted
        ? withoutCompletedOccurrences(unfilteredOccurrences)
        : unfilteredOccurrences,
    [unfilteredOccurrences, hideCompleted]
  );

  const onlyHiddenCompleted = useMemo(
    () =>
      isEmptyOnlyBecauseHideCompleted(
        visibleOccurrences,
        unfilteredOccurrences,
        hideCompleted
      ),
    [visibleOccurrences, unfilteredOccurrences, hideCompleted]
  );

  const showCompleted = useCallback(() => {
    void updateSettings({ hideCompletedOccurrences: false });
  }, [updateSettings]);

  const clearDaySelection = useCallback(() => {
    setSelected(null);
  }, []);

  const goToday = useCallback(() => {
    const d = new Date();
    setYear(d.getFullYear());
    setMonthIndex(d.getMonth());
    clearDaySelection();
  }, [clearDaySelection]);

  const goToMonth = useCallback(
    (y: number, m: number) => {
      setYear(y);
      setMonthIndex(m);
      clearDaySelection();
    },
    [clearDaySelection]
  );

  const goMonthByDelta = useCallback(
    (delta: -1 | 1) => {
      navigateMonth(setYear, setMonthIndex, year, monthIndex, delta);
      clearDaySelection();
    },
    [year, monthIndex, clearDaySelection]
  );

  const openNewTask = () => {
    router.push({
      pathname: '/task/new',
      params: { date: initialTaskDateForCalendar(selected, year, monthIndex) },
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: tokens.bg }]}>
      <MonthHeader
        year={year}
        monthIndex={monthIndex}
        onPrev={() => goMonthByDelta(-1)}
        onNext={() => goMonthByDelta(1)}
        onToday={goToday}
        onSelectMonthYear={goToMonth}
        trailing={
          <HideCompletedToggle
            active={hideCompleted}
            onPress={() =>
              void updateSettings({ hideCompletedOccurrences: !hideCompleted })
            }
          />
        }
      />
      <MiniCalendar
        year={year}
        monthIndex={monthIndex}
        occurrences={monthOccurrences}
        holidaysByDate={holidaysInMonth}
        selectedDate={selected ?? undefined}
        onSelectDate={(d) => setSelected((cur) => (cur === d ? null : d))}
        onMonthChange={goToMonth}
      />
      <View style={[styles.divider, { backgroundColor: tokens.border }]} />
      <FlatList
        data={visibleOccurrences}
        keyExtractor={(item) => `${item.id}-${item.occurrenceDate}`}
        ListHeaderComponent={
          selected ? (
            <View style={styles.dayHeader}>
              <Text style={[styles.dayTitle, { color: tokens.text }]}>
                {capitalize(formatLongDate(selected))}
              </Text>
              {selectedHolidayInfo?.label && selectedHolidayTitleColor ? (
                <Text
                  style={[styles.holidayTitle, { color: selectedHolidayTitleColor }]}
                >
                  {selectedHolidayInfo.label}
                </Text>
              ) : null}
            </View>
          ) : null
        }
        renderItem={({ item }) => <TaskItem occurrence={item} />}
        ListEmptyComponent={
          <EmptyState
            message={
              onlyHiddenCompleted
                ? selected
                  ? t.emptyOnlyCompletedHiddenDay
                  : t.emptyOnlyCompletedHidden
                : selected
                  ? t.emptyDay
                  : t.emptyMonth
            }
            actionLabel={
              onlyHiddenCompleted ? t.showCompletedOccurrences : undefined
            }
            onAction={onlyHiddenCompleted ? showCompleted : undefined}
          />
        }
        contentContainerStyle={
          visibleOccurrences.length === 0
            ? styles.listEmptyGrow
            : styles.listContent
        }
        keyboardShouldPersistTaps="handled"
        style={styles.list}
      />
      <Fab onPress={openNewTask} />
    </View>
  );
}
