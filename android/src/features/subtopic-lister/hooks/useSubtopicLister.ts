// src/features/subtopic-lister/hooks/useSubtopicLister.ts
/** Loads the learner's completed roadmap items each time the screen opens, and runs the suggestion request. */
import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { loadRoadmaps } from "@/features/roadmap/lib/roadmap-store";
import { useRequest } from "@/hooks/useRequest";
import { suggestSubtopics } from "../lib/generators";
import { summarizeLearned } from "../lib/learned";
import type { LearnedTopic } from "../types";

export function useSubtopicLister() {
  const { settings } = useAiSettings();
  const [learned, setLearned] = useState<LearnedTopic[] | null>(null);
  const request = useRequest(suggestSubtopics);

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

  async function suggest() {
    await request.run(settings, learned ?? []);
  }

  return {
    learned,
    pending: request.pending,
    error: request.error,
    result: request.data,
    suggest,
    reset: request.reset,
  };
}

export type SubtopicListerState = ReturnType<typeof useSubtopicLister>;
