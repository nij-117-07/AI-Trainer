// src/features/tutor/hooks/useResponseVersions.ts
/** Versioned response history kept on the device. Every answer is appended and becomes the active version. */
import { useCallback, useEffect, useRef, useState } from "react";
import { loadDocument, saveDocument } from "@/lib/document-store";
import type { TutorResponse } from "../types";
import { beginClear, clampVersionIndex, parseStoredVersions, type PendingClear } from "../lib/response-versions";

export const VERSIONS_STORAGE_KEY = "learning.tutor.versions.v1";

export function useResponseVersions() {
  const [versions, setVersions] = useState<TutorResponse[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [pendingClear, setPendingClear] = useState<PendingClear | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const pendingRef = useRef(pendingClear);

  useEffect(() => {
    pendingRef.current = pendingClear;
  }, [pendingClear]);

  useEffect(() => {
    loadDocument<unknown>(VERSIONS_STORAGE_KEY, [])
      .catch(() => [])
      .then((raw) => {
        const parsed = parseStoredVersions(raw);
        setVersions(parsed);
        setActiveIndex(parsed.length - 1);
        setHydrated(true);
      });
  }, []);

  useEffect(() => {
    if (!hydrated || pendingClear) return;
    void saveDocument(VERSIONS_STORAGE_KEY, versions).catch(() => undefined);
  }, [hydrated, versions, pendingClear]);

  useEffect(
    () => () => {
      if (pendingRef.current) void saveDocument(VERSIONS_STORAGE_KEY, []).catch(() => undefined);
    },
    [],
  );

  const push = useCallback(
    (response: TutorResponse) => {
      const next = [...versions, response];
      // A new answer ends the undo window: the cleared answers are gone for good.
      setPendingClear(null);
      setVersions(next);
      setActiveIndex(next.length - 1);
    },
    [versions],
  );

  const goTo = useCallback(
    (index: number) => {
      setActiveIndex(clampVersionIndex(index, versions.length));
    },
    [versions.length],
  );

  const clear = useCallback(() => {
    const cleared = beginClear(versions, activeIndex);
    if (!cleared) return;
    setPendingClear(cleared);
    setVersions([]);
    setActiveIndex(-1);
  }, [versions, activeIndex]);

  const undoClear = useCallback(() => {
    if (!pendingClear) return;
    setVersions(pendingClear.responses);
    setActiveIndex(pendingClear.activeIndex);
    setPendingClear(null);
  }, [pendingClear]);

  const commitClear = useCallback(() => setPendingClear(null), []);

  const reset = useCallback(() => {
    setPendingClear(null);
    setVersions([]);
    setActiveIndex(-1);
  }, []);

  const active = activeIndex >= 0 ? (versions[activeIndex] ?? null) : null;

  return { versions, activeIndex, active, pendingClear, push, goTo, clear, undoClear, commitClear, reset };
}
