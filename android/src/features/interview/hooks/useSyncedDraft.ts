// src/features/interview/hooks/useSyncedDraft.ts
/**
 * Local edit buffer that resets whenever its source value changes. It adjusts state while rendering,
 * so the draft follows the latest AI output without an extra effect pass.
 */
import { useState, type Dispatch, type SetStateAction } from "react";

export function useSyncedDraft<T>(source: T): [T, Dispatch<SetStateAction<T>>] {
  const [draft, setDraft] = useState<T>(source);
  const [prevSource, setPrevSource] = useState<T>(source);

  if (!Object.is(source, prevSource)) {
    setPrevSource(source);
    setDraft(source);
  }

  return [draft, setDraft];
}
