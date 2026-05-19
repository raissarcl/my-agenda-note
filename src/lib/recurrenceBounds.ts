import { addYears } from 'date-fns';
import { formatDateISOLocal, parseISODate } from './format';

export function maxRecurrenceEndISO(startDateISO: string): string {
  const d = parseISODate(startDateISO);
  return formatDateISOLocal(addYears(d, 1));
}

export function defaultRecurrenceEndISO(startDateISO: string): string {
  const start = parseISODate(startDateISO);
  const cap = parseISODate(maxRecurrenceEndISO(startDateISO));
  const sixMo = new Date(start);
  sixMo.setMonth(sixMo.getMonth() + 6);
  if (sixMo.getTime() > cap.getTime()) return maxRecurrenceEndISO(startDateISO);
  return formatDateISOLocal(sixMo);
}

export function clampRecurrenceEndToBounds(
  startDateISO: string,
  endISO: string
): string {
  const start = parseISODate(startDateISO);
  const end = parseISODate(endISO);
  const max = parseISODate(maxRecurrenceEndISO(startDateISO));
  if (end.getTime() < start.getTime()) return formatDateISOLocal(start);
  if (end.getTime() > max.getTime()) return maxRecurrenceEndISO(startDateISO);
  return formatDateISOLocal(end);
}
