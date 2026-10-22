// src/features/learning/explainer/hooks/usePersistedState.ts
/**
 * Generic, hydration-safe localStorage-backed state.
 * Reads once after mount (avoids SSR mismatch), persists on change with a
 * debounce, and exposes a clear() helper. Storage errors degrade gracefully.
 */
"use client";

import { useCallback, useEffect, useState } from "react";

export type PersistStatus = "idle" | "saving" | "saved";

interface UsePersistedStateOptions<T> {
  /** Unique localStorage key (prefix with feature + version). */
  key: string;
  /** Fallback value when nothing is stored. */
  initialValue: T;
  /** Debounce delay in ms before writing to localStorage. */
  debounceMs?: number;
}

export function usePersistedState<T>({
  key,
  initialValue,
  debounceMs = 300,
}: UsePersistedStateOptions<T>) {
  const [value, setValue] = useState<T>(initialValue);
  const [status, setStatus] = useState<PersistStatus>("idle");
  const [hydrated, setHydrated] = useState(false);

  // Restore from localStorage after mount (client-only, no SSR mismatch).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      // Hydration pattern: reading a client store into state after mount.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setValue(JSON.parse(raw) as T);
    } catch (error) {
      console.error(`[usePersistedState] Failed to restore "${key}":`, error);
    } finally {
      setHydrated(true);
    }
  }, [key]);

  // Debounced write on every change.
  useEffect(() => {
    if (!hydrated) return;
    // "saving" is intentional synchronous feedback while the debounce runs.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStatus("saving");
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        setStatus("saved");
      } catch (error) {
        console.error(`[usePersistedState] Failed to persist "${key}":`, error);
        setStatus("saved");
      }
    }, debounceMs);
    return () => clearTimeout(timer);
  }, [key, value, debounceMs, hydrated]);

  const clear = useCallback(() => {
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore storage errors
    }
    setValue(initialValue);
    setStatus("saved");
  }, [key, initialValue]);

  return { value, setValue, status, clear, hydrated };
}
