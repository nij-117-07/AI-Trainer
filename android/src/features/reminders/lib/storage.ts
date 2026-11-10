// src/features/reminders/lib/storage.ts
/** Reads and writes the saved reminder list. Both pages go through here, so neither keeps a stale copy. */
import { loadDocument, saveDocument } from "@/lib/document-store";
import { newId } from "@/features/tasks/lib/ids";
import type { Reminder } from "../types";
import { syncReminderNotifications } from "./reminder-notifications";
import { MAX_REMINDERS, normalizeReminders } from "./validate";

export const REMINDERS_KEY = "tools.reminders.v1";

export async function loadReminders(): Promise<Reminder[]> {
  return normalizeReminders(await loadDocument<unknown>(REMINDERS_KEY, []));
}

/** Adds a reminder and refreshes its scheduled notifications. Returns false when the list is full. */
export async function addStoredReminder(value: Omit<Reminder, "id" | "createdAt" | "enabled">): Promise<boolean> {
  const current = await loadReminders();
  if (current.length >= MAX_REMINDERS) return false;
  const reminder: Reminder = { ...value, id: newId(), enabled: true, createdAt: new Date().toISOString() };
  const next = [...current, reminder];
  await saveDocument(REMINDERS_KEY, next);
  await syncReminderNotifications(next);
  return true;
}
