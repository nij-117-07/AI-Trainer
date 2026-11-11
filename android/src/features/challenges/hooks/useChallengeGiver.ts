// src/features/challenges/hooks/useChallengeGiver.ts
/** Holds the challenge form and last result, saved on the device, and runs the request. */
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { SAVE_FAILED_MESSAGE, useSavedDraft } from "@/features/projects/hooks/useSavedDraft";
import { useRequest } from "@/hooks/useRequest";
import { keptCount, mergeKept } from "@/lib/kept";
import { giveChallenges } from "../lib/generators";
import { toChallengeDraft } from "../lib/normalise";
import { DEFAULT_CHALLENGES } from "../lib/validate";
import type { Challenge, ChallengeFormValues, ChallengeResult } from "../types";

const STORAGE_KEY = "learning.challenges.v1";

const DEFAULTS: ChallengeFormValues = {
  topic: "",
  challengeType: "solve",
  skillLevel: "beginner",
  timeMinutes: 30,
  numChallenges: DEFAULT_CHALLENGES,
  instructions: "",
};

const parseDraft = (raw: unknown) => toChallengeDraft(raw, DEFAULTS);

const keyOf = (challenge: Challenge) => challenge.title.trim().toLowerCase();

export function useChallengeGiver() {
  const { settings } = useAiSettings();
  const draft = useSavedDraft<ChallengeFormValues, ChallengeResult>(STORAGE_KEY, DEFAULTS, parseDraft);
  const request = useRequest(giveChallenges);
  const { form, setForm, setResult } = draft;

  function update<K extends keyof ChallengeFormValues>(key: K, value: ChallengeFormValues[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function give() {
    const next = await request.run(settings, form);
    if (!next) return;
    setResult((prev) => ({ ...next, challenges: mergeKept(prev?.challenges ?? [], next.challenges, keyOf) }));
  }

  function toggleKept(index: number) {
    setResult((prev) =>
      prev && {
        ...prev,
        challenges: prev.challenges.map((challenge, i) => (i === index ? { ...challenge, kept: !challenge.kept } : challenge)),
      },
    );
  }

  function reset() {
    draft.reset();
    request.reset();
  }

  return {
    form,
    pending: request.pending,
    error: request.error,
    saveError: draft.saveFailed ? SAVE_FAILED_MESSAGE : null,
    result: draft.result,
    keptCount: keptCount(draft.result?.challenges ?? []),
    update,
    give,
    toggleKept,
    reset,
  };
}

export type ChallengeGiverState = ReturnType<typeof useChallengeGiver>;
