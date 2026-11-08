// src/features/charts/hooks/useChartHistory.ts
/** Version history for generated charts, kept on the device under tools.charts.history.v1. */
import { useCallback, useEffect, useState } from "react";
import { loadDocument, saveDocument } from "@/lib/document-store";
import type { ChartVersion } from "../types";
import { CHART_STORAGE_KEYS } from "../lib/persistence";
import { MAX_VERSIONS, appendVersion, parseHistory } from "../lib/history";

export function useChartHistory() {
  const [versions, setVersions] = useState<ChartVersion[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    loadDocument<unknown>(CHART_STORAGE_KEYS.history, [])
      .then((saved) => {
        if (!active) return;
        setVersions((current) => [...parseHistory(saved), ...current].slice(-MAX_VERSIONS));
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!loaded) return;
    saveDocument(CHART_STORAGE_KEYS.history, versions).catch(() => undefined);
  }, [loaded, versions]);

  const addVersion = useCallback((code: string) => {
    setVersions((prev) => appendVersion(prev, code, new Date().toISOString()));
  }, []);

  return { versions, addVersion };
}
