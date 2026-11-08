// src/features/ai-detector/lib/signatures.ts
/**
 * Ax signatures for the AI Detector. Instructions and field descriptions live in
 * signature-descriptions.ts, which is copied from Backend/tools/ai_detector/services.py.
 */
import { f } from "@ax-llm/ax";
import { AI_DETECTOR_DESCRIPTIONS, HUMANIZER_DESCRIPTIONS } from "./signature-descriptions";
import { VERDICTS } from "../types";

const detector = AI_DETECTOR_DESCRIPTIONS;
const humanizer = HUMANIZER_DESCRIPTIONS;

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

export const humanizerSignature = f()
  .description(humanizer.instruction)
  .input("aiText", f.string(humanizer.inputs.aiText))
  .input("targetTone", f.string(humanizer.inputs.targetTone))
  .input("detectionFeedback", f.string(humanizer.inputs.detectionFeedback).optional())
  .input("additionalComments", f.string(humanizer.inputs.additionalComments).optional())
  .output("humanizedText", f.string(humanizer.outputs.humanizedText))
  .output("changesMade", f.string(humanizer.outputs.changesMade).array())
  .output("confidence", f.number(humanizer.outputs.confidence))
  .build();
