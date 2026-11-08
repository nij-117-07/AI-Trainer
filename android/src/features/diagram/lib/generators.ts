// src/features/diagram/lib/generators.ts
/**
 * Diagram generator. Validates the form, calls the model through Ax with the same temperature as
 * Backend/tools/diagram/services.py, and normalises the result. Honours the abort signal.
 */
import { ax } from "@ax-llm/ax";
import type { AiSettings } from "@/features/ai-settings/types";
import { createLlm } from "@/features/ai-settings/lib/llm";
import { CONTEXT_MAX, EXISTING_CODE_MAX, INSTRUCTION_MAX } from "../options";
import type { DiagramFormValues, DiagramResult } from "../types";
import { drawioGeneratorSignature, mermaidGeneratorSignature } from "./signatures";
import { normalizeDiagram } from "./normalize";
import { optionalText, requireFormat, requireText } from "./validate";

const TEMPERATURE = 0.4;

export async function generateDiagram(
  settings: AiSettings,
  values: DiagramFormValues,
  signal?: AbortSignal,
): Promise<DiagramResult> {
  const format = requireFormat(values.format);
  const userInstruction = requireText(values.instruction, "Instruction", INSTRUCTION_MAX);
  const context = optionalText(values.context, "Context", CONTEXT_MAX);
  const existingCode = optionalText(
    format === "mermaid" ? values.existingMermaid : values.existingDrawio,
    "Existing code",
    EXISTING_CODE_MAX,
  );
  const llm = createLlm(settings);
  const inputs = { userInstruction, context, existingCode };
  const options = { modelConfig: { temperature: TEMPERATURE }, abortSignal: signal };

  try {
    const raw =
      format === "mermaid"
        ? await ax(mermaidGeneratorSignature).forward(llm, inputs, options)
        : await ax(drawioGeneratorSignature).forward(llm, inputs, options);
    return normalizeDiagram(raw, format);
  } catch (err) {
    if (signal?.aborted) throw new Error("Generation was cancelled.");
    throw err;
  }
}
