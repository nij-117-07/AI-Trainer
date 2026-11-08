// src/features/charts/lib/generators.ts
/**
 * Chart.js generator. Validates the form, calls the model through Ax at the same temperature as
 * Backend/tools/charts/services.py, and normalises the result. Honours the abort signal so a reset
 * or unmount stops the request.
 */
import { ax } from "@ax-llm/ax";
import type { AiSettings } from "@/features/ai-settings/types";
import { createLlm } from "@/features/ai-settings/lib/llm";
import type { ChartFormValues, ChartResult } from "../types";
import { chartJsSignature } from "./signatures";
import { normalizeChart } from "./normalize";
import { optionalText, requireText } from "./validate";

const TEMPERATURE = 0.4;
const DATA_MAX = 20000;
const INSTRUCTIONS_MAX = 2000;
const PREVIOUS_CODE_MAX = 20000;

function throwIfCancelled(signal?: AbortSignal) {
  if (signal?.aborted) throw new Error("Chart generation was cancelled.");
}

export async function generateChart(
  settings: AiSettings,
  values: ChartFormValues,
  signal?: AbortSignal,
): Promise<ChartResult> {
  const dataInput = requireText(values.dataInput, "Data input", DATA_MAX);
  const customInstructions = requireText(values.customInstructions, "Instructions", INSTRUCTIONS_MAX);
  const previousCode = optionalText(values.previousCode, "Previous code", PREVIOUS_CODE_MAX);

  throwIfCancelled(signal);
  const llm = createLlm(settings);
  const result = await ax(chartJsSignature).forward(
    llm,
    { customInstructions, dataInput, previousCode },
    { modelConfig: { temperature: TEMPERATURE }, abortSignal: signal },
  );
  throwIfCancelled(signal);

  const chart = normalizeChart(result);
  if (!chart.chartDivCode) throw new Error("The model returned no chart code. Please try again.");
  return chart;
}
