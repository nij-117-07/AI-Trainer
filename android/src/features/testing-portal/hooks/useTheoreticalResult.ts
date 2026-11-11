// src/features/testing-portal/hooks/useTheoreticalResult.ts
/**
 * The saved theoretical questions on the Theoretical page. It reloads each time the page is
 * focused, so questions generated on the New questions page appear when the user comes back.
 * Clearing removes every batch and the past-question list. Each answer, grade, and model answer is
 * saved as it changes. A failed save is shown on that question, and the next change saves the
 * whole set again.
 */
import { useCallback, useRef, useState } from "react";
import { useFocusEffect } from "expo-router";
import { saveDocument } from "@/lib/document-store";
import {
  EMPTY_THEORETICAL_ANSWER,
  EMPTY_THEORETICAL_RESULT,
  loadTheoreticalAnswers,
  loadTheoreticalResult,
  THEORETICAL_STORAGE_KEYS,
  type TheoreticalAnswer,
  type TheoreticalAnswers,
  type TheoreticalResult,
} from "../lib/persistence";

export function useTheoreticalResult() {
  const [result, setResult] = useState<TheoreticalResult>(EMPTY_THEORETICAL_RESULT);
  const [answers, setAnswers] = useState<TheoreticalAnswers>({});
  const [failedIndex, setFailedIndex] = useState<number | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [quizKey, setQuizKey] = useState(0);
  const answersRef = useRef<TheoreticalAnswers>({});

  useFocusEffect(
    useCallback(() => {
      let active = true;
      Promise.all([loadTheoreticalResult(), loadTheoreticalAnswers()])
        .then(([next, savedAnswers]) => {
          if (!active) return;
          answersRef.current = savedAnswers;
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
    const next = {
      ...answersRef.current,
      [index]: { ...EMPTY_THEORETICAL_ANSWER, ...answersRef.current[index], ...patch },
    };
    answersRef.current = next;
    setAnswers(next);
    saveDocument(THEORETICAL_STORAGE_KEYS.answers, next)
      .then(() => setFailedIndex(null))
      .catch(() => setFailedIndex(index));
  }, []);

  const clear = useCallback(() => {
    answersRef.current = {};
    setResult(EMPTY_THEORETICAL_RESULT);
    setAnswers({});
    setFailedIndex(null);
    setQuizKey((key) => key + 1);
    saveDocument(THEORETICAL_STORAGE_KEYS.answers, {}).catch(() => undefined);
    saveDocument(THEORETICAL_STORAGE_KEYS.result, EMPTY_THEORETICAL_RESULT).catch(() => undefined);
  }, []);

  return { loaded, result, quizKey, clear, answers, updateAnswer, failedIndex };
}
