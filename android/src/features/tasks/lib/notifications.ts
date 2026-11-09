// src/features/tasks/lib/notifications.ts
/**
 * Task reminders as device notifications. They are scheduled on the device, so they still fire
 * when the app is closed. Web has no scheduled notifications, so every call is a no-op there.
 */
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";

const CHANNEL_ID = "task-reminders";
const NATIVE = Platform.OS !== "web";

function identifierFor(taskId: string): string {
  return `task-${taskId}`;
}

export function configureReminderNotifications(): void {
  if (!NATIVE) return;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export async function requestReminderPermission(): Promise<boolean> {
  if (!NATIVE) return false;
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  return (await Notifications.requestPermissionsAsync()).granted;
}

/** Replaces the task's scheduled reminder. Pass null to cancel it. */
export async function syncReminder(taskId: string, title: string, reminderAt: string | null): Promise<void> {
  if (!NATIVE) return;
  await Notifications.cancelScheduledNotificationAsync(identifierFor(taskId)).catch(() => undefined);
  if (!reminderAt) return;

  const date = new Date(reminderAt);
  if (Number.isNaN(date.getTime()) || date.getTime() <= Date.now()) return;
  const permission = await Notifications.getPermissionsAsync();
  if (!permission.granted) return;

  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: "Task reminders",
    importance: Notifications.AndroidImportance.HIGH,
  });
  await Notifications.scheduleNotificationAsync({
    identifier: identifierFor(taskId),
    content: { title: "Task reminder", body: title },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date, channelId: CHANNEL_ID },
  });
}
