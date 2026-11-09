/** Habits and daily ticks kept on the device. Every change is saved as soon as the data updates. */
import { useCallback, useEffect, useState } from "react";
import { loadDocument, saveDocument } from "@/lib/document-store";
import { newId } from "@/features/tasks/lib/ids";
import type { HabitData } from "../types";
import { MAX_HABITS, normalizeHabitData, removeHabit, toggleCompletion } from "../lib/habits";

const STORAGE_KEY = "tools.habits.v1";

export function useHabits() {
  const [data, setData] = useState<HabitData>({ habits: [], completions: {} });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    loadDocument<unknown>(STORAGE_KEY, null).then((stored) => {
      if (!active) return;
      setData(normalizeHabitData(stored));
      setLoaded(true);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (loaded) void saveDocument(STORAGE_KEY, data);
  }, [loaded, data]);

  const addHabit = useCallback((name: string) => {
    setData((prev) =>
      prev.habits.length >= MAX_HABITS
        ? prev
        : {
            ...prev,
            habits: [...prev.habits, { id: newId(), name, createdAt: new Date().toISOString() }],
          },
    );
  }, []);

  const toggleDay = useCallback((habitId: string, day: string) => {
    setData((prev) => ({ ...prev, completions: toggleCompletion(prev.completions, day, habitId) }));
  }, []);

  const removeOne = useCallback((habitId: string) => {
    setData((prev) => removeHabit(prev, habitId));
  }, []);

  return { habits: data.habits, completions: data.completions, loaded, addHabit, toggleDay, removeOne };
}
