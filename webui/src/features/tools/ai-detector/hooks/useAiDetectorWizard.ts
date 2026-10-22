// src/features/tools/ai-detector/hooks/useAiDetectorWizard.ts
/**
 * Orchestrates the 3-step AI Detector wizard (detect → humanize → recheck).
 * Owns the persisted draft (step + results + original text), wraps the three
 * Server Actions with useToolRequest for pending/error UX, and exposes the
 * button-driven step transitions and prefill values for each step form.
 */
"use client";

import { useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import { usePersistedState } from "@/features/learning/explainer/hooks/usePersistedState";
import { useToolRequest } from "@/features/learning/explainer/hooks/useToolRequest";
import { detectTextAction } from "../actions/detect";
import { humanizeTextAction } from "../actions/humanize";
import {
  formatDetectionFeedback,
  INITIAL_WIZARD_DRAFT,
  WIZARD_STORAGE_KEY,
  type AIDetectionResponse,
  type DetectFormValues,
  type HumanizeFormValues,
  type HumanizerResponse,
  type WizardDraft,
  type WizardStep,
} from "../types";

function formatScore(score: number): string {
  return `${Math.round(score * 100)}% AI`;
}

export function useAiDetectorWizard() {
  const draftState = usePersistedState<WizardDraft>({
    key: WIZARD_STORAGE_KEY,
    initialValue: INITIAL_WIZARD_DRAFT,
  });
  const draft = draftState.value;

  // Ref keeps the latest draft available inside async success callbacks.
  const draftRef = useRef(draft);
  useEffect(() => {
    draftRef.current = draft;
  }, [draft]);

  const patch = useCallback(
    (partial: Partial<WizardDraft>) => {
      draftState.setValue({ ...draftRef.current, ...partial });
    },
    [draftState]
  );

  const detectReq = useToolRequest<DetectFormValues, AIDetectionResponse>({
    run: detectTextAction,
    onSuccess: (result) => {
      patch({ detect: result });
      toast.success("Analysis complete", {
        description: `${result.verdict} · ${formatScore(result.ai_score)}`,
      });
    },
  });

  const humanizeReq = useToolRequest<HumanizeFormValues, HumanizerResponse>({
    run: humanizeTextAction,
    onSuccess: (result) => {
      patch({ humanize: result });
      toast.success("Text humanized", {
        description: `${Math.round(result.confidence * 100)}% confidence it reads as human-written.`,
      });
    },
  });

  const recheckReq = useToolRequest<DetectFormValues, AIDetectionResponse>({
    run: detectTextAction,
    onSuccess: (result) => {
      patch({ recheck: result });
      toast.success("Re-detection complete", {
        description: `${result.verdict} · ${formatScore(result.ai_score)}`,
      });
    },
  });

  const latestDetection = draft.recheck ?? draft.detect;

  const submitDetect = useCallback(
    (values: DetectFormValues) => {
      patch({ originalText: values.text_to_check });
      detectReq.execute(values);
    },
    [patch, detectReq]
  );

  const submitHumanize = useCallback(
    (values: HumanizeFormValues) => {
      humanizeReq.execute(values);
    },
    [humanizeReq]
  );

  const submitRecheck = useCallback(
    (values: DetectFormValues) => {
      recheckReq.execute(values);
    },
    [recheckReq]
  );

  // Step transitions: only reachable through explicit CTA button clicks.
  const advanceToHumanize = useCallback(() => {
    if (!draftRef.current.detect) return;
    patch({ step: "humanize" });
  }, [patch]);

  const advanceToRecheck = useCallback(() => {
    if (!draftRef.current.humanize) return;
    patch({ step: "recheck" });
  }, [patch]);

  const humanizeAgain = useCallback(() => {
    if (!draftRef.current.humanize) return;
    patch({ step: "humanize" });
  }, [patch]);

  const goToDetect = useCallback(() => {
    patch({ step: "detect" });
  }, [patch]);

  const startOver = useCallback(() => {
    detectReq.reset();
    humanizeReq.reset();
    recheckReq.reset();
    draftState.clear();
  }, [detectReq, humanizeReq, recheckReq, draftState]);

  return {
    step: draft.step as WizardStep,
    draft,
    hydrated: draftState.hydrated,
    persistStatus: draftState.status,
    isBusy: detectReq.isPending || humanizeReq.isPending || recheckReq.isPending,
    detect: {
      isPending: detectReq.isPending,
      error: detectReq.error,
      submit: submitDetect,
    },
    humanize: {
      isPending: humanizeReq.isPending,
      error: humanizeReq.error,
      submit: submitHumanize,
    },
    recheck: {
      isPending: recheckReq.isPending,
      error: recheckReq.error,
      submit: submitRecheck,
    },
    canHumanize: draft.detect !== null,
    canRecheck: draft.humanize !== null,
    latestDetection,
    feedbackPrefill: latestDetection ? formatDetectionFeedback(latestDetection) : "",
    humanizeTextPrefill: draft.humanize?.humanized_text || draft.originalText,
    recheckTextPrefill: draft.humanize?.humanized_text || draft.originalText,
    advanceToHumanize,
    advanceToRecheck,
    humanizeAgain,
    goToDetect,
    startOver,
  };
}

export type AiDetectorWizard = ReturnType<typeof useAiDetectorWizard>;
