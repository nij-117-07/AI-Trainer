// src/features/explainer/hooks/useExplainerTool.ts
/** Shared state for an explainer tool: a saved form, a saved last result, and one AI request. */
import type { AiSettings } from "@/features/ai-settings/types";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { useRequest } from "@/hooks/useRequest";
import type { ToolDraft } from "../lib/drafts";
import { useSavedDraft } from "./useSavedDraft";

export function useExplainerTool<TForm, TResult>(
  storageKey: string,
  defaults: TForm,
  parse: (raw: unknown) => ToolDraft<TForm, TResult>,
  task: (settings: AiSettings, form: TForm) => Promise<TResult>,
) {
  const { settings } = useAiSettings();
  const draft = useSavedDraft(storageKey, defaults, parse);
  const request = useRequest((form: TForm) => task(settings, form));

  function update<K extends keyof TForm>(key: K, value: TForm[K]) {
    draft.setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function submit() {
    const next = await request.run(draft.form);
    if (next) draft.setResult(next);
  }

  function reset() {
    draft.reset();
    request.reset();
  }

  return {
    form: draft.form,
    result: request.data ?? draft.result,
    pending: request.pending,
    error: request.error,
    update,
    submit,
    reset,
  };
}
