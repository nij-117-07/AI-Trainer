// src/features/interview/hooks/useInterviewScreen.ts
/**
 * Session page state: the interview session plus the edit buffers for each stage, so the stage body
 * and the footer share them. The session reloads each time the page is focused, so a session
 * started on the New interview page shows up when the user comes back.
 */
import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import type { Directive } from "../types";
import { useInterviewSession } from "./useInterviewSession";
import { useSyncedDraft } from "./useSyncedDraft";

const NO_DIRECTIVE: Directive = {};

export function useInterviewScreen() {
  const interview = useInterviewSession();
  const { state, reload } = interview;
  const savedDirective = state?.decision?.directive ?? NO_DIRECTIVE;
  const savedAnswer = state?.currentAnswer ?? "";

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  const [directiveDraft, setDirectiveDraft] = useSyncedDraft<Directive>(savedDirective);
  const [directiveEditing, setDirectiveEditing] = useState(false);
  const [answer, setAnswer] = useState("");
  const [reviewDraft, setReviewDraft] = useSyncedDraft(savedAnswer);
  const [reviewEditing, setReviewEditing] = useState(false);

  function saveDirective() {
    interview.editDecision(directiveDraft);
    setDirectiveEditing(false);
  }

  async function submitAnswer() {
    const text = answer.trim();
    if (!text) return;
    if (await interview.submitAnswer(text)) setAnswer("");
  }

  function reReview() {
    const text = reviewDraft.trim();
    if (!text) return;
    setReviewEditing(false);
    void interview.submitAnswer(text);
  }

  return {
    ...interview,
    directive: {
      draft: directiveDraft,
      setDraft: setDirectiveDraft,
      editing: directiveEditing,
      startEdit: () => setDirectiveEditing(true),
      cancel: () => {
        setDirectiveDraft(savedDirective);
        setDirectiveEditing(false);
      },
      save: saveDirective,
    },
    answer: {
      value: answer,
      setValue: setAnswer,
      submit: submitAnswer,
    },
    review: {
      draft: reviewDraft,
      setDraft: setReviewDraft,
      editing: reviewEditing,
      startEdit: () => setReviewEditing(true),
      cancel: () => {
        setReviewDraft(savedAnswer);
        setReviewEditing(false);
      },
      reReview,
    },
  };
}

export type InterviewScreen = ReturnType<typeof useInterviewScreen>;
