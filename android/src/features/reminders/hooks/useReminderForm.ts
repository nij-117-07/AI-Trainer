/** Reminder form state for the form page: the saved draft, validation, and adding a reminder. Reset clears the draft only. */
import { useEffect, useState } from "react";
import { loadDocument, saveDocument } from "@/lib/document-store";
import { requestReminderPermission } from "@/features/tasks/lib/notifications";
import { REMINDER_DRAFT_DEFAULTS, REMINDER_FORM_KEY, restoreDraft, type ReminderDraft } from "../lib/draft";
import { addStoredReminder } from "../lib/storage";
import { MAX_REMINDERS, validateReminderInput } from "../lib/validate";

export type ReminderFormState = ReturnType<typeof useReminderForm>;

export function useReminderForm(onAdded: () => void) {
  const [draft, setDraft] = useState<ReminderDraft>(REMINDER_DRAFT_DEFAULTS);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let active = true;
    loadDocument<unknown>(REMINDER_FORM_KEY, null)
      .then((saved) => {
        if (active) setDraft(restoreDraft(saved));
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!loaded) return;
    saveDocument(REMINDER_FORM_KEY, draft).catch(() => undefined);
  }, [loaded, draft]);

  function update<K extends keyof ReminderDraft>(key: K, value: ReminderDraft[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  function toggleDay(day: number) {
    setDraft((prev) => ({
      ...prev,
      weekdays: prev.weekdays.includes(day) ? prev.weekdays.filter((item) => item !== day) : [...prev.weekdays, day],
    }));
  }

  function reset() {
    setDraft(REMINDER_DRAFT_DEFAULTS);
    setError(null);
  }

  /** Saves the reminder, asks for notification permission, then returns to the list. The schedule fields stay for the next one. */
  async function add() {
    const check = validateReminderInput(draft);
    if (!check.ok) {
      setError(check.error);
      return;
    }
    setPending(true);
    setError(null);
    try {
      const added = await addStoredReminder(check.value);
      if (!added) {
        setError(`You have reached the limit of ${MAX_REMINDERS} reminders. Delete one to add another.`);
        return;
      }
      const next = { ...draft, name: "" };
      setDraft(next);
      await saveDocument(REMINDER_FORM_KEY, next).catch(() => undefined);
      await requestReminderPermission().catch(() => false);
      onAdded();
    } finally {
      setPending(false);
    }
  }

  return { draft, loaded, error, pending, update, toggleDay, reset, add };
}
