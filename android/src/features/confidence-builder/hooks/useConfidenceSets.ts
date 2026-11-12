// src/features/confidence-builder/hooks/useConfidenceSets.ts
/** State for the task list: every saved set, reloaded each time the page is shown. */
import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { loadConfidenceSets } from "../lib/store";
import type { ConfidenceSet } from "../types";

function messageOf(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

export function useConfidenceSets() {
  const [sets, setSets] = useState<ConfidenceSet[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadConfidenceSets()
        .then((next) => {
          setSets(next);
          setError(null);
        })
        .catch((err: unknown) => setError(messageOf(err, "Could not load your task sets.")))
        .finally(() => setLoaded(true));
    }, []),
  );

  return { sets, loaded, error };
}
