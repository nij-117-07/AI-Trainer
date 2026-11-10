// src/features/ai-detector/lib/signatures.ts
/**
 * Ax signature for the AI Detector. Instructions and field descriptions live in
 * signature-descriptions.ts, which is copied from Backend/tools/ai_detector/services.py.
 */
import { f } from "@ax-llm/ax";
import { AI_DETECTOR_DESCRIPTIONS } from "./signature-descriptions";
import { VERDICTS } from "../types";

const detector = AI_DETECTOR_DESCRIPTIONS;

export const aiDetectorSignature = f()
  .description(detector.instruction)
  .input("textToCheck", f.string(detector.inputs.textToCheck))
  .input("additionalComments", f.string(detector.inputs.additionalComments).optional())
  .output("aiScore", f.number(detector.outputs.aiScore))
  .output("verdict", f.class([...VERDICTS], detector.outputs.verdict))
  .output("reason", f.string(detector.outputs.reason))
  .output("flaggedPatterns", f.string(detector.outputs.flaggedPatterns).array())
  .output("suggestedChanges", f.string(detector.outputs.suggestedChanges).array())
  .build();
