// src/features/tasks/hooks/useReminderSync.ts
/** Keeps the scheduled device notification in step with each task's reminder. */
import { useEffect, useRef } from "react";
import type { Task } from "../types";
import { configureReminderNotifications, syncReminder } from "../lib/notifications";

export function useReminderSync(tasks: Task[], loaded: boolean) {
  const scheduled = useRef(new Map<string, string>());

  useEffect(() => {
    configureReminderNotifications();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    const now = Date.now();
    const seen = new Set<string>();

    for (const task of tasks) {
      seen.add(task.id);
      const active = !task.completed && task.reminderAt !== null && Date.parse(task.reminderAt) > now;
      const key = active && task.reminderAt ? `${task.reminderAt}|${task.title}` : "";
      if (scheduled.current.get(task.id) === key) continue;
      scheduled.current.set(task.id, key);
      void syncReminder(task.id, task.title, active ? task.reminderAt : null);
    }

    for (const id of [...scheduled.current.keys()]) {
      if (seen.has(id)) continue;
      scheduled.current.delete(id);
      void syncReminder(id, "", null);
    }
  }, [tasks, loaded]);
}
