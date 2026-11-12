// src/features/pareto-topics/hooks/useParetoCreate.ts
/**
 * State for the new-list page. The form draft is kept on the device. A list is saved only when
 * the topics come back, and then the page opens that list.
 */
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { useRequest } from "@/hooks/useRequest";
import { usePersistedState } from "@/hooks/usePersistedState";
import { findParetoTopics } from "../lib/generators";
import { newListId, PARETO_DEFAULTS, PARETO_DRAFT_KEY, saveParetoList } from "../lib/pareto-store";
import type { ParetoFormValues, ParetoList } from "../types";

export function useParetoCreate(onCreated: (listId: string) => void) {
  const { settings } = useAiSettings();
  const [form, setForm] = usePersistedState<ParetoFormValues>(PARETO_DRAFT_KEY, PARETO_DEFAULTS);
  const request = useRequest(findParetoTopics);

  function update<K extends keyof ParetoFormValues>(key: K, value: ParetoFormValues[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function generate() {
    const result = await request.run(settings, form);
    if (!result) return;
    const now = new Date().toISOString();
    const list: ParetoList = { id: newListId(), form, result, createdAt: now, updatedAt: now };
    try {
      await saveParetoList(list);
    } catch {
      return;
    }
    setForm(PARETO_DEFAULTS);
    onCreated(list.id);
  }

  function reset() {
    setForm(PARETO_DEFAULTS);
    request.reset();
  }

  return {
    form,
    pending: request.pending,
    error: request.error,
    update,
    generate,
    reset,
  };
}

export type ParetoCreateState = ReturnType<typeof useParetoCreate>;
