// src/features/testing-portal/hooks/useTheoreticalResult.ts
/**
 * The saved theoretical questions on the Theoretical page. It reloads each time the page is
 * focused, so questions generated on the New questions page appear when the user comes back.
 * Clearing removes every batch and the past-question list.
 */
import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { saveDocument } from "@/lib/document-store";
import {
  EMPTY_THEORETICAL_RESULT,
  loadTheoreticalResult,
  THEORETICAL_STORAGE_KEYS,
  type TheoreticalResult,
} from "../lib/persistence";

export function useTheoreticalResult() {
  const [result, setResult] = useState<TheoreticalResult>(EMPTY_THEORETICAL_RESULT);
  const [loaded, setLoaded] = useState(false);
  const [quizKey, setQuizKey] = useState(0);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      loadTheoreticalResult()
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
    setResult(EMPTY_THEORETICAL_RESULT);
    setQuizKey((key) => key + 1);
    saveDocument(THEORETICAL_STORAGE_KEYS.result, EMPTY_THEORETICAL_RESULT).catch(() => undefined);
  }, []);

  return { loaded, result, quizKey, clear };
}
