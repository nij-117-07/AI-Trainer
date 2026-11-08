// src/features/clarity-trainer/hooks/useStoredDocument.ts
/** Restores one value from the device on mount, then saves every later change. */
import { useEffect, useState } from "react";
import { loadDocument, saveDocument } from "@/lib/document-store";

export function useStoredDocument<T>(key: string, initial: T, restore: (raw: unknown) => T | null) {
  const [value, setValue] = useState<T>(initial);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    loadDocument<unknown>(key, null)
      .then((raw) => {
        const restored = restore(raw);
        if (active && restored !== null) setValue(restored);
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, [key, restore]);

  useEffect(() => {
    if (!loaded) return;
    saveDocument(key, value).catch(() => undefined);
  }, [loaded, key, value]);

  return { value, setValue };
}
