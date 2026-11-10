// src/features/vision-converter/hooks/usePersistedVision.ts
/** Keeps the Vision Converter instruction and last Markdown on the device between visits. */
import { useCallback, useEffect, useState } from "react";
import { loadDocument, saveDocument } from "@/lib/document-store";
import { parseSavedState, VISION_STORAGE_KEY, type SavedVisionState } from "../lib/persistence";

export function usePersistedVision() {
  const [state, setState] = useState<SavedVisionState>({ instruction: "", markdownOutput: null });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    loadDocument<unknown>(VISION_STORAGE_KEY, null)
      .then((saved) => {
        if (active) setState(parseSavedState(saved));
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
    saveDocument(VISION_STORAGE_KEY, state).catch(() => undefined);
  }, [loaded, state]);

  const setInstruction = useCallback((instruction: string) => {
    setState((prev) => ({ ...prev, instruction }));
  }, []);

  const setMarkdownOutput = useCallback((markdownOutput: string | null) => {
    setState((prev) => ({ ...prev, markdownOutput }));
  }, []);

  const reset = useCallback(() => {
    setState({ instruction: "", markdownOutput: null });
  }, []);

  return { ...state, setInstruction, setMarkdownOutput, reset };
}
