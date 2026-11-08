// src/features/charts/lib/normalize.ts
/** Turns the raw model output into the typed result the screen renders. */
import type { ChartResult } from "../types";
import { textOf } from "./text";

export function normalizeChart(raw: { answerMessage?: unknown; chartDivCode?: unknown }): ChartResult {
  return {
    answerMessage: textOf(raw.answerMessage),
    chartDivCode: textOf(raw.chartDivCode),
  };
}
