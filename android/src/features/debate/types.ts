// src/features/debate/types.ts
/** Types and enum values for the Debate Engine. Enum values match the backend Literal types. */

export const SIDE_VALUES = ["pro", "con"] as const;
export const STANCE_VALUES = ["aggressive", "defensive", "moderate", "socratic"] as const;
export const STRATEGY_VALUES = ["attack", "defend", "counter"] as const;
export const WINNER_VALUES = ["pro", "con", "tie"] as const;

export type DebateSide = (typeof SIDE_VALUES)[number];
export type RhetoricalStance = (typeof STANCE_VALUES)[number];
export type TurnStrategy = (typeof STRATEGY_VALUES)[number];
export type Winner = (typeof WINNER_VALUES)[number];
export type TurnMode = "type" | "ai";

export interface PersonaFormValues {
  archetype: string;
  style: string;
  intensity: number;
  influences: string;
  topic: string;
  customConstraints: string;
  /** Which side makes the first statement. */
  opener: DebateSide;
}

/** Validated persona request for one side, as sent to the persona architect. */
export interface PersonaInput {
  archetype: string;
  style: string;
  intensity: number;
  influences: string[];
  topic: string;
  side: DebateSide;
  customConstraints?: string;
}

export interface PersonaProfile {
  personaName: string;
  systemPrompt: string;
  overallStance: RhetoricalStance;
  strategicPriorities: string[];
  coreValues: string[];
  linguisticQuirks: string[];
}

export interface HistoryEntry {
  role: string;
  content: string;
}

export interface TurnInput {
  systemPrompt: string;
  topic: string;
  history: HistoryEntry[];
  strategy: TurnStrategy;
  evidence?: string;
  instructions?: string;
}

export interface DebateTurn {
  opponentAnalysis: string;
  coreClaim: string;
  reasoningAndEvidence: string;
  spokenArgument: string;
  rhetoricalDevices: string[];
  closingQuestion: string;
}

export interface TurnPayload {
  side: DebateSide;
  mode: TurnMode;
  /** Typed statement in "type" mode, or an optional direction for the AI in "ai" mode. */
  text: string;
  strategy: TurnStrategy;
  evidence: string;
}

export interface JudgeInput {
  topic: string;
  proTranscript: string;
  conTranscript: string;
}

export interface ArgumentPoint {
  side: DebateSide;
  claim: string;
}

export interface JudgeVerdict {
  proScore: number;
  conScore: number;
  strongestArgument: ArgumentPoint;
  weakestArgument: ArgumentPoint;
  winner: Winner;
  reasoning: string;
  judgeComments: string;
}

/** One debate kept on the device: both personas, the exchanges so far, and the verdict once judged. */
export interface DebateSession {
  topic: string;
  proPersona: PersonaProfile;
  conPersona: PersonaProfile;
  history: HistoryEntry[];
  log: string[];
  lastTurn: DebateTurn | null;
  proTranscript: string;
  conTranscript: string;
  complete: boolean;
  verdict: JudgeVerdict | null;
  /** The form values the debate was built from, so a persona can be regenerated on the same topic. */
  setup?: PersonaFormValues;
}
