// src/features/vision-converter/lib/generators.ts
/**
 * Vision Converter generator. Validates the image and instruction, sends the resized JPEG to the
 * user's model through Ax, and returns the Markdown. Mirrors Backend/tools/vision_converter/services.py.
 */
import { ax } from "@ax-llm/ax";
import type { AiSettings } from "@/features/ai-settings/types";
import { createLlm } from "@/features/ai-settings/lib/llm";
import type { ImageInput } from "@/lib/image";
import { normalizeMarkdown } from "./normalize";
import { imageToMarkdownSignature } from "./signatures";
import { instructionOrDefault, requireImage } from "./validate";

const TEMPERATURE = 0.5;

export interface ConvertInput {
  image: ImageInput | null;
  instruction: string;
}

export async function convertImage(settings: AiSettings, values: ConvertInput, signal?: AbortSignal): Promise<string> {
  const image = requireImage(values.image);
  const instruction = instructionOrDefault(values.instruction);
  if (signal?.aborted) throw new Error("Conversion cancelled.");
  const llm = createLlm(settings);
  const result = await ax(imageToMarkdownSignature).forward(
    llm,
    {
      sourceImage: { mimeType: image.mimeType, data: image.base64 },
      userInstruction: instruction,
    },
    { modelConfig: { temperature: TEMPERATURE }, abortSignal: signal },
  );
  return normalizeMarkdown(result);
}
