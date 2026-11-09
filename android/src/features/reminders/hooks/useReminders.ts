/** Reminders kept on the device. Changes and each app open refresh the scheduled notifications. */
import { useCallback, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";
import { loadDocument, saveDocument } from "@/lib/document-store";
import { newId } from "@/features/tasks/lib/ids";
import { configureReminderNotifications } from "@/features/tasks/lib/notifications";
import type { Reminder } from "../types";
import { syncReminderNotifications } from "../lib/reminder-notifications";
import { MAX_REMINDERS, normalizeReminders } from "../lib/validate";

const STORAGE_KEY = "tools.reminders.v1";

export function useReminders() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loaded, setLoaded] = useState(false);
  const latest = useRef(reminders);
  latest.current = reminders;

  useEffect(() => {
    configureReminderNotifications();
    let active = true;
    loadDocument<unknown>(STORAGE_KEY, []).then((stored) => {
      if (!active) return;
      setReminders(normalizeReminders(stored));
      setLoaded(true);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!loaded) return;
    void saveDocument(STORAGE_KEY, reminders);
    void syncReminderNotifications(reminders);
  }, [loaded, reminders]);

  // Scheduled times only cover the next few days, so refresh them whenever the app comes back to the foreground.
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") void syncReminderNotifications(latest.current);
    });
    return () => subscription.remove();
  }, []);

  const addReminder = useCallback((value: Omit<Reminder, "id" | "createdAt" | "enabled">) => {
    setReminders((prev) => {
      if (prev.length >= MAX_REMINDERS) return prev;
      const reminder: Reminder = { ...value, id: newId(), enabled: true, createdAt: new Date().toISOString() };
      return [...prev, reminder];
    });
  }, []);

  const toggleReminder = useCallback((id: string) => {
    setReminders((prev) => prev.map((item) => (item.id === id ? { ...item, enabled: !item.enabled } : item)));
  }, []);

  const removeReminder = useCallback((id: string) => {
    setReminders((prev) => prev.filter((item) => item.id !== id));
  }, []);

  return { reminders, loaded, addReminder, toggleReminder, removeReminder };
}
