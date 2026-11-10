/** The saved reminder list for the list page. It reloads each time the page is focused, and changes are saved at once. */
import { useCallback, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";
import { useFocusEffect } from "expo-router";
import { saveDocument } from "@/lib/document-store";
import { configureReminderNotifications, hasReminderPermission } from "@/features/tasks/lib/notifications";
import type { Reminder } from "../types";
import { syncReminderNotifications } from "../lib/reminder-notifications";
import { loadReminders, REMINDERS_KEY } from "../lib/storage";

export function useReminders() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [notificationsOn, setNotificationsOn] = useState(true);
  const latest = useRef(reminders);
  latest.current = reminders;

  useEffect(() => {
    configureReminderNotifications();
  }, []);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      loadReminders()
        .then((list) => {
          if (!active) return;
          setReminders(list);
          setLoaded(true);
        })
        .catch(() => undefined);
      hasReminderPermission()
        .then((granted) => {
          if (active) setNotificationsOn(granted);
        })
        .catch(() => undefined);
      return () => {
        active = false;
      };
    }, []),
  );

  useEffect(() => {
    if (!loaded) return;
    void saveDocument(REMINDERS_KEY, reminders);
    void syncReminderNotifications(reminders);
  }, [loaded, reminders]);

  // Scheduled times only cover the next few days, so refresh them whenever the app comes back to the foreground.
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") void syncReminderNotifications(latest.current);
    });
    return () => subscription.remove();
  }, []);

  const toggleReminder = useCallback((id: string) => {
    setReminders((prev) => prev.map((item) => (item.id === id ? { ...item, enabled: !item.enabled } : item)));
  }, []);

  const removeReminder = useCallback((id: string) => {
    setReminders((prev) => prev.filter((item) => item.id !== id));
  }, []);

  return { reminders, loaded, notificationsOn, toggleReminder, removeReminder };
}

export type ReminderStore = ReturnType<typeof useReminders>;
