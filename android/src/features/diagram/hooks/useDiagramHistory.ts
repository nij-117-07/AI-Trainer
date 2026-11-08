// src/features/diagram/hooks/useDiagramHistory.ts
/** Keeps the recent generated and edited diagram versions on the device so they can be restored. */
import { useCallback, useEffect, useState } from "react";
import { loadDocument, saveDocument } from "@/lib/document-store";
import { appendVersion, DIAGRAM_STORAGE_KEYS, parseVersions } from "../lib/persistence";
import type { DiagramFormat, DiagramVersion } from "../types";

export function useDiagramHistory() {
  const [versions, setVersions] = useState<DiagramVersion[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    loadDocument<unknown>(DIAGRAM_STORAGE_KEYS.history, [])
      .then((saved) => {
        if (active) setVersions(parseVersions(saved));
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!loaded) return;
    saveDocument(DIAGRAM_STORAGE_KEYS.history, versions).catch(() => undefined);
  }, [loaded, versions]);

  const addVersion = useCallback((code: string, format: DiagramFormat) => {
    setVersions((prev) => appendVersion(prev, { code, format, savedAt: new Date().toISOString() }));
  }, []);

  return { versions, addVersion };
}
