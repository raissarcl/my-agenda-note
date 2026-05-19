import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  CURRENT_SCHEMA_VERSION,
  DEFAULT_SETTINGS,
  type PersistedBlob,
  type Settings,
  type Task,
} from '../types';
import { migrateBlob } from './migrate';

export const STORAGE_KEY = 'my-calendar-note:v1';

export async function loadBlob(): Promise<PersistedBlob> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return migrateBlob(null);
    }
    const parsed = JSON.parse(raw);
    return migrateBlob(parsed);
  } catch {
    return migrateBlob(null);
  }
}

export async function saveBlob(blob: PersistedBlob): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(blob));
}

export function buildBlob(tasks: Task[], settings: Settings): PersistedBlob {
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    tasks,
    settings,
  };
}
