// src/features/text-to-speech/hooks/useSpeechHistory.ts
/** Recent text-to-speech requests kept on the device. Each change is saved as soon as it happens. */
import { useCallback, useEffect, useState } from "react";
import { loadDocument, saveDocument } from "@/lib/document-store";
import { addEntry, normalizeHistory, type SpeechEntry } from "../lib/history";

const STORAGE_KEY = "tools.text-to-speech.history.v1";

export function useSpeechHistory() {
  const [entries, setEntries] = useState<SpeechEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    loadDocument<unknown>(STORAGE_KEY, []).then((stored) => {
      if (!active) return;
      setEntries(normalizeHistory(stored));
      setLoaded(true);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (loaded) void saveDocument(STORAGE_KEY, entries);
  }, [loaded, entries]);

  const record = useCallback((entry: SpeechEntry) => {
    setEntries((prev) => addEntry(prev, entry));
  }, []);

  const clear = useCallback(() => setEntries([]), []);

  return { entries, loaded, record, clear };
}
