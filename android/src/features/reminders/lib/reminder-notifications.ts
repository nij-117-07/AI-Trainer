/**
 * Reminder notifications on the device. Upcoming times for the next week are scheduled as dated
 * notifications, so they fire even when the app is closed. Syncs run one at a time so a cancel and
 * a reschedule never overlap. Web has no scheduled notifications, so every call is a no-op there.
 */
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import type { Reminder } from "../types";
import { HORIZON_DAYS, MAX_SCHEDULED, occurrencesFor } from "./schedule";

const CHANNEL_ID = "reminders";
const PREFIX = "reminder-";
const NATIVE = Platform.OS !== "web";

let queue: Promise<void> = Promise.resolve();

export function syncReminderNotifications(reminders: Reminder[], now: Date = new Date()): Promise<void> {
  queue = queue.then(() => replaceScheduled(reminders, now)).catch(() => undefined);
  return queue;
}

async function replaceScheduled(reminders: Reminder[], now: Date): Promise<void> {
  if (!NATIVE) return;

  const existing = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    existing
      .filter((request) => request.identifier.startsWith(PREFIX))
      .map((request) => Notifications.cancelScheduledNotificationAsync(request.identifier)),
  );

  const permission = await Notifications.getPermissionsAsync();
  if (!permission.granted) return;

  const horizon = new Date(now.getTime() + HORIZON_DAYS * 24 * 60 * 60 * 1000);
  const upcoming = reminders
    .flatMap((reminder) => occurrencesFor(reminder, now, horizon).map((date) => ({ reminder, date })))
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, MAX_SCHEDULED);
  if (upcoming.length === 0) return;

  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: "Reminders",
    importance: Notifications.AndroidImportance.HIGH,
  });

  for (const { reminder, date } of upcoming) {
    await Notifications.scheduleNotificationAsync({
      identifier: `${PREFIX}${reminder.id}-${date.getTime()}`,
      content: { title: "Reminder", body: reminder.name },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date, channelId: CHANNEL_ID },
    });
  }
}
