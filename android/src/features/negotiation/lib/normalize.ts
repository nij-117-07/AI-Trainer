// src/features/negotiation/lib/normalize.ts
/**
 * Turns raw model output into the typed values the Negotiation screens use, and builds the
 * transcript text the model reads. Fallbacks match Backend/practice/negotiation/services.py.
 */
import type {
  CategoryScores,
  ChatTurn,
  InternalPosition,
  MessageAnalysis,
  NegotiationScenario,
  SessionEntry,
  SessionReport,
} from "../types";
import { isRecord, textList, textOf, wholeOf } from "./text";

const WILLINGNESS = ["high", "medium", "low"] as const;

export function normalizeScenario(raw: Record<string, unknown>): NegotiationScenario {
  const scenario: NegotiationScenario = {
    title: textOf(raw.title),
    context: textOf(raw.context),
    yourRole: textOf(raw.yourRole),
    yourGoal: textOf(raw.yourGoal),
    yourConstraints: textOf(raw.yourConstraints),
    opponentRole: textOf(raw.opponentRole),
    opponentGoal: textOf(raw.opponentGoal),
    opponentConstraints: textOf(raw.opponentConstraints),
    keyIssues: textList(raw.keyIssues),
    startingStanceOpponent: textOf(raw.startingStanceOpponent),
  };
  if (!scenario.startingStanceOpponent) {
    throw new Error("The scenario came back without an opening message. Try generating it again.");
  }
  return scenario;
}

export function normalizeInternalPosition(raw: Record<string, unknown>): InternalPosition {
  const willingness = textOf(raw.willingnessToConcede).toLowerCase();
  return {
    satisfaction: wholeOf(raw.satisfaction, 5, 0, 10),
    willingnessToConcede: (WILLINGNESS as readonly string[]).includes(willingness) ? willingness : "medium",
    concessionsMade: textList(raw.concessionsMade),
    keyDemands: textList(raw.keyDemands),
  };
}

export function normalizeAnalysis(raw: Record<string, unknown>): MessageAnalysis {
  return {
    tacticsUsed: textList(raw.tacticsUsed),
    effectivenessRating: wholeOf(raw.effectivenessRating, 5, 1, 10),
    feedbackSnippet: textOf(raw.feedbackSnippet),
  };
}

function normalizeCategories(raw: unknown): CategoryScores {
  const data = isRecord(raw) ? raw : {};
  const score = (key: string) => wholeOf(data[key], 5, 0, 10);
  return {
    preparation: score("preparation"),
    communication: score("communication"),
    strategy: score("strategy"),
    listening: score("listening"),
    problemSolving: score("problemSolving"),
    flexibility: score("flexibility"),
  };
}

export function normalizeReport(raw: Record<string, unknown>): SessionReport {
  return {
    overallScore: wholeOf(raw.overallScore, 50, 0, 100),
    scoresByCategory: normalizeCategories(raw.scoresByCategory),
    strengths: textList(raw.strengths),
    areasForImprovement: textList(raw.areasForImprovement),
    keyTakeaways: textList(raw.keyTakeaways),
    suggestedResources: textList(raw.suggestedResources),
  };
}

/** The chat turns the model sees: chat messages only, in order. Coach tips are left out. */
export function historyOf(log: SessionEntry[]): ChatTurn[] {
  return log
    .filter((entry): entry is SessionEntry & { role: "user" | "opponent" } => entry.role !== "coach")
    .map((entry) => ({ role: entry.role, message: entry.text }));
}

/** Transcript text in the backend format: one "[role]: message" line per turn. */
export function formatHistory(turns: ChatTurn[]): string {
  return turns.map((turn) => `[${turn.role}]: ${turn.message}`).join("\n");
}

/** Raw model output as a record. Anything that is not an object becomes an empty record. */
export function asRecord(value: unknown): Record<string, unknown> {
  return isRecord(value) ? value : {};
}

/** Scenario as the backend serialises it (snake_case JSON), passed to the model as context. */
export function scenarioContextText(scenario: NegotiationScenario): string {
  return JSON.stringify({
    title: scenario.title,
    context: scenario.context,
    your_role: scenario.yourRole,
    your_goal: scenario.yourGoal,
    your_constraints: scenario.yourConstraints,
    opponent_role: scenario.opponentRole,
    opponent_goal: scenario.opponentGoal,
    opponent_constraints: scenario.opponentConstraints,
    key_issues: scenario.keyIssues,
    starting_stance_opponent: scenario.startingStanceOpponent,
  });
}
