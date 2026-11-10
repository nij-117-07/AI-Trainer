// src/features/observation-trainer/hooks/usePersistedTraining.ts
/** Loads the last Observation Trainer report. The report page reads it each time the page is focused. */
import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { loadDocument } from "@/lib/document-store";
import { readTrainResult } from "../lib/normalize";
import { OBSERVATION_RESULT_KEY } from "../lib/persistence";
import type { ObservationTrainResult } from "../types";

export function usePersistedTraining(): ObservationTrainResult | null {
  const [result, setResult] = useState<ObservationTrainResult | null>(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      loadDocument<unknown>(OBSERVATION_RESULT_KEY, null)
        .then((saved) => {
          if (active) setResult(readTrainResult(saved));
        })
        .catch(() => undefined);
      return () => {
        active = false;
      };
    }, []),
  );

  return result;
}
