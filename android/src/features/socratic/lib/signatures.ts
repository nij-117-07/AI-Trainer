// src/features/socratic/lib/signatures.ts
/**
 * Ax signatures for the Socratic Challenger: one for each challenge turn, and one for the wrap-up
 * that summarises a finished discussion. Instructions and field descriptions live in
 * signature-descriptions.ts.
 */
import { f } from "@ax-llm/ax";
import { FOCUS_VALUES } from "../types";
import { SOCRATIC_SYNTHESIS_DESCRIPTIONS, SOCRATIC_TURN_DESCRIPTIONS } from "./signature-descriptions";

const turn = SOCRATIC_TURN_DESCRIPTIONS;
const synthesis = SOCRATIC_SYNTHESIS_DESCRIPTIONS;

export const socraticTurnSignature = f()
  .description(turn.instruction)
  .input("conversationHistory", f.string(turn.inputs.conversationHistory))
  .input("userStatement", f.string(turn.inputs.userStatement))
  .input("confidenceLevel", f.string(turn.inputs.confidenceLevel))
  .input("focus", f.string(`${turn.inputs.focus} One of: ${FOCUS_VALUES.join(", ")}.`))
  .output("logicalFallacyCheck", f.string(turn.outputs.logicalFallacyCheck))
  .output("hiddenAssumption", f.string(turn.outputs.hiddenAssumption))
  .output("strongestCounterargument", f.string(turn.outputs.strongestCounterargument))
  .output("bothSidesView", f.string(turn.outputs.bothSidesView))
  .output("probingQuestion", f.string(turn.outputs.probingQuestion))
  .build();

export const socraticSynthesisSignature = f()
  .description(synthesis.instruction)
  .input("conversationHistory", f.string(synthesis.inputs.conversationHistory))
  .input("confidenceLevel", f.string(synthesis.inputs.confidenceLevel))
  .output("strongestCaseForUserView", f.string(synthesis.outputs.strongestCaseForUserView))
  .output("strongestCaseAgainstUserView", f.string(synthesis.outputs.strongestCaseAgainstUserView))
  .output("sharedGround", f.string(synthesis.outputs.sharedGround))
  .output("unresolvedQuestions", f.string(synthesis.outputs.unresolvedQuestions).array())
  .output("refinedPosition", f.string(synthesis.outputs.refinedPosition))
  .build();
