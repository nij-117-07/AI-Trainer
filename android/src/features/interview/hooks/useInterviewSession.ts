// src/features/interview/hooks/useInterviewSession.ts
/**
 * Runs the interview loop: session manager, question, answer review, then progress tracking. The
 * session lives on the device, and every AI step waits for the user's Proceed, Edit or Regenerate.
 * Each model call gets its own AbortSignal, and a cancelled call never changes the session.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { useAiSettings } from "@/features/ai-settings/providers/AiSettingsProvider";
import { loadDocument, removeDocument, saveDocument } from "@/lib/document-store";
import { decideNextAction, generateQuestion, reviewAnswer, trackProgress } from "../lib/generators";
import { INTERVIEW_KEYS, restoreSession } from "../lib/persistence";
import {
  advanceAfterProgress,
  createSession,
  lastEntry,
  questionTypeFor,
  remainingMinutes,
  undoProgress,
  upsertHistory,
  withAskedQuestion,
} from "../lib/session-model";
import type {
  Directive,
  InterviewSessionState,
  InterviewSetup,
  SessionHistoryEntry,
} from "../types";

export type InterviewPending = "decide" | "question" | "review" | "progress" | null;

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}

export function useInterviewSession() {
  const { settings } = useAiSettings();
  const [state, setState] = useState<InterviewSessionState | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [pending, setPending] = useState<InterviewPending>(null);
  const [error, setError] = useState<string | null>(null);
  const controller = useRef<AbortController | null>(null);

  useEffect(() => {
    let active = true;
    loadDocument<unknown>(INTERVIEW_KEYS.session, null)
      .then((saved) => {
        if (active) setState(restoreSession(saved));
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!loaded) return;
    const write = state ? saveDocument(INTERVIEW_KEYS.session, state) : removeDocument(INTERVIEW_KEYS.session);
    write.catch(() => undefined);
  }, [loaded, state]);

  useEffect(() => () => controller.current?.abort(), []);

  const run = useCallback(
    async <T>(call: Exclude<InterviewPending, null>, task: (signal: AbortSignal) => Promise<T>): Promise<T | null> => {
      controller.current?.abort();
      const current = new AbortController();
      controller.current = current;
      setError(null);
      setPending(call);
      try {
        const result = await task(current.signal);
        return current.signal.aborted ? null : result;
      } catch (err) {
        if (!current.signal.aborted) setError(messageOf(err));
        return null;
      } finally {
        if (controller.current === current) {
          controller.current = null;
          setPending(null);
        }
      }
    },
    [],
  );

  const update = useCallback((change: (prev: InterviewSessionState) => InterviewSessionState) => {
    setState((prev) => (prev ? change(prev) : prev));
  }, []);

  const decide = useCallback(
    async (current: InterviewSessionState) => {
      const decision = await run("decide", (signal) =>
        decideNextAction(
          settings,
          {
            setup: current.setup,
            sessionHistory: current.sessionHistory,
            progressState: current.progressState,
            questionsAsked: current.questionsAsked,
            timeRemainingMinutes: remainingMinutes(current.setup, current.startedAt, Date.now()),
          },
          signal,
        ),
      );
      if (!decision) return;
      update((prev) => ({
        ...prev,
        decision,
        stage: decision.nextAction === "end_session" ? "report" : "decide",
      }));
    },
    [run, settings, update],
  );

  const generate = useCallback(
    async (current: InterviewSessionState) => {
      const question = await run("question", (signal) =>
        generateQuestion(
          settings,
          {
            setup: current.setup,
            directive: current.decision?.directive ?? {},
            previous: lastEntry(current.sessionHistory),
            allQuestionsAsked: current.allQuestionsAsked,
            questionType: questionTypeFor(current.decision, current.setup),
          },
          signal,
        ),
      );
      if (!question) return;
      update((prev) => ({ ...prev, currentQuestion: question, stage: "question" }));
    },
    [run, settings, update],
  );

  const review = useCallback(
    async (current: InterviewSessionState, answer: string) => {
      const question = current.currentQuestion;
      if (!question) return;
      const result = await run("review", (signal) =>
        reviewAnswer(
          settings,
          {
            question: question.question,
            candidateAnswer: answer,
            expectedKeywords: question.expectedKeywords,
            evaluationCriteria: question.evaluationCriteria,
            redFlags: question.redFlags,
            sampleStrongAnswer: question.sampleStrongAnswer,
            sampleWeakAnswer: question.sampleWeakAnswer,
            positionLevel: current.setup.positionLevel,
            questionType: question.questionType,
            difficulty: question.difficulty,
          },
          signal,
        ),
      );
      if (!result) return;
      const entry: SessionHistoryEntry = {
        question: question.question,
        answer,
        topic: question.topic,
        questionType: question.questionType,
        difficulty: question.difficulty,
        review: result,
      };
      update((prev) => ({
        ...prev,
        latestReview: result,
        currentAnswer: answer,
        sessionHistory: upsertHistory(prev.sessionHistory, entry),
        allQuestionsAsked: withAskedQuestion(prev.allQuestionsAsked, entry.question),
        stage: "review",
      }));
    },
    [run, settings, update],
  );

  const track = useCallback(
    async (current: InterviewSessionState) => {
      const review = current.latestReview;
      if (!review) return;
      const question = current.currentQuestion;
      const result = await run("progress", (signal) =>
        trackProgress(
          settings,
          {
            profile: current.progressState,
            review,
            questionTopic: question?.topic ?? "",
            questionType: question?.questionType ?? current.setup.interviewType,
          },
          signal,
        ),
      );
      if (!result) return;
      update((prev) => ({
        ...prev,
        progressSnapshot: current.progressState,
        progressState: result.profile,
        performanceTrend: result.performanceTrend,
        stage: "progress",
      }));
    },
    [run, settings, update],
  );

  const start = useCallback(
    async (setup: InterviewSetup) => {
      if (pending) return;
      const initial = createSession(setup, new Date().toISOString());
      setState(initial);
      await decide(initial);
    },
    [decide, pending],
  );

  const proceedFromDecide = useCallback(() => {
    if (state) void generate(state);
  }, [generate, state]);

  const proceedFromQuestion = useCallback(
    (questionText: string) =>
      update((prev) =>
        prev.currentQuestion
          ? {
              ...prev,
              currentQuestion: { ...prev.currentQuestion, question: questionText || prev.currentQuestion.question },
              stage: "answer",
            }
          : prev,
      ),
    [update],
  );

  const submitAnswer = useCallback(
    (answer: string) => {
      if (state) void review(state, answer);
    },
    [review, state],
  );

  const proceedFromReview = useCallback(() => {
    if (state) void track(state);
  }, [state, track]);

  const proceedFromProgress = useCallback(() => {
    if (!state) return;
    const next = advanceAfterProgress(state, Date.now());
    setState(next);
    if (next.stage !== "report") void decide(next);
  }, [decide, state]);

  const editDecision = useCallback(
    (directive: Directive) =>
      update((prev) => (prev.decision ? { ...prev, decision: { ...prev.decision, directive } } : prev)),
    [update],
  );

  const redecide = useCallback(() => {
    if (state) void decide(state);
  }, [decide, state]);

  const regenerateQuestion = useCallback(() => {
    if (state) void generate(state);
  }, [generate, state]);

  const undoLastProgress = useCallback(() => update(undoProgress), [update]);

  const endInterview = useCallback(() => update((prev) => ({ ...prev, stage: "report" })), [update]);

  const reset = useCallback(() => {
    controller.current?.abort();
    controller.current = null;
    setPending(null);
    setError(null);
    setState(null);
  }, []);

  return {
    state,
    loaded,
    pending,
    error,
    start,
    proceedFromDecide,
    proceedFromQuestion,
    submitAnswer,
    proceedFromReview,
    proceedFromProgress,
    editDecision,
    redecide,
    regenerateQuestion,
    undoLastProgress,
    endInterview,
    reset,
  };
}
