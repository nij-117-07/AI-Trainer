// src/features/topic-suggestions/hooks/useSuggestTopics.ts
/**
 * State for the suggest page. The form and the pending suggestions are saved on the device. Only
 * the topics the user ticks are added to the list.
 */
import { useEffect, useState } from "react";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { suggestTopics } from "@/features/guides/lib/generators";
import type { TopicRecommendation } from "@/features/guides/types";
import { useRequest } from "@/hooks/useRequest";
import { loadDocument, saveDocument } from "@/lib/document-store";
import {
  appendTopics,
  describeAppend,
  listHistory,
  normalizeDraft,
  pickTopics,
  TOPIC_DRAFT_KEY,
  TOPIC_FORM_DEFAULTS,
} from "../lib/topics";
import { loadTopics, saveTopics } from "../lib/store";
import type { TopicContext, TopicFormValues } from "../types";

function makeContext(): TopicContext {
  return { now: new Date().toISOString(), newId: () => globalThis.crypto.randomUUID() };
}

export function useSuggestTopics(onAdded: (message: string) => void) {
  const { settings } = useAiSettings();
  const [form, setForm] = useState<TopicFormValues>(TOPIC_FORM_DEFAULTS);
  const [batch, setBatch] = useState<TopicRecommendation[] | null>(null);
  const [selected, setSelected] = useState<boolean[]>([]);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const request = useRequest((values: TopicFormValues, history: string) =>
    suggestTopics(settings, values, history),
  );

  useEffect(() => {
    let active = true;
    loadDocument<unknown>(TOPIC_DRAFT_KEY, null)
      .then((savedDraft) => {
        if (!active) return;
        const draft = normalizeDraft(savedDraft);
        setForm(draft.form);
        setBatch(draft.batch);
        setSelected(draft.batch ? draft.batch.map(() => true) : []);
        setReady(true);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    saveDocument(TOPIC_DRAFT_KEY, { form, batch }).catch(() => undefined);
  }, [ready, form, batch]);

  function update<K extends keyof TopicFormValues>(key: K, value: TopicFormValues[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function generate() {
    setNotice(null);
    const current = await loadTopics().catch(() => []);
    const next = await request.run(form, listHistory(current));
    if (!next) return;
    if (next.recommendations.length === 0) {
      setNotice("No topics came back. Try again.");
      return;
    }
    setBatch(next.recommendations);
    setSelected(next.recommendations.map(() => true));
  }

  function toggleSelected(index: number) {
    setSelected((current) => current.map((on, i) => (i === index ? !on : on)));
  }

  function setAllSelected(value: boolean) {
    setSelected((current) => current.map(() => value));
  }

  async function addSelected() {
    if (!batch) return;
    const picks = pickTopics(batch, selected);
    if (picks.length === 0) return;
    setAdding(true);
    setNotice(null);
    try {
      const result = appendTopics(await loadTopics(), picks, makeContext());
      await saveTopics(result.topics);
      setBatch(null);
      setSelected([]);
      onAdded(describeAppend(result.added, result.skipped));
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Could not add the topics. Please try again.");
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
    setForm(TOPIC_FORM_DEFAULTS);
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

export type SuggestTopicsState = ReturnType<typeof useSuggestTopics>;
