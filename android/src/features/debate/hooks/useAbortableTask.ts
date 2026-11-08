// src/features/debate/hooks/useAbortableTask.ts
/**
 * Runs one long AI task at a time and passes it an AbortSignal. Starting a new run or calling
 * cancel aborts the task in flight, and an aborted task never sets an error.
 */
import { useCallback, useEffect, useRef, useState } from "react";

export function useAbortableTask<TArgs extends unknown[], TResult>(
  task: (signal: AbortSignal, ...args: TArgs) => Promise<TResult>,
) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  const run = useCallback(
    async (...args: TArgs): Promise<TResult | null> => {
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;
      setPending(true);
      setError(null);
      try {
        const result = await task(controller.signal, ...args);
        return controller.signal.aborted ? null : result;
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
        }
        return null;
      } finally {
        if (controllerRef.current === controller) {
          controllerRef.current = null;
          setPending(false);
        }
      }
    },
    [task],
  );

  const cancel = useCallback(() => {
    controllerRef.current?.abort();
    controllerRef.current = null;
    setPending(false);
    setError(null);
  }, []);

  useEffect(() => () => controllerRef.current?.abort(), []);

  return { pending, error, run, cancel };
}
