// src/features/riddle/lib/signatures.ts
/**
 * Ax signatures for the Riddle Generator. Instructions and field descriptions live in
 * signature-descriptions.ts, which is copied from Backend/practice/riddle/services.py.
 */
import { f } from "@ax-llm/ax";
import { ADAPTIVE_RIDDLE_DESCRIPTIONS, RIDDLE_EVALUATOR_DESCRIPTIONS } from "./signature-descriptions";

const generator = ADAPTIVE_RIDDLE_DESCRIPTIONS;
const evaluator = RIDDLE_EVALUATOR_DESCRIPTIONS;

export const adaptiveRiddleSignature = f()
  .description(generator.instruction)
  .input("fieldOfInterest", f.string(generator.inputs.fieldOfInterest))
  .input("targetDomain", f.string(generator.inputs.targetDomain))
  .input("difficultyLevel", f.string(generator.inputs.difficultyLevel))
  .input("userInstructions", f.string(generator.inputs.userInstructions).optional())
  .input("seed", f.number(generator.inputs.seed))
  .output("riddleText", f.string(generator.outputs.riddleText))
  .output("solution", f.string(generator.outputs.solution))
  .output("cognitiveTrigger", f.string(generator.outputs.cognitiveTrigger))
  .build();

export const riddleEvaluatorSignature = f()
  .description(evaluator.instruction)
  .input("riddleText", f.string(evaluator.inputs.riddleText))
  .input("solution", f.string(evaluator.inputs.solution))
  .input("userAnswer", f.string(evaluator.inputs.userAnswer))
  .output("isCorrect", f.boolean(evaluator.outputs.isCorrect))
  .output("feedback", f.string(evaluator.outputs.feedback))
  .output("thoughtRedirection", f.string(evaluator.outputs.thoughtRedirection))
  .build();
