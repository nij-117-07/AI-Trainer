// src/hooks/usePersistedState.ts
/**
 * Drop-in replacement for useState that keeps the value on the device, so form input survives a
 * refresh or a revisit. Saved object values are merged over the defaults, so new fields still get
 * their default after an update.
 */
import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { loadDocument, saveDocument } from "@/lib/document-store";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function restore<T>(initial: T, saved: unknown): T {
  if (isRecord(initial)) {
    if (!isRecord(saved)) return initial;
    const merged: Record<string, unknown> = { ...initial };
    for (const key of Object.keys(initial)) {
      const value = saved[key];
      if (value !== undefined && typeof value === typeof initial[key]) merged[key] = value;
    }
    return merged as T;
  }
  return typeof saved === typeof initial ? (saved as T) : initial;
}

export function usePersistedState<T>(storageKey: string, initial: T): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(initial);
  const [ready, setReady] = useState(false);
  const initialRef = useRef(initial);

  useEffect(() => {
    let active = true;
    loadDocument<unknown>(storageKey, null)
      .then((saved) => {
        if (active && saved !== null) setValue(restore(initialRef.current, saved));
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, [storageKey]);

  useEffect(() => {
    if (!ready) return;
    saveDocument(storageKey, value).catch(() => undefined);
  }, [ready, storageKey, value]);

  return [value, setValue];
}
