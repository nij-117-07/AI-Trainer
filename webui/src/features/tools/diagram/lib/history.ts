// src/features/tools/diagram/lib/history.ts
/**
 * Version history for the Diagram Generator.
 * Every generated diagram is pushed to a localStorage list (capped), so users
 * can revisit and restore earlier versions into the "Existing Code" field.
 */
"use client";

import { useCallback, useEffect, useState } from "react";

export interface DiagramVersion {
  code: string;
  format: string;
  savedAt: string;
}

const HISTORY_KEY = "tools.diagram.history.v1";
const MAX_VERSIONS = 20;

function readHistory(): DiagramVersion[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (entry): entry is DiagramVersion =>
          !!entry &&
          typeof entry === "object" &&
          typeof (entry as DiagramVersion).code === "string" &&
          typeof (entry as DiagramVersion).format === "string" &&
          typeof (entry as DiagramVersion).savedAt === "string"
      )
      .slice(-MAX_VERSIONS);
  } catch (error) {
    console.error("[useDiagramHistory] Failed to read history:", error);
    return [];
  }
}

function writeHistory(versions: DiagramVersion[]) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(versions));
  } catch (error) {
    console.error("[useDiagramHistory] Failed to persist history:", error);
  }
}

export function useDiagramHistory() {
  const [versions, setVersions] = useState<DiagramVersion[]>([]);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      setVersions(readHistory());
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const addVersion = useCallback((code: string, format: string) => {
    const entry: DiagramVersion = {
      code,
      format,
      savedAt: new Date().toISOString(),
    };
    setVersions((prev) => {
      const next = [...prev, entry].slice(-MAX_VERSIONS);
      writeHistory(next);
      return next;
    });
  }, []);

  return { versions, addVersion };
}
