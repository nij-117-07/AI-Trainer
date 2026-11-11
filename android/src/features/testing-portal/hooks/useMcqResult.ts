// src/features/testing-portal/hooks/useMcqResult.ts
/**
 * The saved question list on the MCQ page. It reloads each time the page is focused, so questions
 * generated on the New MCQs page appear when the user comes back. Clearing removes every batch and
 * the past-question list. Each selected option is saved as it is made, so the quiz looks the same
 * after the user leaves and returns.
 */
import { useCallback, useRef, useState } from "react";
import { useFocusEffect } from "expo-router";
import { saveDocument } from "@/lib/document-store";
import type { OptionKey } from "../types";
import {
  EMPTY_MCQ_RESULT,
  loadMcqAnswers,
  loadMcqResult,
  MCQ_STORAGE_KEYS,
  type McqAnswers,
  type McqResult,
} from "../lib/persistence";

export function useMcqResult() {
  const [result, setResult] = useState<McqResult>(EMPTY_MCQ_RESULT);
  const [answers, setAnswers] = useState<McqAnswers>({});
  const [loaded, setLoaded] = useState(false);
  const [quizKey, setQuizKey] = useState(0);
  const answersRef = useRef<McqAnswers>({});

  useFocusEffect(
    useCallback(() => {
      let active = true;
      Promise.all([loadMcqResult(), loadMcqAnswers()])
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

  const saveAnswers = useCallback((next: McqAnswers) => {
    answersRef.current = next;
    setAnswers(next);
    saveDocument(MCQ_STORAGE_KEYS.answers, next).catch(() => undefined);
  }, []);

  const selectAnswer = useCallback(
    (index: number, selected: OptionKey) => {
      saveAnswers({ ...answersRef.current, [index]: { selected, checked: true } });
    },
    [saveAnswers],
  );

  const resetAnswers = useCallback(() => {
    saveAnswers({});
  }, [saveAnswers]);

  const clear = useCallback(() => {
    setResult(EMPTY_MCQ_RESULT);
    setQuizKey((key) => key + 1);
    saveAnswers({});
    saveDocument(MCQ_STORAGE_KEYS.result, EMPTY_MCQ_RESULT).catch(() => undefined);
  }, [saveAnswers]);

  return { loaded, result, quizKey, clear, answers, selectAnswer, resetAnswers };
}
