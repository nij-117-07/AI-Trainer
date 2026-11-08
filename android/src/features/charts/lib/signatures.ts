// src/features/charts/lib/signatures.ts
/**
 * Ax signature for the Chart.js Generator. Instructions and field descriptions live in
 * signature-descriptions.ts, which is copied from Backend/tools/charts/services.py.
 */
import { f } from "@ax-llm/ax";
import { CHART_DESCRIPTIONS } from "./signature-descriptions";

const chart = CHART_DESCRIPTIONS;

export const chartJsSignature = f()
  .description(chart.instruction)
  .input("customInstructions", f.string(chart.inputs.customInstructions))
  .input("dataInput", f.string(chart.inputs.dataInput))
  .input("previousCode", f.string(chart.inputs.previousCode).optional())
  .output("answerMessage", f.string(chart.outputs.answerMessage))
  .output("chartDivCode", f.string(chart.outputs.chartDivCode))
  .build();
