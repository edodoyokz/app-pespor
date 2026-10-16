// Local notification scheduling for watched timetable slots.
// Mirrors original AlertManager: notify N minutes before start, repeat optional.
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const ALERT_MINUTES_BEFORE = 10;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function ensureNotificationPermission(): Promise<boolean> {
  const settings = await Notifications.getPermissionsAsync();
  if (settings.granted) return true;
  const req = await Notifications.requestPermissionsAsync();
  return req.granted;
}

export async function scheduleSlotAlert(slotId: number, title: string, startsAt: Date): Promise<void> {
  if (!(await ensureNotificationPermission())) return;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('timetable', {
      name: 'Timetable alerts',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }
  const fireAt = new Date(startsAt.getTime() - ALERT_MINUTES_BEFORE * 60_000);
  if (fireAt.getTime() <= Date.now()) return; // already started/past
  await Notifications.scheduleNotificationAsync({
    identifier: `slot_${slotId}`,
    content: { title: 'Starting soon', body: `${title} — in ${ALERT_MINUTES_BEFORE} minutes` },
    trigger: fireAt,
  });
}

export async function cancelSlotAlert(slotId: number): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(`slot_${slotId}`);
}
