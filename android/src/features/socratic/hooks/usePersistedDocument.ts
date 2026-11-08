// src/features/socratic/hooks/usePersistedDocument.ts
/** Keeps one JSON value on the device under a storage key, and restores it on the next visit. */
import { useEffect, useState } from "react";
import { loadDocument, saveDocument } from "@/lib/document-store";

export function usePersistedDocument<T>(key: string, initial: T, sanitize: (saved: unknown) => T) {
  const [value, setValue] = useState<T>(initial);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    loadDocument<unknown>(key, null)
      .then((saved) => {
        if (active && saved !== null) setValue(sanitize(saved));
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, [key, sanitize]);

  useEffect(() => {
    if (!loaded) return;
    saveDocument(key, value).catch(() => undefined);
  }, [loaded, key, value]);

  return { value, setValue };
}
