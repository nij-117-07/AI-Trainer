// src/features/learning/explainer/hooks/useOrchestrateStream.ts
/**
 * Client-side SSE consumer for the "Orchestrated Journey" tool.
 *
 * Streams from the same-origin Route Handler (/api/learning/explainer/orchestrate)
 * so the real backend URL is never exposed. Parses plan/chapter/done events,
 * accumulates chapters, and persists the full stream state to localStorage so a
 * refresh restores the completed journey. Exposes start/stop/reset controls.
 */
"use client";

import { useCallback, useEffect, useRef } from "react";
import { OrchestratorChapter, OrchestratorRequest } from "../types";
import { usePersistedState, type PersistStatus } from "./usePersistedState";

export type OrchestrateStatus = "idle" | "streaming" | "done" | "error";

export interface OrchestrateStreamState {
  status: OrchestrateStatus;
  titles: string[];
  prerequisites: string[];
  chapters: OrchestratorChapter[];
  error: string | null;
}

export const IDLE_STREAM_STATE: OrchestrateStreamState = {
  status: "idle",
  titles: [],
  prerequisites: [],
  chapters: [],
  error: null,
};

interface SseEnvelope {
  event: string;
  data: unknown;
}

interface UseOrchestrateStreamResult extends OrchestrateStreamState {
  persistStatus: PersistStatus;
  /** Kicks off a new stream for the given payload. */
  start: (payload: OrchestratorRequest) => void;
  /** Aborts the in-flight stream (keeps partial chapters). */
  stop: () => void;
  /** Aborts any stream and wipes the persisted state. */
  reset: () => void;
}

export function useOrchestrateStream(storageKey: string): UseOrchestrateStreamResult {
  const { value, setValue, status: persistStatus, clear, hydrated } =
    usePersistedState<OrchestrateStreamState>({
      key: storageKey,
      initialValue: IDLE_STREAM_STATE,
    });

  const abortRef = useRef<AbortController | null>(null);

  // A stream can't resume across a refresh: downgrade a restored "streaming"
  // state to "done" (if chapters arrived) or "idle".
  useEffect(() => {
    if (!hydrated) return;
    setValue((state) =>
      state.status === "streaming"
        ? { ...state, status: state.chapters.length > 0 ? "done" : "idle" }
        : state
    );
  }, [hydrated, setValue]);

  // Clean up the in-flight request on unmount.
  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const consume = useCallback(
    (raw: string) => {
      let envelope: SseEnvelope;
      try {
        envelope = JSON.parse(raw) as SseEnvelope;
      } catch {
        return; // ignore malformed keep-alive chunks
      }

      switch (envelope.event) {
        case "plan": {
          const data = envelope.data as { titles?: string[]; prerequisites?: string[] };
          setValue((state) => ({
            ...state,
            titles: data.titles ?? [],
            prerequisites: data.prerequisites ?? [],
          }));
          break;
        }
        case "chapter": {
          const chapter = envelope.data as OrchestratorChapter;
          setValue((state) => ({ ...state, chapters: [...state.chapters, chapter] }));
          break;
        }
        case "done":
          setValue((state) => ({ ...state, status: "done" }));
          break;
        case "error":
          setValue((state) => ({
            ...state,
            status: "error",
            error:
              typeof envelope.data === "string"
                ? envelope.data
                : "Stream reported an error.",
          }));
          break;
        default:
          break;
      }
    },
    [setValue]
  );

  const start = useCallback(
    (payload: OrchestratorRequest) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setValue({ ...IDLE_STREAM_STATE, status: "streaming" });

      const run = async () => {
        try {
          const response = await fetch("/api/learning/explainer/orchestrate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            signal: controller.signal,
          });

          if (!response.ok) {
            const body = (await response.json().catch(() => null)) as SseEnvelope | null;
            const message =
              typeof body?.data === "string"
                ? body.data
                : `Stream failed (${response.status}). Please try again.`;
            setValue((state) => ({ ...state, status: "error", error: message }));
            return;
          }

          const reader = response.body?.getReader();
          if (!reader) throw new Error("No response body from the stream.");

          const decoder = new TextDecoder();
          let buffer = "";

          for (;;) {
            const { done, value: chunk } = await reader.read();
            if (done) break;
            buffer += decoder.decode(chunk, { stream: true });

            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";
            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed.startsWith("data:")) continue;
              const raw = trimmed.slice(5).trim();
              if (raw) consume(raw);
            }
          }

          setValue((state) =>
            state.status === "streaming" ? { ...state, status: "done" } : state
          );
        } catch (err) {
          if ((err as Error).name === "AbortError") {
            setValue((state) => ({
              ...state,
              status: state.chapters.length > 0 ? "done" : "idle",
              error: null,
            }));
            return;
          }
          setValue((state) => ({
            ...state,
            status: "error",
            error:
              err instanceof Error ? err.message : "Failed to read the stream.",
          }));
        }
      };

      void run();
    },
    [consume, setValue]
  );

  const stop = useCallback(() => abortRef.current?.abort(), []);
  const reset = useCallback(() => {
    abortRef.current?.abort();
    clear();
  }, [clear]);

  return {
    ...value,
    persistStatus,
    start,
    stop,
    reset,
  };
}
