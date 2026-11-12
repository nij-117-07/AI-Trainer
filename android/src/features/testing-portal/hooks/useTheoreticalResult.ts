// src/features/testing-portal/hooks/useTheoreticalResult.ts
/**
 * The questions of the open theoretical session. It reloads each time the page is focused, so
 * questions generated on the New questions page appear when the user comes back. Clearing removes
 * the questions and answers of this session only. Each answer, grade, and model answer is saved as
 * it changes. A failed save is shown on that question, and the next change saves the whole set again.
 */
import { useCallback, useRef, useState } from "react";
import { useFocusEffect } from "expo-router";
import { saveDocument } from "@/lib/document-store";
import {
  EMPTY_THEORETICAL_ANSWER,
  EMPTY_THEORETICAL_RESULT,
  EMPTY_THEORETICAL_SESSIONS,
  loadTheoreticalAnswers,
  loadTheoreticalResult,
  theoreticalSessionKeys,
  type TheoreticalAnswer,
  type TheoreticalAnswers,
  type TheoreticalResult,
} from "../lib/persistence";
import {
  loadTheoreticalSessionIndex,
  saveTheoreticalSessionResult,
} from "../lib/theoretical-sessions";

export function useTheoreticalResult() {
  const [title, setTitle] = useState("");
  const [result, setResult] = useState<TheoreticalResult>(EMPTY_THEORETICAL_RESULT);
  const [answers, setAnswers] = useState<TheoreticalAnswers>({});
  const [failedIndex, setFailedIndex] = useState<number | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [quizKey, setQuizKey] = useState(0);
  const answersRef = useRef<TheoreticalAnswers>({});
  const sessionIdRef = useRef<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      loadTheoreticalSessionIndex()
        .catch(() => EMPTY_THEORETICAL_SESSIONS)
        .then(async (index) => {
          const session = index.sessions.find((item) => item.id === index.activeId) ?? null;
          const [next, savedAnswers] = session
            ? await Promise.all([loadTheoreticalResult(session.id), loadTheoreticalAnswers(session.id)])
            : [EMPTY_THEORETICAL_RESULT, {}];
          if (!active) return;
          sessionIdRef.current = session?.id ?? null;
          answersRef.current = savedAnswers;
          setTitle(session?.title ?? "");
          setResult(next);
          setAnswers(savedAnswers);
        })
        .finally(() => {
          if (active) setLoaded(true);
        });
      return () => {
        active = false;
      };
    }, []),
  );

  const updateAnswer = useCallback((index: number, patch: Partial<TheoreticalAnswer>) => {
    const sessionId = sessionIdRef.current;
    if (!sessionId) return;
    const next = {
      ...answersRef.current,
      [index]: { ...EMPTY_THEORETICAL_ANSWER, ...answersRef.current[index], ...patch },
    };
    answersRef.current = next;
    setAnswers(next);
    saveDocument(theoreticalSessionKeys(sessionId).answers, next)
      .then(() => setFailedIndex(null))
      .catch(() => setFailedIndex(index));
  }, []);

  const clear = useCallback(() => {
    const sessionId = sessionIdRef.current;
    if (!sessionId) return;
    answersRef.current = {};
    setResult(EMPTY_THEORETICAL_RESULT);
    setAnswers({});
    setFailedIndex(null);
    setQuizKey((key) => key + 1);
    saveDocument(theoreticalSessionKeys(sessionId).answers, {}).catch(() => undefined);
    saveTheoreticalSessionResult(sessionId, EMPTY_THEORETICAL_RESULT).catch(() => undefined);
  }, []);

  return { loaded, title, result, quizKey, clear, answers, updateAnswer, failedIndex };
}
