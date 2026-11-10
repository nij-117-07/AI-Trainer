// src/features/subtopic-lister/hooks/useSubtopicLister.ts
/**
 * Holds the suggestion form and last result, saved on the device. Also loads the learner's completed
 * roadmap items each time the screen opens, and runs the request.
 */
import { useCallback, useEffect, useState } from "react";
import { useFocusEffect } from "expo-router";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { loadRoadmaps } from "@/features/roadmap/lib/roadmap-store";
import { useRequest } from "@/hooks/useRequest";
import { loadDocument, saveDocument } from "@/lib/document-store";
import { suggestSubtopics } from "../lib/generators";
import { DEFAULT_SUBTOPIC_FORM, normalizeSubtopicDraft, SUBTOPIC_DRAFT_KEY } from "../lib/draft";
import { summarizeLearned } from "../lib/learned";
import type { LearnedTopic, SubtopicFormValues, SubtopicResult } from "../types";

export function useSubtopicLister() {
  const { settings } = useAiSettings();
  const [form, setForm] = useState<SubtopicFormValues>(DEFAULT_SUBTOPIC_FORM);
  const [result, setResult] = useState<SubtopicResult | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [learned, setLearned] = useState<LearnedTopic[] | null>(null);
  const request = useRequest(suggestSubtopics);

  useEffect(() => {
    let active = true;
    loadDocument<unknown>(SUBTOPIC_DRAFT_KEY, null)
      .then((raw) => {
        if (!active) return;
        const draft = normalizeSubtopicDraft(raw);
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
    saveDocument(SUBTOPIC_DRAFT_KEY, { form, result }).catch(() => undefined);
  }, [hydrated, form, result]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      loadRoadmaps()
        .then((roadmaps) => {
          if (active) setLearned(summarizeLearned(roadmaps));
        })
        .catch(() => {
          if (active) setLearned([]);
        });
      return () => {
        active = false;
      };
    }, []),
  );

  function update<K extends keyof SubtopicFormValues>(key: K, value: SubtopicFormValues[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function suggest() {
    const next = await request.run(settings, form, learned ?? []);
    if (next) setResult(next);
  }

  function reset() {
    setForm(DEFAULT_SUBTOPIC_FORM);
    setResult(null);
    request.reset();
  }

  return {
    form,
    learned,
    pending: request.pending,
    error: request.error,
    result,
    update,
    suggest,
    reset,
  };
}

export type SubtopicListerState = ReturnType<typeof useSubtopicLister>;
