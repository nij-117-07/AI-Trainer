// src/features/testing-portal/hooks/useSolverResult.ts
/**
 * The saved solution on the Solve an MCQ page. It reloads each time the page is focused, so a
 * solution made on the New question page appears when the user comes back.
 */
import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { loadSolverResult, type SavedSolve } from "../lib/persistence";

export function useSolverResult() {
  const [solution, setSolution] = useState<SavedSolve | null>(null);
  const [loaded, setLoaded] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      loadSolverResult()
        .then((next) => {
          if (active) setSolution(next);
        })
        .finally(() => {
          if (active) setLoaded(true);
        });
      return () => {
        active = false;
      };
    }, []),
  );

  return { loaded, solution };
}
