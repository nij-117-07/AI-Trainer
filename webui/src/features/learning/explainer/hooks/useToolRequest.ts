// src/features/learning/explainer/hooks/useToolRequest.ts
/**
 * Generic wrapper around any Server Action that generates content.
 * Handles the pending transition (for spinners), error state, and stores the
 * latest result. Used by every Explainer tool page for consistent UX.
 */
"use client";

import { useCallback, useState, useTransition } from "react";

interface UseToolRequestOptions<TData, TResult> {
  /** Async function (usually a Server Action) that produces the result. */
  run: (data: TData) => Promise<TResult>;
  /** Called with the result after a successful run. */
  onSuccess?: (result: TResult) => void;
}

export interface UseToolRequestResult<TData, TResult> {
  /** Latest successful result, null before the first success. */
  data: TResult | null;
  /** True while the Server Action is in flight. */
  isPending: boolean;
  /** Human-readable error message, null when ok. */
  error: string | null;
  /** Runs the Server Action with the given payload. */
  execute: (data: TData) => void;
  /** Clears error + data (e.g. before a new run). */
  reset: () => void;
}

export function useToolRequest<TData, TResult>({
  run,
  onSuccess,
}: UseToolRequestOptions<TData, TResult>): UseToolRequestResult<TData, TResult> {
  const [data, setData] = useState<TResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const execute = useCallback(
    (input: TData) => {
      setError(null);
      startTransition(async () => {
        try {
          const result = await run(input);
          setData(result);
          onSuccess?.(result);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
          setData(null);
        }
      });
    },
    [run, onSuccess]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
  }, []);

  return { data, isPending, error, execute, reset };
}
