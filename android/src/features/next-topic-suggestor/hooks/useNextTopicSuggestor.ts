// src/features/next-topic-suggestor/hooks/useNextTopicSuggestor.ts
/** Holds the suggestion form and last result, saved on the device, and runs the request. */
import { useEffect, useState } from "react";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { useRequest } from "@/hooks/useRequest";
import { loadDocument, saveDocument } from "@/lib/document-store";
import { keptCount } from "@/lib/kept";
import { DEFAULT_NEXT_TOPIC_FORM, NEXT_TOPIC_DRAFT_KEY, normalizeNextTopicDraft } from "../lib/draft";
import { suggestNextTopics } from "../lib/generator";
import { mergeTopicBatch, toggleTopicKept } from "../lib/result";
import type { NextTopicFormValues, NextTopicResult } from "../types";

const SAVE_FAILED_MESSAGE = "Changes couldn't be saved. They'll try again.";

export function useNextTopicSuggestor() {
  const { settings } = useAiSettings();
  const [form, setForm] = useState<NextTopicFormValues>(DEFAULT_NEXT_TOPIC_FORM);
  const [result, setResult] = useState<NextTopicResult | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const request = useRequest(suggestNextTopics);

  useEffect(() => {
    let active = true;
    loadDocument<unknown>(NEXT_TOPIC_DRAFT_KEY, null)
      .then((raw) => {
        if (!active) return;
        const draft = normalizeNextTopicDraft(raw);
        setForm(draft.form);
        setResult(draft.result);
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setHydrated(true);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveDocument(NEXT_TOPIC_DRAFT_KEY, { form, result }).then(
      () => setSaveFailed(false),
      () => setSaveFailed(true),
    );
  }, [hydrated, form, result]);

  function update<K extends keyof NextTopicFormValues>(key: K, value: NextTopicFormValues[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function suggest() {
    const next = await request.run(settings, form);
    if (next) setResult((prev) => mergeTopicBatch(prev, next));
  }

  function toggleKept(index: number) {
    setResult((prev) => (prev ? toggleTopicKept(prev, index) : prev));
  }

  function reset() {
    setForm(DEFAULT_NEXT_TOPIC_FORM);
    setResult(null);
    request.reset();
  }

  return {
    form,
    pending: request.pending,
    error: request.error ?? (saveFailed ? SAVE_FAILED_MESSAGE : null),
    result,
    keptCount: keptCount(result?.recommendations ?? []),
    update,
    suggest,
    toggleKept,
    reset,
  };
}

export type NextTopicSuggestorState = ReturnType<typeof useNextTopicSuggestor>;
