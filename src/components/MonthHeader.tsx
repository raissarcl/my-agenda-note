import { useMemo, useState, type ReactNode } from 'react';
import { View, Text, Pressable, StyleSheet, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme';
import { capitalize, formatMonthLabel } from '../lib/format';
import { getCalendarYearRange } from '../lib/installYear';
import { t } from '../lib/i18n';

type Props = {
  year: number;
  monthIndex: number;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onSelectMonthYear?: (year: number, monthIndex: number) => void;
  trailing?: ReactNode;
};

const monthNames = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

export function MonthHeader({
  year,
  monthIndex,
  onPrev,
  onNext,
  onToday,
  onSelectMonthYear,
  trailing,
}: Props) {
  const { tokens } = useTheme();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [yearAnchor, setYearAnchor] = useState(year);
  const [yearBounds, setYearBounds] = useState<{
    minYear: number;
    maxYear: number;
  } | null>(null);

  const label = capitalize(formatMonthLabel(year, monthIndex));
  const yearOptions = useMemo(() => {
    if (!yearBounds) return [];
    const { minYear, maxYear } = yearBounds;
    const len = maxYear - minYear + 1;
    return Array.from({ length: len }, (_, i) => minYear + i);
  }, [yearBounds]);

  const canQuickPick = typeof onSelectMonthYear === 'function';
  return (
    <>
      <View style={[styles.row, { borderBottomColor: tokens.border }]}>
        <Pressable
          onPress={onPrev}
          hitSlop={12}
          style={({ pressed }) => [styles.iconBtn, { opacity: pressed ? 0.6 : 1 }]}
        >
          <Ionicons name="chevron-back" size={24} color={tokens.text} />
        </Pressable>
        <Pressable
          onPress={() => {
            if (!canQuickPick) return;
            void (async () => {
              const b = await getCalendarYearRange();
              setYearBounds(b);
              const clamped = Math.min(Math.max(year, b.minYear), b.maxYear);
              setYearAnchor(clamped);
              setPickerOpen(true);
            })();
          }}
          style={({ pressed }) => [
            styles.labelPress,
            { opacity: !canQuickPick ? 1 : pressed ? 0.7 : 1 },
          ]}
        >
          <Text style={[styles.label, { color: tokens.text }]}>{label}</Text>
          {canQuickPick ? (
            <Ionicons name="chevron-down" size={14} color={tokens.textMuted} />
          ) : null}
        </Pressable>
        <Pressable
          onPress={onNext}
          hitSlop={12}
          style={({ pressed }) => [styles.iconBtn, { opacity: pressed ? 0.6 : 1 }]}
        >
          <Ionicons name="chevron-forward" size={24} color={tokens.text} />
        </Pressable>
        <View style={styles.todayGroup}>
          <Pressable
            onPress={onToday}
            style={({ pressed }) => [
              styles.todayBtn,
              { backgroundColor: tokens.surfaceAlt, opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Text style={[styles.todayText, { color: tokens.text }]}>{t.today}</Text>
          </Pressable>
          {trailing}
        </View>
      </View>

      <Modal
        visible={pickerOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setPickerOpen(false)}
      >
        <Pressable
          style={[styles.overlay, { backgroundColor: tokens.overlay }]}
          onPress={() => setPickerOpen(false)}
        />
        <View style={[styles.modalCard, { backgroundColor: tokens.surface }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.yearOptions}>
              {yearOptions.map((y) => {
                const active = y === yearAnchor;
                return (
                  <Pressable
                    key={y}
                    onPress={() => setYearAnchor(y)}
                    style={[
                      styles.yearChip,
                      {
                        backgroundColor: active ? tokens.primary : tokens.surfaceAlt,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color: active ? tokens.primaryText : tokens.text,
                        fontWeight: active ? '700' : '500',
                      }}
                    >
                      {y}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>

          <View style={styles.monthGrid}>
            {monthNames.map((m, idx) => {
              const active = yearAnchor === year && idx === monthIndex;
              return (
                <Pressable
                  key={m}
                  onPress={() => {
                    onSelectMonthYear?.(yearAnchor, idx);
                    setPickerOpen(false);
                  }}
                  style={[
                    styles.monthBtn,
                    {
                      backgroundColor: active ? tokens.primary : tokens.surfaceAlt,
                      borderColor: tokens.border,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: active ? tokens.primaryText : tokens.text,
                      fontSize: 13,
                      fontWeight: active ? '700' : '500',
                    }}
                  >
                    {m}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconBtn: {
    padding: 6,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
  },
  labelPress: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  todayGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginLeft: 4,
  },
  todayBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  todayText: {
    fontSize: 13,
    fontWeight: '500',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  modalCard: {
    marginHorizontal: 14,
    marginTop: 110,
    borderRadius: 14,
    padding: 12,
  },
  yearOptions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 4,
  },
  yearChip: {
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  monthBtn: {
    width: '31%',
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 9,
    alignItems: 'center',
  },
});
