// src/features/practice/interview/hooks/useSyncedDraft.ts
/**
 * Local edit buffer that resets whenever its source value changes.
 * Uses the render-time state adjustment pattern instead of an effect, so the
 * draft stays in sync with the latest AI output without a cascading render.
 */
"use client";

import { useState } from "react";

export function useSyncedDraft<T>(source: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [draft, setDraft] = useState<T>(source);
  const [prevSource, setPrevSource] = useState<T>(source);

  if (!Object.is(source, prevSource)) {
    setPrevSource(source);
    setDraft(source);
  }

  return [draft, setDraft];
}
