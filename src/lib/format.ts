import { format, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function todayISO(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function nowTime(): string {
  return format(new Date(), 'HH:mm');
}

export function defaultNewTaskTime(): string {
  const d = new Date();
  const h = d.getHours();
  if (h >= 23) {
    return '23:00';
  }
  const next = new Date(d);
  next.setMinutes(0, 0, 0);
  next.setHours(h + 1);
  return format(next, 'HH:mm');
}

export function formatDateISOLocal(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function parseISODate(iso: string): Date {
  return parse(iso, 'yyyy-MM-dd', new Date());
}

export function formatLongDate(iso: string): string {
  const d = parseISODate(iso);
  return format(d, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR });
}

export function formatShortDate(iso: string): string {
  const d = parseISODate(iso);
  return format(d, "d 'de' MMM", { locale: ptBR });
}

export function formatDayMonth(iso: string): string {
  const d = parseISODate(iso);
  return format(d, 'dd/MM', { locale: ptBR });
}

export function formatMonthLabel(year: number, monthIndex: number): string {
  const d = new Date(year, monthIndex, 1);
  return format(d, 'MMMM yyyy', { locale: ptBR });
}

export function capitalize(s: string): string {
  return s.length > 0 ? s[0].toUpperCase() + s.slice(1) : s;
}

export function formatTime24(time: string): string {
  return time;
}

export function combineDateTime(dateISO: string, time: string): Date {
  const [year, month, day] = dateISO.split('-').map((n) => parseInt(n, 10));
  const [hour, minute] = time.split(':').map((n) => parseInt(n, 10));
  return new Date(year, month - 1, day, hour, minute, 0, 0);
}
