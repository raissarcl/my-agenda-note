import { useMemo, useState, useCallback } from 'react';
import { ActivityIndicator, Alert, Pressable, SectionList, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { MonthHeader } from '../../../components/MonthHeader';
import { TaskItem } from '../components/TaskItem';
import { Fab } from '../../../components/Fab';
import { EmptyState } from '../../../components/EmptyState';
import { useTheme } from '../../../theme';
import { useThemedStyles } from '../../../hooks/useThemedStyles';
import { useTasksStore } from '../../../store/tasks';
import { expandTasksForMonth } from '../../../lib/recurrence';
import { capitalize, formatLongDate, todayISO } from '../../../lib/format';
import { navigateMonth } from '../../../lib/monthNav';
import { t } from '../../../lib/i18n';
import { HideCompletedToggle } from '../../../components/HideCompletedToggle';
import { useSettingsStore } from '../../../store/settings';
import {
  filterOccurrences,
  groupOccurrencesByDay,
  isEmptyOnlyBecauseHideCompleted,
  withoutCompletedOccurrences,
  type QuickFilter,
} from '../lib/listFilters';
import { createListScreenStyles } from '../styles/listScreen.styles';

const FILTER_CHIPS: Array<{ key: QuickFilter; label: string }> = [
  { key: 'month', label: t.filterMonth },
  { key: 'today', label: t.filterToday },
  { key: 'next7', label: t.filterNext7 },
  { key: 'overdue', label: t.filterOverdue },
  { key: 'done', label: t.filterDone },
];

export function ListScreen() {
  const { tokens } = useTheme();
  const styles = useThemedStyles(createListScreenStyles);
  const router = useRouter();
  const tasks = useTasksStore((s) => s.tasks);
  const hideCompleted = useSettingsStore((s) => s.settings.hideCompletedOccurrences);
  const updateSettings = useSettingsStore((s) => s.update);
  const deletePastOneOffInMonth = useTasksStore((s) => s.deletePastOneOffInMonth);
  const deletePastRecurringEndedInMonth = useTasksStore(
    (s) => s.deletePastRecurringEndedInMonth
  );

  const [year, setYear] = useState(() => new Date().getFullYear());
  const [monthIndex, setMonthIndex] = useState(() => new Date().getMonth());
  const [query, setQuery] = useState('');
  const [showMonthActions, setShowMonthActions] = useState(false);
  const [quickFilter, setQuickFilter] = useState<QuickFilter>('month');
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const occurrences = useMemo(
    () => expandTasksForMonth(tasks, year, monthIndex),
    [tasks, year, monthIndex]
  );

  const filteredByText = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return occurrences;
    return occurrences.filter((o) => o.title.toLowerCase().includes(q));
  }, [occurrences, query]);

  const filteredByQuick = useMemo(
    () => filterOccurrences(filteredByText, quickFilter),
    [filteredByText, quickFilter]
  );

  const filtered = useMemo(() => {
    if (!hideCompleted || quickFilter === 'done') return filteredByQuick;
    return withoutCompletedOccurrences(filteredByQuick);
  }, [filteredByQuick, quickFilter, hideCompleted]);

  const onlyHiddenCompleted = useMemo(
    () =>
      hideCompleted &&
      quickFilter !== 'done' &&
      !query.trim() &&
      isEmptyOnlyBecauseHideCompleted(filtered, filteredByQuick, hideCompleted),
    [filtered, filteredByQuick, hideCompleted, quickFilter, query]
  );

  const sections = useMemo(() => groupOccurrencesByDay(filtered), [filtered]);

  const showCompleted = useCallback(() => {
    void updateSettings({ hideCompletedOccurrences: false });
  }, [updateSettings]);

  const goToday = useCallback(() => {
    const d = new Date();
    setYear(d.getFullYear());
    setMonthIndex(d.getMonth());
  }, []);

  const onDeletePastInMonth = () => {
    Alert.alert(t.deletePastInMonth, t.deletePastInMonthConfirm, [
      { text: t.cancel, style: 'cancel' },
      {
        text: t.delete,
        style: 'destructive',
        onPress: async () => {
          setBulkDeleting(true);
          try {
            const deleted = await deletePastOneOffInMonth(year, monthIndex);
            Alert.alert(
              deleted > 0 ? t.deletePastInMonthDone : t.deletePastInMonthNone,
              deleted > 0 ? `${deleted}` : undefined
            );
          } finally {
            setBulkDeleting(false);
          }
        },
      },
    ]);
  };

  const onDeleteRecurringEndedInMonth = () => {
    Alert.alert(
      t.deletePastRecurringInMonth,
      t.deletePastRecurringInMonthConfirm,
      [
        { text: t.cancel, style: 'cancel' },
        {
          text: t.delete,
          style: 'destructive',
          onPress: async () => {
            setBulkDeleting(true);
            try {
              const deleted = await deletePastRecurringEndedInMonth(year, monthIndex);
              Alert.alert(
                deleted > 0
                  ? t.deletePastRecurringInMonthDone
                  : t.deletePastRecurringInMonthNone,
                deleted > 0 ? `${deleted}` : undefined
              );
            } finally {
              setBulkDeleting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: tokens.bg }]}>
      <MonthHeader
        year={year}
        monthIndex={monthIndex}
        onPrev={() => navigateMonth(setYear, setMonthIndex, year, monthIndex, -1)}
        onNext={() => navigateMonth(setYear, setMonthIndex, year, monthIndex, 1)}
        onToday={goToday}
        onSelectMonthYear={(y, m) => {
          setYear(y);
          setMonthIndex(m);
        }}
      />
      <View
        style={[
          styles.actionsRow,
          { borderBottomColor: tokens.border, backgroundColor: tokens.bg },
        ]}
      >
        <View style={styles.searchRow}>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={t.searchPlaceholder}
            placeholderTextColor={tokens.textFaint}
            style={styles.searchInput}
          />
          <HideCompletedToggle
            active={hideCompleted}
            disabled={quickFilter === 'done'}
            onPress={() =>
              void updateSettings({ hideCompletedOccurrences: !hideCompleted })
            }
          />
        </View>
        <View style={styles.filterRow}>
          {FILTER_CHIPS.map((item) => {
            const active = quickFilter === item.key;
            return (
              <Pressable
                key={item.key}
                onPress={() => setQuickFilter(item.key)}
                style={({ pressed }) => [
                  styles.filterChip,
                  {
                    borderColor: active ? tokens.primary : tokens.border,
                    backgroundColor: active ? tokens.primary : tokens.surfaceAlt,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    { color: active ? tokens.primaryText : tokens.textMuted },
                  ]}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Pressable
          onPress={() => setShowMonthActions((v) => !v)}
          style={({ pressed }) => [
            styles.collapseRow,
            {
              borderColor: tokens.border,
              backgroundColor: tokens.surfaceAlt,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <Text style={[styles.collapseRowText, { color: tokens.textMuted }]}>
            {t.monthActions}
          </Text>
          <Ionicons
            name={showMonthActions ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={tokens.textMuted}
          />
        </Pressable>
        {showMonthActions ? (
          <View style={styles.inlineActionRow}>
            <Pressable
              onPress={onDeletePastInMonth}
              disabled={bulkDeleting}
              style={({ pressed }) => [
                styles.clearBtn,
                {
                  backgroundColor: tokens.surfaceAlt,
                  borderColor: tokens.border,
                  opacity: bulkDeleting ? 0.45 : pressed ? 0.7 : 1,
                },
              ]}
            >
              <Text style={[styles.clearBtnText, { color: tokens.textMuted }]}>
                {t.deletePastInMonth}
              </Text>
            </Pressable>
            <Pressable
              onPress={onDeleteRecurringEndedInMonth}
              disabled={bulkDeleting}
              style={({ pressed }) => [
                styles.clearBtn,
                {
                  backgroundColor: tokens.surfaceAlt,
                  borderColor: tokens.border,
                  opacity: bulkDeleting ? 0.45 : pressed ? 0.7 : 1,
                },
              ]}
            >
              <Text style={[styles.clearBtnText, { color: tokens.textMuted }]}>
                {t.deletePastRecurringInMonth}
              </Text>
            </Pressable>
          </View>
        ) : null}
      </View>
      {sections.length === 0 ? (
        <EmptyState
          message={
            onlyHiddenCompleted ? t.emptyOnlyCompletedHidden : t.emptyMonth
          }
          actionLabel={
            onlyHiddenCompleted ? t.showCompletedOccurrences : undefined
          }
          onAction={onlyHiddenCompleted ? showCompleted : undefined}
        />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => `${item.id}-${item.occurrenceDate}`}
          stickySectionHeadersEnabled
          contentContainerStyle={{ paddingBottom: 96 }}
          renderSectionHeader={({ section }) => (
            <View
              style={[
                styles.sectionHeader,
                {
                  backgroundColor: tokens.surfaceAlt,
                  borderBottomColor: tokens.border,
                },
              ]}
            >
              <Text style={[styles.sectionTitle, { color: tokens.textMuted }]}>
                {capitalize(formatLongDate(section.title))}
                {section.title === todayISO() ? `  •  ${t.today}` : ''}
              </Text>
            </View>
          )}
          renderItem={({ item }) => <TaskItem occurrence={item} showDate={false} />}
        />
      )}
      <Fab
        onPress={() =>
          router.push({ pathname: '/task/new', params: { date: todayISO() } })
        }
      />
      {bulkDeleting ? (
        <View
          style={[styles.busyOverlay, { backgroundColor: tokens.overlay }]}
          pointerEvents="auto"
        >
          <ActivityIndicator size="large" color={tokens.primary} />
        </View>
      ) : null}
    </View>
  );
}
