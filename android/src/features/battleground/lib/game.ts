// src/features/battleground/lib/game.ts
/**
 * Pure battleground rules: building a new session, applying a round's adjudication to health, and
 * deciding when the mission ends. Mirrors the webui BattlegroundPage flow without any I/O.
 */
import type {
  BattleChallenge,
  BattleDifficulty,
  BattleEvaluation,
  BattleSession,
  BattleSetup,
  RoundOutcome,
  RoundResult,
} from "../types";
import { clamp } from "./text";

export const OPENING_PREVIOUS_ACTION = "None yet";
export const OPENING_LEARNING_LOG = "Initial reconnaissance phase. Gathering intel on target.";
export const OPENING_SCORE = 0.5;

export function clampHealth(value: number): number {
  return clamp(Math.round(value), 0, 100);
}

export function createSession(
  topic: string,
  difficulty: BattleDifficulty,
  setup: BattleSetup,
  firstChallenge: BattleChallenge,
): BattleSession {
  const userResources: Record<string, number> = {};
  for (const item of setup.userProfile.availableLoadout) userResources[item] = 1;

  return {
    topic,
    difficulty,
    userProfile: setup.userProfile,
    userHealth: setup.initialUserHealth,
    userResources,
    opponentProfile: setup.opponentProfile,
    opponentStrategy: setup.opponentStrategy,
    opponentFirstImpression: setup.opponentFirstImpression,
    opponentHealth: setup.initialOpponentHealth,
    opponentLearningLog: firstChallenge.updatedLearningLog,
    scenarioContext: setup.scenarioContext,
    battlefieldEnvironment: setup.battlefieldEnvironment,
    evaluationCriteria: setup.evaluationCriteria,
    missionObjective: setup.missionObjective,
    rulesOfEngagement: setup.rulesOfEngagement,
    roundNumber: 1,
    currentChallenge: firstChallenge,
    roundScores: [],
    isActive: true,
    terminationReason: "",
    lastUserAction: "",
    lastEvaluation: null,
  };
}

/** Applies the evaluation's health deltas and decides whether the mission has ended. */
export function resolveRound(session: BattleSession, evaluation: BattleEvaluation): RoundOutcome {
  const userHealth = clampHealth(session.userHealth + evaluation.hpDeltaUser);
  const opponentHealth = clampHealth(session.opponentHealth + evaluation.hpDeltaOpponent);
  const terminated = evaluation.isTerminated || userHealth <= 0 || opponentHealth <= 0;
  return {
    userHealth,
    opponentHealth,
    terminated,
    terminationReason: terminated ? terminationText(evaluation, userHealth, opponentHealth) : "",
  };
}

function terminationText(evaluation: BattleEvaluation, userHealth: number, opponentHealth: number): string {
  if (evaluation.terminationReason) return evaluation.terminationReason;
  if (userHealth <= 0) return "Your forces were overwhelmed and the mission is lost.";
  if (opponentHealth <= 0) return "The opponent is eliminated. Mission accomplished.";
  return "The simulation concluded.";
}

export function finishRound(session: BattleSession, answer: string, round: RoundResult): BattleSession {
  const { evaluation, outcome, nextChallenge } = round;
  return {
    ...session,
    userHealth: outcome.userHealth,
    opponentHealth: outcome.opponentHealth,
    opponentLearningLog: nextChallenge?.updatedLearningLog ?? session.opponentLearningLog,
    roundNumber: nextChallenge ? session.roundNumber + 1 : session.roundNumber,
    currentChallenge: nextChallenge,
    roundScores: [...session.roundScores, evaluation.score],
    isActive: !outcome.terminated,
    terminationReason: outcome.terminated ? outcome.terminationReason : "",
    lastUserAction: answer,
    lastEvaluation: evaluation,
  };
}

/** Average of the round scores as a 0-1 value, or 0 before any round is scored. */
export function averageScore(scores: number[]): number {
  if (scores.length === 0) return 0;
  return scores.reduce((sum, score) => sum + score, 0) / scores.length;
}
