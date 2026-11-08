// src/features/foresight-trainer/hooks/usePersistedDocument.ts
/** Keeps one JSON value on the device, restoring it through `restore` on load and saving each change. */
import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { loadDocument, saveDocument } from "@/lib/document-store";

export function usePersistedDocument<T>(storageKey: string, initial: T, restore: (saved: unknown) => T) {
  const [value, setValue] = useState<T>(initial);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    loadDocument<unknown>(storageKey, null)
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
  }, [storageKey, restore]);

  useEffect(() => {
    if (!loaded) return;
    saveDocument(storageKey, value).catch(() => undefined);
  }, [loaded, storageKey, value]);

  return { value, setValue: setValue as Dispatch<SetStateAction<T>> };
}
