// src/features/testing-portal/hooks/useMcqResult.ts
/**
 * The saved question list on the MCQ page. It reloads each time the page is focused, so questions
 * generated on the New MCQs page appear when the user comes back. Clearing removes every batch and
 * the past-question list.
 */
import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { saveDocument } from "@/lib/document-store";
import { EMPTY_MCQ_RESULT, loadMcqResult, MCQ_STORAGE_KEYS, type McqResult } from "../lib/persistence";

export function useMcqResult() {
  const [result, setResult] = useState<McqResult>(EMPTY_MCQ_RESULT);
  const [loaded, setLoaded] = useState(false);
  const [quizKey, setQuizKey] = useState(0);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      loadMcqResult()
        .then((next) => {
          if (active) setResult(next);
        })
        .finally(() => {
          if (active) setLoaded(true);
        });
      return () => {
        active = false;
      };
    }, []),
  );

  const clear = useCallback(() => {
    setResult(EMPTY_MCQ_RESULT);
    setQuizKey((key) => key + 1);
    saveDocument(MCQ_STORAGE_KEYS.result, EMPTY_MCQ_RESULT).catch(() => undefined);
  }, []);

  return { loaded, result, quizKey, clear };
}
