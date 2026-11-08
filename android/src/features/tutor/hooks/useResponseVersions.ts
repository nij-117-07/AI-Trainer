// src/features/tutor/hooks/useResponseVersions.ts
/** Versioned response history kept on the device. Every answer is appended and becomes the active version. */
import { useCallback, useEffect, useState } from "react";
import { loadDocument, saveDocument } from "@/lib/document-store";
import type { TutorResponse } from "../types";
import { clampVersionIndex, parseStoredVersions } from "../lib/response-versions";

export const VERSIONS_STORAGE_KEY = "learning.tutor.versions.v1";

export function useResponseVersions() {
  const [versions, setVersions] = useState<TutorResponse[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [hydrated, setHydrated] = useState(false);

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
    if (!hydrated) return;
    void saveDocument(VERSIONS_STORAGE_KEY, versions).catch(() => undefined);
  }, [hydrated, versions]);

  const push = useCallback(
    (response: TutorResponse) => {
      const next = [...versions, response];
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

  const reset = useCallback(() => {
    setVersions([]);
    setActiveIndex(-1);
  }, []);

  const active = activeIndex >= 0 ? (versions[activeIndex] ?? null) : null;

  return { versions, activeIndex, active, push, goTo, reset };
}
