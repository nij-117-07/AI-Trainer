// src/features/pareto-topics/hooks/useParetoLists.ts
/** State for the list page: every saved topic list, reloaded each time the page is shown. */
import { useCallback, useState } from "react";
import { loadParetoLists } from "../lib/pareto-store";
import type { ParetoList } from "../types";

function messageOf(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

export function useParetoLists() {
  const [lists, setLists] = useState<ParetoList[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      setLists(await loadParetoLists());
      setError(null);
    } catch (err) {
      setError(messageOf(err, "Could not load your topic lists."));
    } finally {
      setLoaded(true);
    }
  }, []);

  return { lists, loaded, error, reload };
}

export type ParetoListsState = ReturnType<typeof useParetoLists>;
