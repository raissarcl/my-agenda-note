import { NativeModules, Platform } from 'react-native';
import type { Task } from '../types';
import { buildWidgetPayload } from './widgetPayload';

const { MyCalendarWidgetSync } = NativeModules as {
  MyCalendarWidgetSync?: { updateWidgetData: (json: string) => void };
};

/** @deprecated Use widgetCalendarUrl from ./widgetPayload */
export { widgetCalendarUrl } from './widgetPayload';

export async function syncHomeScreenWidgets(tasks: Task[]): Promise<void> {
  if (Platform.OS !== 'android') return;
  if (!MyCalendarWidgetSync?.updateWidgetData) return;
  try {
    const payload = buildWidgetPayload(tasks);
    MyCalendarWidgetSync.updateWidgetData(JSON.stringify(payload));
  } catch {}
}

export const syncAndroidWidgets = syncHomeScreenWidgets;
