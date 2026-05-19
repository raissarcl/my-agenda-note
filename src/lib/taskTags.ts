import { t } from './i18n';
import type { TaskTagId } from '../types';

export type TaskTagDef = {
  id: TaskTagId;
  labelKey: keyof typeof t;
  colorLight: string;
  colorDark: string;
};

export const TASK_TAGS: TaskTagDef[] = [
  { id: 'work', labelKey: 'tagWork', colorLight: '#1d4ed8', colorDark: '#93c5fd' },
  { id: 'personal', labelKey: 'tagPersonal', colorLight: '#7c3aed', colorDark: '#c4b5fd' },
  { id: 'health', labelKey: 'tagHealth', colorLight: '#047857', colorDark: '#6ee7b7' },
  { id: 'study', labelKey: 'tagStudy', colorLight: '#b45309', colorDark: '#fcd34d' },
  { id: 'finance', labelKey: 'tagFinance', colorLight: '#0f766e', colorDark: '#5eead4' },
  { id: 'home', labelKey: 'tagHome', colorLight: '#be185d', colorDark: '#f9a8d4' },
];

export const TASK_TAG_IDS: TaskTagId[] = TASK_TAGS.map((tag) => tag.id);

export function isTaskTagId(value: unknown): value is TaskTagId {
  return typeof value === 'string' && TASK_TAG_IDS.includes(value as TaskTagId);
}

export function getTaskTag(id: TaskTagId): TaskTagDef {
  const tag = TASK_TAGS.find((item) => item.id === id);
  if (!tag) throw new Error(`Unknown task tag: ${id}`);
  return tag;
}

export function taskTagLabel(id: TaskTagId): string {
  const tag = getTaskTag(id);
  return t[tag.labelKey];
}

export function taskTagColor(id: TaskTagId, isDark: boolean): string {
  const tag = getTaskTag(id);
  return isDark ? tag.colorDark : tag.colorLight;
}
