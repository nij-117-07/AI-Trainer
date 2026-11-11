// src/hooks/usePersistedRunState.ts
/**
 * useState for progress tied to one generated result, such as quiz answers. The value is saved
 * with the result's id and only restored when that same result is shown again, so a new run starts
 * clean. Callers remount the component when a new run starts, as they already do with a run key.
 */
import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { loadDocument, saveDocument } from "@/lib/document-store";

interface SavedRun<T> {
  runId: string;
  value: T;
}

function isSavedRun<T>(saved: unknown, runId: string): saved is SavedRun<T> {
  return typeof saved === "object" && saved !== null && (saved as { runId?: unknown }).runId === runId && "value" in saved;
}

/** Returns [value, setValue, saveError]. saveError is true while the last write failed (9.3). */
export function usePersistedRunState<T>(
  storageKey: string,
  runId: string,
  initial: T,
): [T, Dispatch<SetStateAction<T>>, boolean] {
  const [value, setValue] = useState<T>(initial);
  const [ready, setReady] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const initialRef = useRef(initial);

  useEffect(() => {
    let active = true;
    loadDocument<unknown>(storageKey, null)
      .then((saved) => {
        if (!active) return;
        setValue(isSavedRun<T>(saved, runId) ? saved.value : initialRef.current);
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, [storageKey, runId]);

  useEffect(() => {
    if (!ready) return;
    const saved: SavedRun<T> = { runId, value };
    saveDocument(storageKey, saved)
      .then(() => setSaveError(false))
      .catch(() => setSaveError(true));
  }, [ready, storageKey, runId, value]);

  return [value, setValue, saveError];
}
