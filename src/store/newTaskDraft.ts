import { create } from 'zustand';
import type { AlertMode, Recurrence, TaskTagId } from '../types';
import { defaultNewTaskTime, todayISO } from '../lib/format';

export type NewTaskDraft = {
  title: string;
  description: string;
  date: string;
  time: string;
  allDay: boolean;
  recurrence: Recurrence;
  recurrenceEnd?: string;
  reminderLeadMinutes: number | null;
  alertMode: AlertMode;
  done: boolean;
  notificationsPaused: boolean;
  notificationsPausedUntil: string | null;
  customWeekdays: number[];
  tagId: TaskTagId | null;
};

function defaultDraft(): NewTaskDraft {
  return {
    title: '',
    description: '',
    date: todayISO(),
    time: defaultNewTaskTime(),
    allDay: false,
    recurrence: 'none',
    recurrenceEnd: undefined,
    reminderLeadMinutes: 10,
    alertMode: 'normal',
    done: false,
    notificationsPaused: false,
    notificationsPausedUntil: null,
    customWeekdays: [],
    tagId: null,
  };
}

type NewTaskDraftState = {
  draft: NewTaskDraft;
  hasDraft: boolean;
  setDraft: (patch: Partial<NewTaskDraft>) => void;
  replaceDraft: (next: NewTaskDraft) => void;
  clearDraft: () => void;
};

export const useNewTaskDraftStore = create<NewTaskDraftState>((set) => ({
  draft: defaultDraft(),
  hasDraft: false,
  setDraft: (patch) =>
    set((s) => ({
      draft: { ...s.draft, ...patch },
      hasDraft: true,
    })),
  replaceDraft: (next) => set({ draft: next, hasDraft: true }),
  clearDraft: () => set({ draft: defaultDraft(), hasDraft: false }),
}));
