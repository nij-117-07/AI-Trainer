// src/features/language-tester/hooks/useRunSignal.ts
/** Gives each run a fresh AbortSignal. The signal aborts when the screen unmounts, so model calls stop early. */
import { useCallback, useEffect, useRef } from "react";

export function useRunSignal(): () => AbortSignal {
  const controller = useRef<AbortController | null>(null);

  useEffect(() => () => controller.current?.abort(), []);

  return useCallback(() => {
    controller.current = new AbortController();
    return controller.current.signal;
  }, []);
}
