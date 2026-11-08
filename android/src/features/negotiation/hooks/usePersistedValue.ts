// src/features/negotiation/hooks/usePersistedValue.ts
/**
 * A React state value saved as a JSON document on the device. It loads once on mount and saves
 * after every change. `restore` checks the saved data and returns the value to use.
 */
import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { loadDocument, saveDocument } from "@/lib/document-store";

export function usePersistedValue<T>(
  key: string,
  initial: T,
  restore: (saved: unknown) => T,
): [T, Dispatch<SetStateAction<T>>, boolean] {
  const [value, setValue] = useState<T>(initial);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    loadDocument<unknown>(key, null)
      .then((saved) => {
        if (active && saved !== null) setValue(restore(saved));
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, [key]);

  useEffect(() => {
    if (!loaded) return;
    saveDocument(key, value).catch(() => undefined);
  }, [loaded, key, value]);

  return [value, setValue, loaded];
}
