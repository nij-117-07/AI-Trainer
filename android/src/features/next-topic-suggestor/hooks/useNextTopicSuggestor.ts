// src/features/next-topic-suggestor/hooks/useNextTopicSuggestor.ts
/** Holds the suggestion form and last result, saved on the device, and runs the request. */
import { useEffect, useState } from "react";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { useRequest } from "@/hooks/useRequest";
import { loadDocument, saveDocument } from "@/lib/document-store";
import { DEFAULT_NEXT_TOPIC_FORM, NEXT_TOPIC_DRAFT_KEY, normalizeNextTopicDraft } from "../lib/draft";
import { suggestNextTopics } from "../lib/generator";
import type { NextTopicFormValues, NextTopicResult } from "../types";

export function useNextTopicSuggestor() {
  const { settings } = useAiSettings();
  const [form, setForm] = useState<NextTopicFormValues>(DEFAULT_NEXT_TOPIC_FORM);
  const [result, setResult] = useState<NextTopicResult | null>(null);
  const [hydrated, setHydrated] = useState(false);
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
    saveDocument(NEXT_TOPIC_DRAFT_KEY, { form, result }).catch(() => undefined);
  }, [hydrated, form, result]);

  function update<K extends keyof NextTopicFormValues>(key: K, value: NextTopicFormValues[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function suggest() {
    const next = await request.run(settings, form);
    if (next) setResult(next);
  }

  function reset() {
    setForm(DEFAULT_NEXT_TOPIC_FORM);
    setResult(null);
    request.reset();
  }

  return {
    form,
    pending: request.pending,
    error: request.error,
    result,
    update,
    suggest,
    reset,
  };
}

export type NextTopicSuggestorState = ReturnType<typeof useNextTopicSuggestor>;
