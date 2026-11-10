// src/features/learning-tasks/hooks/useGenerateTasks.ts
/**
 * State for the generate page. The form and the pending batch are saved on the device. Only the
 * tasks the user ticks are added to the list.
 */
import { useEffect, useState } from "react";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { generateGuideTasks } from "@/features/guides/lib/generators";
import type { GuideTaskResult } from "@/features/guides/types";
import { useRequest } from "@/hooks/useRequest";
import { loadDocument, saveDocument } from "@/lib/document-store";
import {
  appendTasks,
  describeAppend,
  listHistory,
  LEARNING_TASKS_DRAFT_KEY,
  normalizeDraft,
  pickTasks,
  TASK_FORM_DEFAULTS,
} from "../lib/learning-tasks";
import { loadLearningTasks, saveLearningTasks } from "../lib/store";
import type { TaskContext, TaskFormValues } from "../types";

function makeContext(): TaskContext {
  return { now: new Date().toISOString(), newId: () => globalThis.crypto.randomUUID() };
}

export function useGenerateTasks(onAdded: (message: string) => void) {
  const { settings } = useAiSettings();
  const [form, setForm] = useState<TaskFormValues>(TASK_FORM_DEFAULTS);
  const [batch, setBatch] = useState<GuideTaskResult | null>(null);
  const [selected, setSelected] = useState<boolean[]>([]);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const request = useRequest(generateGuideTasks);

  useEffect(() => {
    let active = true;
    loadDocument<unknown>(LEARNING_TASKS_DRAFT_KEY, null)
      .then((savedDraft) => {
        if (!active) return;
        const draft = normalizeDraft(savedDraft);
        setForm(draft.form);
        setBatch(draft.batch);
        setSelected(draft.batch ? draft.batch.tasks.map(() => true) : []);
        setReady(true);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    saveDocument(LEARNING_TASKS_DRAFT_KEY, { form, batch }).catch(() => undefined);
  }, [ready, form, batch]);

  function update<K extends keyof TaskFormValues>(key: K, value: TaskFormValues[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function generate() {
    setNotice(null);
    const current = await loadLearningTasks().catch(() => []);
    const next = await request.run(settings, { ...form, history: listHistory(current) });
    if (!next) return;
    if (next.tasks.length === 0) {
      setNotice("No tasks came back. Try again.");
      return;
    }
    setBatch(next);
    setSelected(next.tasks.map(() => true));
  }

  function toggleSelected(index: number) {
    setSelected((current) => current.map((on, i) => (i === index ? !on : on)));
  }

  function setAllSelected(value: boolean) {
    setSelected((current) => current.map(() => value));
  }

  async function addSelected() {
    if (!batch) return;
    const picks = pickTasks(batch.tasks, selected);
    if (picks.length === 0) return;
    setAdding(true);
    setNotice(null);
    try {
      const result = appendTasks(await loadLearningTasks(), picks, makeContext());
      await saveLearningTasks(result.tasks);
      setBatch(null);
      setSelected([]);
      onAdded(describeAppend(result.added, result.skipped));
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Could not add the tasks. Please try again.");
    } finally {
      setAdding(false);
    }
  }

  function discardBatch() {
    setBatch(null);
    setSelected([]);
    setNotice(null);
  }

  function reset() {
    setForm(TASK_FORM_DEFAULTS);
    discardBatch();
    request.reset();
  }

  return {
    form,
    batch,
    selected,
    selectedCount: selected.filter(Boolean).length,
    notice,
    busy: request.pending,
    adding,
    error: request.error,
    update,
    generate,
    toggleSelected,
    setAllSelected,
    addSelected,
    discardBatch,
    reset,
  };
}

export type GenerateTasksState = ReturnType<typeof useGenerateTasks>;
