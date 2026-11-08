// src/features/battleground/types.ts
/** Form, model-output, and saved-session types for the Battleground Simulator. */

export const BATTLE_DIFFICULTIES = ["easy", "medium", "hard"] as const;
export type BattleDifficulty = (typeof BATTLE_DIFFICULTIES)[number];

export interface BattleFormValues {
  name: string;
  expertise: string;
  preferredStyle: string;
  background: string;
  topic: string;
  difficulty: BattleDifficulty;
}

export interface BattleProfile {
  callsign: string;
  rank: string;
  specializations: string[];
  strengths: string[];
  weaknesses: string[];
  availableLoadout: string[];
  combatDoctrine: string;
}

export interface OpponentProfile {
  name: string;
  title: string;
  capabilities: Record<string, string>;
  motives: string;
  personality: string[];
  adaptabilityStyle: string;
  signatureTactics: string[];
  weaknesses: string[];
  availableResources: string[];
}

export interface BattleSetup {
  userProfile: BattleProfile;
  opponentProfile: OpponentProfile;
  opponentStrategy: string;
  opponentFirstImpression: string;
  scenarioContext: string;
  battlefieldEnvironment: Record<string, string>;
  evaluationCriteria: Record<string, string>;
  missionObjective: string;
  rulesOfEngagement: string[];
  initialUserHealth: number;
  initialOpponentHealth: number;
}

export interface BattleChallenge {
  tacticType: string;
  briefing: string;
  tacticalSituation: string;
  challenge: string;
  question: string;
  constraints: string[];
  referenceMaterial: Record<string, string>;
  updatedLearningLog: string;
  environmentChange: string;
}

export interface BattleEvaluation {
  score: number;
  feedback: string;
  narrative: string;
  battlefieldShift: string;
  hpDeltaUser: number;
  hpDeltaOpponent: number;
  resourceImpact: Record<string, number>;
  isTerminated: boolean;
  terminationReason: string;
}

/** Client-side state of one battleground run, persisted between visits. */
export interface BattleSession {
  topic: string;
  difficulty: BattleDifficulty;
  userProfile: BattleProfile;
  userHealth: number;
  userResources: Record<string, number>;
  opponentProfile: OpponentProfile;
  opponentStrategy: string;
  opponentFirstImpression: string;
  opponentHealth: number;
  opponentLearningLog: string;
  scenarioContext: string;
  battlefieldEnvironment: Record<string, string>;
  evaluationCriteria: Record<string, string>;
  missionObjective: string;
  rulesOfEngagement: string[];
  roundNumber: number;
  currentChallenge: BattleChallenge | null;
  roundScores: number[];
  isActive: boolean;
  terminationReason: string;
  lastUserAction: string;
  lastEvaluation: BattleEvaluation | null;
}

export interface RoundOutcome {
  userHealth: number;
  opponentHealth: number;
  terminated: boolean;
  terminationReason: string;
}

export interface RoundResult {
  evaluation: BattleEvaluation;
  outcome: RoundOutcome;
  nextChallenge: BattleChallenge | null;
}
