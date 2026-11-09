/**
 * Countdown end alerts as device notifications. A running countdown schedules one notification at its
 * end time, so it still fires when the app is closed or in the background.
 */
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import { configureReminderNotifications, requestReminderPermission } from "@/features/tasks/lib/notifications";

const CHANNEL_ID = "countdown-alerts";
const NATIVE = Platform.OS !== "web";

function identifierFor(countdownId: string): string {
  return `countdown-${countdownId}`;
}

export function setupCountdownNotifications(): void {
  configureReminderNotifications();
}

export async function ensureCountdownPermission(): Promise<boolean> {
  return requestReminderPermission();
}

export async function cancelCountdownEnd(countdownId: string): Promise<void> {
  if (!NATIVE) return;
  await Notifications.cancelScheduledNotificationAsync(identifierFor(countdownId)).catch(() => undefined);
}

/** Replaces the countdown's end alert. Pass the end time in epoch ms. */
export async function scheduleCountdownEnd(countdownId: string, name: string, endsAt: number): Promise<void> {
  if (!NATIVE) return;
  await cancelCountdownEnd(countdownId);
  if (endsAt <= Date.now()) return;
  const permission = await Notifications.getPermissionsAsync();
  if (!permission.granted) return;

  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: "Countdown alerts",
    importance: Notifications.AndroidImportance.HIGH,
  });
  await Notifications.scheduleNotificationAsync({
    identifier: identifierFor(countdownId),
    content: { title: "Time is up", body: name },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: new Date(endsAt), channelId: CHANNEL_ID },
  });
}
