// src/features/tools/charts/lib/history.ts
/**
 * Version history for the Chart.js Generator.
 * Every generated chart is pushed to a localStorage list (capped), so users
 * can revisit and restore earlier versions into the "Previous Code" field.
 */
"use client";

import { useCallback, useEffect, useState } from "react";

export interface ChartVersion {
  code: string;
  savedAt: string;
}

const HISTORY_KEY = "tools.charts.history.v1";
const MAX_VERSIONS = 20;

function readHistory(): ChartVersion[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (entry): entry is ChartVersion =>
          !!entry &&
          typeof entry === "object" &&
          typeof (entry as ChartVersion).code === "string" &&
          typeof (entry as ChartVersion).savedAt === "string"
      )
      .slice(-MAX_VERSIONS);
  } catch (error) {
    console.error("[useChartHistory] Failed to read history:", error);
    return [];
  }
}

function writeHistory(versions: ChartVersion[]) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(versions));
  } catch (error) {
    console.error("[useChartHistory] Failed to persist history:", error);
  }
}

export function useChartHistory() {
  const [versions, setVersions] = useState<ChartVersion[]>([]);

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

  const addVersion = useCallback((code: string) => {
    const entry: ChartVersion = {
      code,
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
