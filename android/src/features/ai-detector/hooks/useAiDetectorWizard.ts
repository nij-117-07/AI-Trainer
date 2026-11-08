// src/features/ai-detector/hooks/useAiDetectorWizard.ts
/**
 * Runs the three-step AI Detector wizard (detect, humanize, re-detect). Keeps the draft on the
 * device, locks later steps until the earlier result exists, and advances only on button presses.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { loadDocument, saveDocument } from "@/lib/document-store";
import { useRequest } from "@/hooks/useRequest";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { detectAiText, humanizeText } from "../lib/generators";
import { formatDetectionFeedback } from "../lib/analysis";
import { AI_DETECTOR_STORAGE_KEY, INITIAL_WIZARD_DRAFT, parseDraft } from "../lib/persistence";
import type { DetectFormValues, HumanizeFormValues, WizardDraft } from "../types";

export function useAiDetectorWizard() {
  const { settings } = useAiSettings();
  const [draft, setDraft] = useState<WizardDraft>(INITIAL_WIZARD_DRAFT);
  const [loaded, setLoaded] = useState(false);
  const controllerRef = useRef<AbortController | null>(null);

  const detectRequest = useRequest(detectAiText);
  const humanizeRequest = useRequest(humanizeText);
  const recheckRequest = useRequest(detectAiText);

  const signal = useCallback(() => {
    controllerRef.current ??= new AbortController();
    return controllerRef.current.signal;
  }, []);

  useEffect(() => {
    let active = true;
    loadDocument<unknown>(AI_DETECTOR_STORAGE_KEY, null)
      .then((saved) => {
        if (active) setDraft(parseDraft(saved));
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setLoaded(true);
      });
    return () => {
      active = false;
      controllerRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (!loaded) return;
    saveDocument(AI_DETECTOR_STORAGE_KEY, draft).catch(() => undefined);
  }, [loaded, draft]);

  const isBusy = detectRequest.pending || humanizeRequest.pending || recheckRequest.pending;

  const submitDetect = useCallback(
    async (values: DetectFormValues) => {
      const result = await detectRequest.run(settings, values, signal());
      if (result) {
        setDraft((prev) => ({ ...prev, originalText: values.textToCheck.trim(), detect: result }));
      }
    },
    [detectRequest.run, settings, signal],
  );

  const submitHumanize = useCallback(
    async (values: HumanizeFormValues) => {
      const result = await humanizeRequest.run(settings, values, signal());
      if (result) setDraft((prev) => ({ ...prev, humanize: result }));
    },
    [humanizeRequest.run, settings, signal],
  );

  const submitRecheck = useCallback(
    async (values: DetectFormValues) => {
      const result = await recheckRequest.run(settings, values, signal());
      if (result) setDraft((prev) => ({ ...prev, recheck: result }));
    },
    [recheckRequest.run, settings, signal],
  );

  const advanceToHumanize = useCallback(() => {
    setDraft((prev) => (prev.detect ? { ...prev, step: "humanize" } : prev));
  }, []);

  const advanceToRecheck = useCallback(() => {
    setDraft((prev) => (prev.humanize ? { ...prev, step: "recheck" } : prev));
  }, []);

  const humanizeAgain = useCallback(() => {
    setDraft((prev) => (prev.humanize ? { ...prev, step: "humanize" } : prev));
  }, []);

  const goToDetect = useCallback(() => {
    setDraft((prev) => ({ ...prev, step: "detect" }));
  }, []);

  const startOver = useCallback(() => {
    if (isBusy) return;
    detectRequest.reset();
    humanizeRequest.reset();
    recheckRequest.reset();
    setDraft(INITIAL_WIZARD_DRAFT);
  }, [isBusy, detectRequest.reset, humanizeRequest.reset, recheckRequest.reset]);

  const latestDetection = draft.recheck ?? draft.detect;

  return {
    step: draft.step,
    draft,
    loaded,
    isBusy,
    detect: { isPending: detectRequest.pending, error: detectRequest.error, submit: submitDetect },
    humanize: { isPending: humanizeRequest.pending, error: humanizeRequest.error, submit: submitHumanize },
    recheck: { isPending: recheckRequest.pending, error: recheckRequest.error, submit: submitRecheck },
    canHumanize: draft.detect !== null,
    canRecheck: draft.humanize !== null,
    feedbackPrefill: latestDetection ? formatDetectionFeedback(latestDetection) : "",
    humanizeTextPrefill: draft.humanize?.humanizedText || draft.originalText,
    recheckTextPrefill: draft.humanize?.humanizedText || draft.originalText,
    advanceToHumanize,
    advanceToRecheck,
    humanizeAgain,
    goToDetect,
    startOver,
  };
}

export type AiDetectorWizard = ReturnType<typeof useAiDetectorWizard>;
