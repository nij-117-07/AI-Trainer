// src/features/subtopic-lister/hooks/useSubtopicLister.ts
/**
 * Holds the suggestion form and last result, saved on the device. The form page and the result page
 * each use this hook, and each reads the saved draft when it comes into view, so the result page
 * shows a batch made on the form page. Also loads the learner's completed roadmap items each time
 * a page opens, and runs the request.
 */
import { useCallback, useEffect, useState } from "react";
import { useFocusEffect } from "expo-router";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { loadRoadmaps } from "@/features/roadmap/lib/roadmap-store";
import { useRequest } from "@/hooks/useRequest";
import { loadDocument, saveDocument } from "@/lib/document-store";
import { keptCount } from "@/lib/kept";
import { suggestSubtopics } from "../lib/generators";
import { DEFAULT_SUBTOPIC_FORM, normalizeSubtopicDraft, SUBTOPIC_DRAFT_KEY } from "../lib/draft";
import { summarizeLearned } from "../lib/learned";
import { mergeSubtopicBatch, toggleSubtopicKept } from "../lib/result";
import type { LearnedTopic, SubtopicFormValues, SubtopicResult } from "../types";

const SAVE_FAILED_MESSAGE = "Changes couldn't be saved. They'll try again.";

export function useSubtopicLister() {
  const { settings } = useAiSettings();
  const [form, setForm] = useState<SubtopicFormValues>(DEFAULT_SUBTOPIC_FORM);
  const [result, setResult] = useState<SubtopicResult | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const [learned, setLearned] = useState<LearnedTopic[] | null>(null);
  const request = useRequest(suggestSubtopics);

  useFocusEffect(
    useCallback(() => {
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
    }, []),
  );

  useEffect(() => {
    if (!hydrated) return;
    saveDocument(SUBTOPIC_DRAFT_KEY, { form, result }).then(
      () => setSaveFailed(false),
      () => setSaveFailed(true),
    );
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
    if (!next) return false;
    setResult((prev) => mergeSubtopicBatch(prev, next));
    return true;
  }

  function toggleKept(index: number) {
    setResult((prev) => (prev ? toggleSubtopicKept(prev, index) : prev));
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
    error: request.error ?? (saveFailed ? SAVE_FAILED_MESSAGE : null),
    result,
    keptCount: keptCount(result?.subtopics ?? []),
    update,
    suggest,
    toggleKept,
    reset,
  };
}

export type SubtopicListerState = ReturnType<typeof useSubtopicLister>;
