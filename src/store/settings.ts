import { create } from 'zustand';
import { DEFAULT_SETTINGS, type Settings } from '../types';
import { buildBlob, loadBlob, saveBlob } from './persistence';
import { useTasksStore } from './tasks';

type SettingsState = {
  settings: Settings;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  update: (patch: Partial<Settings>) => Promise<void>;
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: { ...DEFAULT_SETTINGS },
  hydrated: false,
  hydrate: async () => {
    const blob = await loadBlob();
    set({ settings: blob.settings, hydrated: true });
  },
  update: async (patch) => {
    const next = { ...get().settings, ...patch };
    set({ settings: next });
    const tasks = useTasksStore.getState().tasks;
    await saveBlob(buildBlob(tasks, next));
  },
}));
