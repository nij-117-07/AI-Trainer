// src/features/simulator/hooks/usePersistedDocument.ts
/**
 * Keeps one Simulator document in device storage. It loads once, then saves every change. Saves wait
 * until the load finishes so a default value never overwrites saved work.
 */
import { useEffect, useState } from "react";
import { loadDocument, saveDocument } from "@/lib/document-store";

export function usePersistedDocument<T>(key: string, normalise: (raw: unknown) => T) {
  const [value, setValue] = useState<T>(() => normalise(null));
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    loadDocument<unknown>(key, null)
      .then((raw) => {
        if (active) setValue(normalise(raw));
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, [key, normalise]);

  useEffect(() => {
    if (!loaded) return;
    saveDocument(key, value).catch(() => undefined);
  }, [loaded, key, value]);

  return { value, setValue, loaded };
}
