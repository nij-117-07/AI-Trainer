// src/features/debate/lib/signatures.ts
/**
 * Ax signatures for the Debate Engine. Instructions and field descriptions live in
 * signature-descriptions.ts, which is copied from Backend/practice/debate/services.py.
 */
import { f } from "@ax-llm/ax";
import { DEBATE_JUDGE_DESCRIPTIONS, DEBATE_TURN_DESCRIPTIONS, PERSONA_ARCHITECT_DESCRIPTIONS } from "./signature-descriptions";
import { SIDE_VALUES, STANCE_VALUES, STRATEGY_VALUES, WINNER_VALUES } from "../types";

const persona = PERSONA_ARCHITECT_DESCRIPTIONS;
const turn = DEBATE_TURN_DESCRIPTIONS;
const judge = DEBATE_JUDGE_DESCRIPTIONS;

export const personaArchitectSignature = f()
  .description(persona.instruction)
  .input("characterArchetype", f.string(persona.inputs.characterArchetype))
  .input("speechStyle", f.string(persona.inputs.speechStyle))
  .input("rhetoricalIntensity", f.number(persona.inputs.rhetoricalIntensity))
  .input("intellectualInfluences", f.string(persona.inputs.intellectualInfluences))
  .input("debateTopic", f.string(persona.inputs.debateTopic))
  .input("side", f.string(`${persona.inputs.side} One of: ${SIDE_VALUES.join(", ")}.`))
  .input("customConstraints", f.string(persona.inputs.customConstraints).optional())
  .output("personaName", f.string(persona.outputs.personaName))
  .output("systemPrompt", f.string(persona.outputs.systemPrompt))
  .output("overallStance", f.class([...STANCE_VALUES], persona.outputs.overallStance))
  .output("strategicPriorities", f.string(persona.outputs.strategicPriorities).array())
  .output("coreValues", f.string(persona.outputs.coreValues).array())
  .output("linguisticQuirks", f.string(persona.outputs.linguisticQuirks).array())
  .build();

export const debateTurnSignature = f()
  .description(turn.instruction)
  .input("systemPrompt", f.string(turn.inputs.systemPrompt))
  .input("debateTopic", f.string(turn.inputs.debateTopic))
  .input("debateContext", f.string(turn.inputs.debateContext))
  .input("chatHistory", f.string(turn.inputs.chatHistory))
  .input("turnStrategy", f.string(`${turn.inputs.turnStrategy} One of: ${STRATEGY_VALUES.join(", ")}.`))
  .input("externalEvidence", f.string(turn.inputs.externalEvidence).optional())
  .input("customInstructions", f.string(turn.inputs.customInstructions).optional())
  .output("opponentAnalysis", f.string(turn.outputs.opponentAnalysis))
  .output("coreClaim", f.string(turn.outputs.coreClaim))
  .output("reasoningAndEvidence", f.string(turn.outputs.reasoningAndEvidence))
  .output("spokenArgument", f.string(turn.outputs.spokenArgument))
  .output("rhetoricalDevices", f.string(turn.outputs.rhetoricalDevices).array())
  .output("closingQuestion", f.string(turn.outputs.closingQuestion))
  .build();

export const debateJudgeSignature = f()
  .description(judge.instruction)
  .input("debateTopic", f.string(judge.inputs.debateTopic))
  .input("proTranscript", f.string(judge.inputs.proTranscript))
  .input("conTranscript", f.string(judge.inputs.conTranscript))
  .output("proScore", f.number(judge.outputs.proScore))
  .output("conScore", f.number(judge.outputs.conScore))
  .output(
    "strongestArgument",
    f.object(
      {
        side: f.string("The side the argument belongs to: pro or con."),
        claim: f.string("The claim of the argument."),
      },
      judge.outputs.strongestArgument,
    ),
  )
  .output(
    "weakestArgument",
    f.object(
      {
        side: f.string("The side the argument belongs to: pro or con."),
        claim: f.string("The claim of the argument."),
      },
      judge.outputs.weakestArgument,
    ),
  )
  .output("winner", f.class([...WINNER_VALUES], judge.outputs.winner))
  .output("reasoning", f.string(judge.outputs.reasoning))
  .output("judgeComments", f.string(judge.outputs.judgeComments))
  .build();
