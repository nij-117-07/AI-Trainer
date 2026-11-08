// src/features/diagram/hooks/usePersistedDiagram.ts
/** Keeps the Diagram Generator form, last result, and previews on the device between visits. */
import { useCallback, useEffect, useState } from "react";
import { loadDocument, saveDocument } from "@/lib/document-store";
import { DEFAULT_DRAFT } from "../options";
import { DIAGRAM_STORAGE_KEYS, restoreDraft } from "../lib/persistence";
import type { DiagramDraft } from "../types";

export function usePersistedDiagram() {
  const [draft, setDraft] = useState<DiagramDraft>(DEFAULT_DRAFT);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    loadDocument<unknown>(DIAGRAM_STORAGE_KEYS.draft, null)
      .then((saved) => {
        if (active) setDraft(restoreDraft(saved));
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
    saveDocument(DIAGRAM_STORAGE_KEYS.draft, draft).catch(() => undefined);
  }, [loaded, draft]);

  const reset = useCallback(() => setDraft(DEFAULT_DRAFT), []);

  return { draft, setDraft, reset };
}
