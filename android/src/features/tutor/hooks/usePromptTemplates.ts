// src/features/tutor/hooks/usePromptTemplates.ts
/** Built-in and device-saved prompt templates, loaded from and written to the document store. */
import { useCallback, useEffect, useMemo, useState } from "react";
import { loadDocument, saveDocument } from "@/lib/document-store";
import type { PromptInput, StoredPrompt } from "../types";
import { BUILT_IN_PROMPTS } from "../lib/built-in-prompts";
import {
  mergePromptTemplates,
  parseStoredPrompts,
  removePrompt,
  upsertPrompt,
  validatePromptInput,
} from "../lib/prompt-templates";

export const PROMPTS_STORAGE_KEY = "learning.tutor.prompts.v1";

export function usePromptTemplates() {
  const [saved, setSaved] = useState<StoredPrompt[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      const raw = await loadDocument<unknown>(PROMPTS_STORAGE_KEY, []);
      setSaved(parseStoredPrompts(raw));
      setError(null);
    } catch {
      setError("Could not load saved prompt templates.");
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const templates = useMemo(() => mergePromptTemplates(BUILT_IN_PROMPTS, saved), [saved]);

  const save = useCallback(
    async (input: PromptInput): Promise<string> => {
      const valid = validatePromptInput(input);
      const next = upsertPrompt(saved, valid, new Date().toISOString());
      await saveDocument(PROMPTS_STORAGE_KEY, next);
      setSaved(next);
      return valid.name;
    },
    [saved],
  );

  const remove = useCallback(
    async (name: string): Promise<void> => {
      const next = removePrompt(saved, name);
      await saveDocument(PROMPTS_STORAGE_KEY, next);
      setSaved(next);
    },
    [saved],
  );

  return { templates, loaded, error, reload, save, remove };
}
