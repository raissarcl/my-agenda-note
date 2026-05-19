import * as Linking from 'expo-linking';
import type { Task, TaskOccurrence } from '../types';
import {
  capitalize,
  combineDateTime,
  formatDateISOLocal,
  formatDayMonth,
  formatMonthLabel,
  formatTime24,
} from './format';
import { notificationsSuppressedForTask } from './notifications';
import { expandTasksForMonth, nextOccurrencesForScheduling } from './recurrence';
import { isOccurrenceDone } from './taskCompletion';

export type WidgetPayloadPhase = 'empty' | 'content';

export type WidgetPayloadRow = {
  meta: string;
  title: string;
  deepLink: string;
};

export type WidgetPayload = {
  phase: WidgetPayloadPhase;
  brandTitle: string;
  hintOnboardingTitle: string;
  hintOnboardingBody: string;
  hintEmpty: string;
  monthTitle: string;
  monthStats: string;
  nextLabel: string;
  next: { meta: string; title: string } | null;
  listHintCompact: string;
  listHintMedium: string;
  openAppUrl: string;
  rows: WidgetPayloadRow[];
  maxRowsCompact: number;
  maxRowsMedium: number;
};

const MAX_COMPACT = 12;
const MAX_MEDIUM = 20;

type NextItem = {
  title: string;
  dateISO: string;
  timeLabel: string;
  whenMs: number;
};

export function widgetCalendarUrl(dateISO: string): string {
  return Linking.createURL('/(tabs)/index', { queryParams: { date: dateISO } });
}

export function widgetOpenAppUrl(): string {
  return Linking.createURL('/');
}

function resolveNextTask(tasks: Task[], now: Date): NextItem | null {
  const candidates: NextItem[] = [];

  const todayISO = formatDateISOLocal(now);
  for (const task of tasks) {
    if (notificationsSuppressedForTask(task, todayISO) || task.reminderLeadMinutes === null) {
      continue;
    }
    if (task.done && task.recurrence !== 'none') continue;
    const nextDates = nextOccurrencesForScheduling(task, now, 64);
    for (const d of nextDates) {
      const dateISO = formatDateISOLocal(d);
      if (isOccurrenceDone(task, dateISO)) continue;
      const timeLabel = task.allDay ? 'Dia inteiro' : task.time;
      const when = task.allDay
        ? new Date(d.getFullYear(), d.getMonth(), d.getDate(), 9, 0, 0, 0)
        : combineDateTime(dateISO, task.time);
      if (when.getTime() < now.getTime()) continue;
      candidates.push({
        title: task.title,
        dateISO,
        timeLabel,
        whenMs: when.getTime(),
      });
      break;
    }
  }

  if (candidates.length === 0) return null;
  candidates.sort((a, b) => a.whenMs - b.whenMs);
  return candidates[0];
}

function monthOccurrences(tasks: Task[], now: Date): TaskOccurrence[] {
  return expandTasksForMonth(tasks, now.getFullYear(), now.getMonth());
}

function monthPendingOccurrences(tasks: Task[], now: Date): TaskOccurrence[] {
  return monthOccurrences(tasks, now).filter(
    (o) => !isOccurrenceDone(o, o.occurrenceDate)
  );
}

function nextEventStack(next: NextItem | null): { meta: string; title: string } | null {
  if (!next) return null;
  const timePart =
    next.timeLabel === 'Dia inteiro' ? 'dia todo' : formatTime24(next.timeLabel);
  const meta = `${formatDayMonth(next.dateISO)} · ${timePart}`;
  const title =
    next.title.length > 48 ? `${next.title.slice(0, 46)}…` : next.title;
  return { meta, title };
}

function truncateTitle(s: string, max: number): string {
  if (s.length <= max) return s;
  return `${s.slice(0, max - 1)}…`;
}

export function buildWidgetPayload(tasks: Task[]): WidgetPayload {
  const now = new Date();
  const monthAll = monthOccurrences(tasks, now);
  const monthTotal = monthAll.length;
  const monthPending = monthAll.filter(
    (o) => !isOccurrenceDone(o, o.occurrenceDate)
  ).length;
  const monthTitle = capitalize(
    formatMonthLabel(now.getFullYear(), now.getMonth())
  );
  const monthStats =
    monthTotal === 0
      ? 'Sem eventos neste mês'
      : `${monthPending} pendentes · ${monthTotal} eventos`;

  const pending = monthPendingOccurrences(tasks, now);
  const rows: WidgetPayloadRow[] = pending.slice(0, MAX_MEDIUM).map((occ) => {
    const timePart = occ.allDay ? 'dia todo' : formatTime24(occ.time);
    return {
      meta: `${formatDayMonth(occ.occurrenceDate)} · ${timePart}`,
      title: truncateTitle(occ.title, 80),
      deepLink: widgetCalendarUrl(occ.occurrenceDate),
    };
  });

  const next = resolveNextTask(tasks, now);
  const nextStack = nextEventStack(next);

  const hasContent = rows.length > 0 || nextStack !== null;
  const phase: WidgetPayloadPhase = hasContent ? 'content' : 'empty';

  return {
    phase,
    brandTitle: 'MyAgenda',
    hintOnboardingTitle: 'MyAgenda',
    hintOnboardingBody: 'Abra o app para ver a sua agenda e lembretes.',
    hintEmpty: 'Nada pendente neste mês. Toque para abrir o app.',
    monthTitle,
    monthStats,
    nextLabel: 'Próximo',
    next: nextStack,
    listHintCompact: 'Pendentes do mês',
    listHintMedium: 'Pendentes do mês · toque numa linha',
    openAppUrl: widgetOpenAppUrl(),
    rows,
    maxRowsCompact: MAX_COMPACT,
    maxRowsMedium: MAX_MEDIUM,
  };
}
