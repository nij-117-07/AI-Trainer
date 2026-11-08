// src/features/simulator/hooks/usePromptLibrary.ts
/** Loads the persona prompt library from the device and saves new or updated prompts. */
import { useCallback, useEffect, useMemo, useState } from "react";
import { listPrompts, upsertPrompt, type StoredPrompts } from "../lib/prompt-model";
import { loadStoredPrompts, saveStoredPrompts } from "../lib/storage";
import type { PromptFormValues } from "../types";

export function usePromptLibrary() {
  const [stored, setStored] = useState<StoredPrompts>({});
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    loadStoredPrompts()
      .then((prompts) => {
        if (!active) return;
        setStored(prompts);
      })
      .catch(() => {
        if (active) setLoadError("Saved prompts could not be read.");
      })
      .finally(() => {
        if (active) setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const prompts = useMemo(() => listPrompts(stored), [stored]);

  const save = useCallback(
    async (values: PromptFormValues): Promise<string> => {
      const next = upsertPrompt(stored, values);
      await saveStoredPrompts(next.stored);
      setStored(next.stored);
      return next.message;
    },
    [stored],
  );

  return { prompts, loaded, loadError, save };
}
