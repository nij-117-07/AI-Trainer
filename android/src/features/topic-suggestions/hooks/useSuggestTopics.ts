/**
 * State for the suggest page. The form and the suggested topics are saved on the device, and each
 * suggestion keeps its ticked state. Find more keeps the ticked topics and replaces the rest. Only
 * the kept topics are added to the list.
 */
import { useEffect, useState } from "react";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { suggestTopics } from "@/features/guides/lib/generators";
import { useRequest } from "@/hooks/useRequest";
import { keptCount, mergeKept } from "@/lib/kept";
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
import type { TopicCandidate, TopicContext, TopicFormValues } from "../types";

const SAVE_FAILED_MESSAGE = "Changes couldn't be saved. They'll try again.";

function makeContext(): TopicContext {
  return { now: new Date().toISOString(), newId: () => globalThis.crypto.randomUUID() };
}

const keyOf = (topic: TopicCandidate) => topic.topicName.trim().toLowerCase();

export function useSuggestTopics(onAdded: (message: string) => void) {
  const { settings } = useAiSettings();
  const [form, setForm] = useState<TopicFormValues>(TOPIC_FORM_DEFAULTS);
  const [batch, setBatch] = useState<TopicCandidate[] | null>(null);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
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
        setReady(true);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    saveDocument(TOPIC_DRAFT_KEY, { form, batch })
      .then(() => setSaveFailed(false))
      .catch(() => setSaveFailed(true));
  }, [ready, form, batch]);

  function update<K extends keyof TopicFormValues>(key: K, value: TopicFormValues[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function generate(): Promise<boolean> {
    setNotice(null);
    const current = await loadTopics().catch(() => []);
    const next = await request.run(form, listHistory(current));
    if (!next) return false;
    if (next.recommendations.length === 0) {
      setNotice("No topics came back. Try again.");
      return false;
    }
    const fresh = next.recommendations.map((topic) => ({ ...topic, kept: false }));
    setBatch((prev) => mergeKept(prev ?? [], fresh, keyOf));
    return true;
  }

  function toggleKept(index: number) {
    setBatch((current) => current?.map((topic, i) => (i === index ? { ...topic, kept: !topic.kept } : topic)) ?? null);
  }

  function setAllKept(value: boolean) {
    setBatch((current) => current?.map((topic) => ({ ...topic, kept: value })) ?? null);
  }

  async function keepTopics() {
    if (!batch) return;
    const picks = pickTopics(batch, batch.map((topic) => topic.kept));
    if (picks.length === 0) return;
    setAdding(true);
    setNotice(null);
    try {
      const result = appendTopics(await loadTopics(), picks, makeContext());
      await saveTopics(result.topics);
      setBatch(null);
      onAdded(describeAppend(result.added, result.skipped));
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Could not add the topics. Please try again.");
    } finally {
      setAdding(false);
    }
  }

  function discardBatch() {
    setBatch(null);
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
    keptCount: keptCount(batch ?? []),
    notice,
    busy: request.pending,
    adding,
    error: request.error,
    saveError: saveFailed ? SAVE_FAILED_MESSAGE : null,
    update,
    generate,
    toggleKept,
    setAllKept,
    keepTopics,
    discardBatch,
    reset,
  };
}

export type SuggestTopicsState = ReturnType<typeof useSuggestTopics>;
