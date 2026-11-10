// src/features/puzzle/lib/signatures.ts
/**
 * Ax signatures for the Puzzle Generator. Instructions and field descriptions live in
 * signature-descriptions.ts, which is copied from Backend/practice/puzzle/services.py.
 * Enum inputs are sent as text with the allowed values listed in the description (Ax rejects
 * f.class on inputs).
 */
import { f } from "@ax-llm/ax";
import { ADAPTIVE_PUZZLE_DESCRIPTIONS, PUZZLE_EVALUATOR_DESCRIPTIONS } from "./signature-descriptions";

const generator = ADAPTIVE_PUZZLE_DESCRIPTIONS;
const evaluator = PUZZLE_EVALUATOR_DESCRIPTIONS;

export const adaptivePuzzleSignature = f()
  .description(generator.instruction)
  .input("fieldOfInterest", f.string(generator.inputs.fieldOfInterest))
  .input("puzzleType", f.string(generator.inputs.puzzleType))
  .input("targetDomain", f.string(generator.inputs.targetDomain))
  .input("difficultyLevel", f.string(generator.inputs.difficultyLevel))
  .input("userInstructions", f.string(generator.inputs.userInstructions).optional())
  .input("seed", f.number(generator.inputs.seed))
  .output("puzzlerPersona", f.string(generator.outputs.puzzlerPersona))
  .output("puzzleText", f.string(generator.outputs.puzzleText))
  .output("solution", f.string(generator.outputs.solution))
  .output("cognitiveTrigger", f.string(generator.outputs.cognitiveTrigger))
  .build();

export const puzzleEvaluatorSignature = f()
  .description(evaluator.instruction)
  .input("puzzleContext", f.string(evaluator.inputs.puzzleContext))
  .input("puzzleType", f.string(evaluator.inputs.puzzleType))
  .input("officialSolution", f.string(evaluator.inputs.officialSolution))
  .input("userResponse", f.string(evaluator.inputs.userResponse))
  .output("isCorrect", f.boolean(evaluator.outputs.isCorrect))
  .output("accuracyScore", f.number(evaluator.outputs.accuracyScore).min(0).max(1))
  .output("evaluationFeedback", f.string(evaluator.outputs.evaluationFeedback))
  .output("hintRedirection", f.string(evaluator.outputs.hintRedirection))
  .output("metacognitivePrompt", f.string(evaluator.outputs.metacognitivePrompt))
  .build();
