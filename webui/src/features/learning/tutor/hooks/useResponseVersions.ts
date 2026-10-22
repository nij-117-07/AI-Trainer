// src/features/learning/tutor/hooks/useResponseVersions.ts
/**
 * Versioned response history for the Adaptive Tutor, stored in browser
 * localStorage (never the server). Each generation appends a version and jumps
 * to it; the user can browse older versions or reset the whole history.
 */
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  TutorResponseListSchema,
  type TutorResponse,
} from "../types";

interface UseResponseVersionsOptions {
  /** Versioned localStorage key, e.g. "learning.tutor.responses.v1". */
  storageKey: string;
}

export function useResponseVersions({ storageKey }: UseResponseVersionsOptions) {
  const [versions, setVersions] = useState<TutorResponse[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [hydrated, setHydrated] = useState(false);

  // Restore the version list after mount (client-only, no SSR mismatch).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = TutorResponseListSchema.safeParse(JSON.parse(raw));
        if (parsed.success && parsed.data.length > 0) {
          // Hydration pattern: reading a client store into state after mount.
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setVersions(parsed.data);
          setActiveIndex(parsed.data.length - 1);
        }
      }
    } catch (error) {
      console.error(`[useResponseVersions] Failed to restore "${storageKey}":`, error);
    } finally {
      setHydrated(true);
    }
  }, [storageKey]);

  // Persist on every change once hydrated.
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(versions));
    } catch (error) {
      console.error(`[useResponseVersions] Failed to persist "${storageKey}":`, error);
    }
  }, [storageKey, versions, hydrated]);

  const push = useCallback((response: TutorResponse) => {
    setVersions((current) => {
      const next = [...current, response];
      setActiveIndex(next.length - 1);
      return next;
    });
  }, []);

  const goTo = useCallback(
    (index: number) => {
      if (versions.length === 0) return;
      setActiveIndex(Math.min(Math.max(index, 0), versions.length - 1));
    },
    [versions.length]
  );

  const reset = useCallback(() => {
    setVersions([]);
    setActiveIndex(-1);
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // ignore storage errors
    }
  }, [storageKey]);

  const active = activeIndex >= 0 ? (versions[activeIndex] ?? null) : null;

  return {
    versions,
    activeIndex,
    active,
    hydrated,
    push,
    goTo,
    reset,
  };
}
