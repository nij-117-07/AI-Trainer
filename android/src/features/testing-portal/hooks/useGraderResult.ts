// src/features/testing-portal/hooks/useGraderResult.ts
/**
 * The saved grade on the Performance Grader page. It reloads each time the page is focused, so a
 * grade made on the New grade page appears when the user comes back.
 */
import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { loadGraderResult, type SavedGrade } from "../lib/persistence";

export function useGraderResult() {
  const [grade, setGrade] = useState<SavedGrade | null>(null);
  const [loaded, setLoaded] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      loadGraderResult()
        .then((next) => {
          if (active) setGrade(next);
        })
        .finally(() => {
          if (active) setLoaded(true);
        });
      return () => {
        active = false;
      };
    }, []),
  );

  return { loaded, grade };
}
