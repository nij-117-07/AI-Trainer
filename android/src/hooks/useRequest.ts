// src/hooks/useRequest.ts
import { useCallback, useState } from "react";

/** Tracks one AI call: pending flag, last result, and a readable error message. */
export function useRequest<TArgs extends unknown[], TResult>(task: (...args: TArgs) => Promise<TResult>) {
  const [pending, setPending] = useState(false);
  const [data, setData] = useState<TResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(
    async (...args: TArgs): Promise<TResult | null> => {
      setPending(true);
      setError(null);
      try {
        const result = await task(...args);
        setData(result);
        return result;
      } catch (err) {
        setData(null);
        setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
        return null;
      } finally {
        setPending(false);
      }
    },
    [task]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
  }, []);

  return { pending, data, error, run, reset };
}
