// src/features/debate/lib/normalize.ts
/**
 * Turns raw Ax output into the typed values the screens render. Mirrors the backend's coercion:
 * scores are clamped, sides and stances fall back to defaults, and missing text becomes "".
 */
import { STANCE_VALUES, SIDE_VALUES, WINNER_VALUES, type ArgumentPoint, type DebateTurn, type JudgeVerdict, type PersonaProfile } from "../types";
import { clamp, intOf, pickOption, recordOf, textList, textOf } from "./text";

export function normalizePersona(raw: unknown): PersonaProfile {
  const record = recordOf(raw);
  return {
    personaName: textOf(record.personaName),
    systemPrompt: textOf(record.systemPrompt),
    overallStance: pickOption(record.overallStance, STANCE_VALUES, "moderate"),
    strategicPriorities: textList(record.strategicPriorities),
    coreValues: textList(record.coreValues),
    linguisticQuirks: textList(record.linguisticQuirks),
  };
}

export function normalizeTurn(raw: unknown): DebateTurn {
  const record = recordOf(raw);
  return {
    opponentAnalysis: textOf(record.opponentAnalysis),
    coreClaim: textOf(record.coreClaim),
    reasoningAndEvidence: textOf(record.reasoningAndEvidence),
    spokenArgument: textOf(record.spokenArgument),
    rhetoricalDevices: textList(record.rhetoricalDevices),
    closingQuestion: textOf(record.closingQuestion),
  };
}

export function normalizeArgument(raw: unknown): ArgumentPoint {
  const record = recordOf(raw);
  return {
    side: pickOption(record.side, SIDE_VALUES, "pro"),
    claim: textOf(record.claim),
  };
}

export function normalizeVerdict(raw: unknown): JudgeVerdict {
  const record = recordOf(raw);
  return {
    proScore: clamp(intOf(record.proScore, 5), 0, 10),
    conScore: clamp(intOf(record.conScore, 5), 0, 10),
    strongestArgument: normalizeArgument(record.strongestArgument),
    weakestArgument: normalizeArgument(record.weakestArgument),
    winner: pickOption(record.winner, WINNER_VALUES, "tie"),
    reasoning: textOf(record.reasoning),
    judgeComments: textOf(record.judgeComments),
  };
}
