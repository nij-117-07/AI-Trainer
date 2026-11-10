// src/features/testing-portal/hooks/useAnswerResult.ts
/**
 * The saved expert answer on the Answer page. It reloads each time the page is focused, so an
 * answer generated on the New answer page appears when the user comes back.
 */
import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { loadAnswerResult, type SavedAnswer } from "../lib/persistence";

export function useAnswerResult() {
  const [answer, setAnswer] = useState<SavedAnswer | null>(null);
  const [loaded, setLoaded] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      loadAnswerResult()
        .then((next) => {
          if (active) setAnswer(next);
        })
        .finally(() => {
          if (active) setLoaded(true);
        });
      return () => {
        active = false;
      };
    }, []),
  );

  return { loaded, answer };
}
