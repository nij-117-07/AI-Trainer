// src/features/practice/interview/hooks/useInterviewSession.ts
/**
 * Orchestrates the interview loop: runs the four backend calls in order, owns
 * the client-side InterviewSessionState (persisted to localStorage), and
 * exposes the per-stage gate handlers (proceed / edit / regenerate / undo).
 */
"use client";

import { useCallback, useState } from "react";
import { usePersistedState } from "@/features/learning/explainer/hooks/usePersistedState";
import {
  sessionDecideAction,
  generateQuestionAction,
  reviewAnswerAction,
  trackProgressAction,
} from "../actions";
import type {
  Directive,
  InterviewSessionState,
  InterviewSetupValues,
  QuestionType,
  SessionHistoryEntry,
} from "../types";

const SESSION_KEY = "practice.interview.session.v1";

export type PendingCall = "decide" | "question" | "review" | "progress" | null;

function remainingMinutes(setup: InterviewSetupValues, startedAt: string): number {
  const elapsedMs = Date.now() - new Date(startedAt).getTime();
  const elapsedMin = Number.isFinite(elapsedMs) ? Math.floor(elapsedMs / 60_000) : 0;
  return Math.max(0, setup.duration_minutes - elapsedMin);
}

export function useInterviewSession() {
  const session = usePersistedState<InterviewSessionState | null>({
    key: SESSION_KEY,
    initialValue: null,
  });
  const [pending, setPending] = useState<PendingCall>(null);
  const [error, setError] = useState<string | null>(null);

  const state = session.value;
  const isPending = pending !== null;

  const update = useCallback(
    (patch: Partial<InterviewSessionState> | ((prev: InterviewSessionState) => InterviewSessionState)) => {
      session.setValue((prev) => {
        if (!prev) return prev;
        return typeof patch === "function" ? patch(prev) : { ...prev, ...patch };
      });
    },
    [session]
  );

  const run = useCallback(async <T,>(call: PendingCall, task: () => Promise<T>): Promise<T | null> => {
    setError(null);
    setPending(call);
    try {
      return await task();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      return null;
    } finally {
      setPending(null);
    }
  }, []);

  /** ① Session manager: pick the next strategic action. */
  const decide = useCallback(
    async (current: InterviewSessionState) => {
      const response = await run("decide", () =>
        sessionDecideAction({
          setup: current.setup,
          session_history: current.session_history,
          progress_state: current.progress_state,
          questions_asked: current.questions_asked,
          max_questions: current.setup.max_questions,
          time_remaining_minutes: remainingMinutes(current.setup, current.started_at),
        })
      );
      if (!response) return;
      update({ decision: response, stage: response.next_action === "end_session" ? "report" : "decide" });
    },
    [run, update]
  );

  /** ② Question generator: turn the (possibly edited) directive into a question. */
  const generate = useCallback(
    async (current: InterviewSessionState) => {
      const last = current.session_history[current.session_history.length - 1];
      const response = await run("question", () =>
        generateQuestionAction({
          setup: current.setup,
          directive: current.decision?.directive ?? {},
          previous_question: last?.question,
          previous_answer: last?.answer,
          previous_review: last?.review,
          all_questions_asked: current.all_questions_asked,
        })
      );
      if (!response) return;
      const questionType =
        (current.decision?.directive.question_type as string | undefined) ??
        current.setup.interview_type;
      update({
        current_question: { ...response, question_type: questionType },
        stage: "question",
      });
    },
    [run, update]
  );

  /** ④ Answer reviewer: score the candidate's answer. */
  const review = useCallback(
    async (current: InterviewSessionState, answer: string) => {
      const question = current.current_question;
      if (!question) return;
      const response = await run("review", () =>
        reviewAnswerAction({
          question: question.question,
          candidate_answer: answer,
          position_level: current.setup.position_level,
          question_type: question.question_type as QuestionType,
          difficulty: question.difficulty,
          expected_keywords: question.expected_keywords,
          evaluation_criteria: question.evaluation_criteria,
          red_flags: question.red_flags,
          sample_strong_answer: question.sample_strong_answer,
          sample_weak_answer: question.sample_weak_answer,
        })
      );
      if (!response) return;
      const entry: SessionHistoryEntry = {
        question: question.question,
        answer,
        topic: question.topic,
        question_type: question.question_type,
        difficulty: question.difficulty,
        review: response,
      };
      update((prev) => {
        const history = [...prev.session_history];
        const index = history.findIndex((item) => item.question === entry.question);
        if (index >= 0) history[index] = entry;
        else history.push(entry);
        const all_questions_asked = prev.all_questions_asked.includes(entry.question)
          ? prev.all_questions_asked
          : [...prev.all_questions_asked, entry.question];
        return {
          ...prev,
          latest_review: response,
          current_answer: answer,
          session_history: history,
          all_questions_asked,
          stage: "review",
        };
      });
    },
    [run, update]
  );

  /** ⑤ Progress tracker: merge the review into the performance profile. */
  const track = useCallback(
    async (current: InterviewSessionState) => {
      const question = current.current_question;
      const reviewResult = current.latest_review;
      if (!reviewResult) return;
      const response = await run("progress", () =>
        trackProgressAction({
          current_profile: current.progress_state,
          latest_review: reviewResult,
          question_topic: question?.topic ?? "",
          question_type: question?.question_type ?? current.setup.interview_type,
        })
      );
      if (!response) return;
      update({
        progress_snapshot: current.progress_state,
        progress_state: response.updated_profile,
        performance_trend: response.performance_trend,
        stage: "progress",
      });
    },
    [run, update]
  );

  /** Starts a fresh session from the setup form and runs the first decide. */
  const start = useCallback(
    async (setup: InterviewSetupValues) => {
      const initial: InterviewSessionState = {
        setup,
        stage: "decide",
        session_history: [],
        all_questions_asked: [],
        progress_state: {},
        latest_review: null,
        current_answer: "",
        current_question: null,
        decision: null,
        performance_trend: "stable",
        questions_asked: 0,
        time_remaining_minutes: setup.duration_minutes,
        progress_snapshot: null,
        started_at: new Date().toISOString(),
      };
      session.setValue(initial);
      await decide(initial);
    },
    [decide, session]
  );

  const proceedFromDecide = useCallback(() => {
    if (state) void generate(state);
  }, [generate, state]);

  const proceedFromQuestion = useCallback(
    (question?: string) =>
      update((prev) => ({
        ...prev,
        current_question: prev.current_question
          ? { ...prev.current_question, question: question ?? prev.current_question.question }
          : prev.current_question,
        stage: "answer",
      })),
    [update]
  );

  const submitAnswer = useCallback(
    (answer: string) => {
      if (!state) return;
      update({ current_answer: answer });
      void review({ ...state, current_answer: answer }, answer);
    },
    [review, state, update]
  );

  const proceedFromReview = useCallback(() => {
    if (state) void track(state);
  }, [state, track]);

  /** Advances to the next loop iteration (or the report on the last question). */
  const proceedFromProgress = useCallback(() => {
    if (!state) return;
    const next: InterviewSessionState = {
      ...state,
      questions_asked: state.questions_asked + 1,
      time_remaining_minutes: remainingMinutes(state.setup, state.started_at),
      current_question: null,
      current_answer: "",
      latest_review: null,
      decision: null,
      progress_snapshot: null,
    };
    if (next.questions_asked >= state.setup.max_questions) {
      session.setValue({ ...next, stage: "report" });
      return;
    }
    session.setValue(next);
    void decide(next);
  }, [decide, session, state]);

  const editDecision = useCallback(
    (directive: Directive) =>
      update((prev) =>
        prev.decision ? { ...prev, decision: { ...prev.decision, directive } } : prev
      ),
    [update]
  );

  const redecide = useCallback(() => {
    if (state) void decide(state);
  }, [decide, state]);

  const editQuestion = useCallback(
    (question: string) =>
      update((prev) =>
        prev.current_question ? { ...prev, current_question: { ...prev.current_question, question } } : prev
      ),
    [update]
  );

  const regenerateQuestion = useCallback(() => {
    if (state) void generate(state);
  }, [generate, state]);

  const undoProgress = useCallback(() => {
    if (!state) return;
    update({ progress_state: state.progress_snapshot ?? {}, progress_snapshot: null, stage: "review" });
  }, [state, update]);

  const endInterview = useCallback(() => update({ stage: "report" }), [update]);

  const reset = useCallback(() => {
    setError(null);
    setPending(null);
    session.clear();
  }, [session]);

  return {
    state,
    pending,
    isPending,
    error,
    start,
    proceedFromDecide,
    proceedFromQuestion,
    submitAnswer,
    proceedFromReview,
    proceedFromProgress,
    editDecision,
    redecide,
    editQuestion,
    regenerateQuestion,
    undoProgress,
    endInterview,
    reset,
  };
}
