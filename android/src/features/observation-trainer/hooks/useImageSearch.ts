// src/features/observation-trainer/hooks/useImageSearch.ts
/**
 * Finds photos for the Observation Trainer. The first match loads straight away, and the user can
 * tap another result to swap it in. A newer search or pick cancels the older one.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { useRequest } from "@/hooks/useRequest";
import type { ImageInput } from "@/lib/image";
import { findObservationImages } from "../lib/generators";
import { loadCandidateImage } from "../lib/image-search";
import type { ImageCandidate } from "../types";

export function useImageSearch(onImage: (image: ImageInput) => void) {
  const { settings } = useAiSettings();
  const search = useRequest(findObservationImages);
  const load = useRequest(loadCandidateImage);
  const [chosenId, setChosenId] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => () => controllerRef.current?.abort(), []);

  const pick = useCallback(
    async (candidate: ImageCandidate, signal: AbortSignal) => {
      const image = await load.run(candidate);
      if (!image || signal.aborted) return;
      setChosenId(candidate.id);
      onImage(image);
    },
    [load, onImage],
  );

  const find = useCallback(
    async (requirements: string) => {
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;
      setChosenId(null);
      const found = await search.run(settings, requirements, controller.signal);
      if (!found || controller.signal.aborted) return;
      await pick(found.candidates[0], controller.signal);
    },
    [search, settings, pick],
  );

  const choose = useCallback(
    async (candidate: ImageCandidate) => {
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;
      await pick(candidate, controller.signal);
    },
    [pick],
  );

  const reset = useCallback(() => {
    controllerRef.current?.abort();
    search.reset();
    load.reset();
    setChosenId(null);
  }, [search, load]);

  return {
    query: search.data?.query ?? null,
    candidates: search.data?.candidates ?? [],
    chosenId,
    pending: search.pending || load.pending,
    error: search.error ?? load.error,
    find,
    choose,
    clearChoice: () => setChosenId(null),
    reset,
  };
}
