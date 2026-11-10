// src/features/battleground/lib/generators.ts
/**
 * Battleground generators. startBattle builds the profiles, opponent, scenario, and first
 * challenge; playRound adjudicates one answer and draws the next challenge. Both accept an
 * AbortSignal so a reset or leaving the screen stops the remaining model calls.
 */
import { ax } from "@ax-llm/ax";
import type { AiSettings } from "@/features/ai-settings/types";
import { createLlm } from "@/features/ai-settings/lib/llm";
import {
  challengeSignature,
  evaluatorSignature,
  opponentSignature,
  scenarioSignature,
  tacticsSignature,
  userProfileSignature,
} from "./signatures";
import { DEFAULT_CALLSIGN } from "../options";
import type {
  BattleChallenge,
  BattleFormValues,
  BattleProfile,
  BattleSession,
  BattleSetup,
  OpponentProfile,
  RoundResult,
} from "../types";
import {
  createSession,
  OPENING_LEARNING_LOG,
  OPENING_PREVIOUS_ACTION,
  OPENING_SCORE,
  resolveRound,
} from "./game";
import {
  normalizeChallenge,
  normalizeEvaluation,
  normalizeHealth,
  normalizeOpponent,
  normalizeProfile,
} from "./normalize";
import { textList, textOf, textRecord } from "./text";
import { optionalText, requireDifficulty, requireMove, requireText } from "./validate";

const TEMPERATURE = 0.4;

type Llm = ReturnType<typeof createLlm>;

interface ChallengeContext {
  scenarioContext: string;
  battlefieldEnvironment: Record<string, string>;
  userProfile: BattleProfile;
  opponentProfile: OpponentProfile;
  userHealth: number;
  opponentHealth: number;
  previousUserAction: string;
  previousScore: number;
  roundNumber: number;
  opponentLearningLog: string;
}

function callOptions(signal: AbortSignal) {
  return { modelConfig: { temperature: TEMPERATURE }, abortSignal: signal };
}

function throwIfCancelled(signal: AbortSignal) {
  if (signal.aborted) throw new Error("The battle was cancelled.");
}

function fallback(value: string, text: string): string {
  return value || text;
}

export async function startBattle(
  settings: AiSettings,
  values: BattleFormValues,
  signal: AbortSignal,
): Promise<BattleSession> {
  const llm = createLlm(settings);
  const topic = requireText(values.topic, "Battleground topic", 300);
  const difficulty = requireDifficulty(values.difficulty);
  const name = optionalText(values.name, "Callsign", 100) ?? DEFAULT_CALLSIGN;
  const expertise = optionalText(values.expertise, "Expertise", 300) ?? "Not specified";
  const preferredStyle = optionalText(values.preferredStyle, "Preferred style", 300) ?? "Not specified";
  const background = optionalText(values.background, "Background", 1000) ?? "Not specified";

  const profileResult = await ax(userProfileSignature).forward(
    llm,
    {
      userName: name,
      userExpertise: expertise,
      userPreferredStyle: preferredStyle,
      userBackground: background,
      battlegroundTopic: topic,
    },
    callOptions(signal),
  );
  throwIfCancelled(signal);
  const userProfile = normalizeProfile(profileResult.userProfile, name);

  const opponentResult = await ax(opponentSignature).forward(
    llm,
    {
      battlegroundTopic: topic,
      difficulty,
      userProfile: JSON.stringify(userProfile),
      battlegroundTheme: topic,
    },
    callOptions(signal),
  );
  throwIfCancelled(signal);
  const opponentProfile = normalizeOpponent(opponentResult.opponentProfile);
  const opponentStrategy = textOf(opponentResult.opponentStrategy);

  const scenarioResult = await ax(scenarioSignature).forward(
    llm,
    {
      battlegroundTopic: topic,
      difficulty,
      userProfile: JSON.stringify(userProfile),
      opponentProfile: JSON.stringify(opponentProfile),
      opponentStrategy: fallback(opponentStrategy, "No strategy provided."),
    },
    callOptions(signal),
  );
  throwIfCancelled(signal);

  const setup: BattleSetup = {
    userProfile,
    opponentProfile,
    opponentStrategy,
    opponentFirstImpression: textOf(opponentResult.firstImpression),
    scenarioContext: textOf(scenarioResult.scenarioContext),
    battlefieldEnvironment: textRecord(scenarioResult.battlefieldEnvironment),
    evaluationCriteria: textRecord(scenarioResult.evaluationCriteria),
    missionObjective: textOf(scenarioResult.missionObjective),
    rulesOfEngagement: textList(scenarioResult.rulesOfEngagement),
    initialUserHealth: normalizeHealth(scenarioResult.initialUserHealth, 100, 50, 100),
    initialOpponentHealth: normalizeHealth(scenarioResult.initialOpponentHealth, 80, 60, 100),
  };

  const firstChallenge = await drawChallenge(
    llm,
    {
      scenarioContext: setup.scenarioContext,
      battlefieldEnvironment: setup.battlefieldEnvironment,
      userProfile,
      opponentProfile,
      userHealth: setup.initialUserHealth,
      opponentHealth: setup.initialOpponentHealth,
      previousUserAction: OPENING_PREVIOUS_ACTION,
      previousScore: OPENING_SCORE,
      roundNumber: 1,
      opponentLearningLog: OPENING_LEARNING_LOG,
    },
    signal,
  );

  return createSession(topic, difficulty, setup, firstChallenge);
}

export async function playRound(settings: AiSettings, session: BattleSession, answer: string, signal: AbortSignal): Promise<RoundResult> {
  const llm = createLlm(settings);
  const challenge = session.currentChallenge;
  if (!challenge) throw new Error("No active challenge in this session.");
  const response = requireMove(answer);

  const raw = await ax(evaluatorSignature).forward(
    llm,
    {
      scenarioContext: fallback(session.scenarioContext, "No narrative provided."),
      battlefieldEnvironment: JSON.stringify(session.battlefieldEnvironment),
      evaluationCriteria: JSON.stringify(session.evaluationCriteria),
      currentChallenge: fallback(challenge.challenge, "Respond to the current challenge."),
      mainQuestion: fallback(challenge.question, "What is your next move?"),
      referenceMaterial: JSON.stringify(challenge.referenceMaterial),
      userResponse: response,
      userHealth: session.userHealth,
      opponentHealth: session.opponentHealth,
      userProfile: JSON.stringify(session.userProfile),
      opponentProfile: JSON.stringify(session.opponentProfile),
      tacticUsed: fallback(challenge.tacticType, "unspecified"),
    },
    callOptions(signal),
  );
  throwIfCancelled(signal);

  const evaluation = normalizeEvaluation(raw);
  const outcome = resolveRound(session, evaluation);
  let nextChallenge: BattleChallenge | null = null;
  if (!outcome.terminated) {
    nextChallenge = await drawChallenge(
      llm,
      {
        scenarioContext: session.scenarioContext,
        battlefieldEnvironment: session.battlefieldEnvironment,
        userProfile: session.userProfile,
        opponentProfile: session.opponentProfile,
        userHealth: outcome.userHealth,
        opponentHealth: outcome.opponentHealth,
        previousUserAction: response,
        previousScore: evaluation.score,
        roundNumber: session.roundNumber + 1,
        opponentLearningLog: challenge.updatedLearningLog,
      },
      signal,
    );
  }

  return { evaluation, outcome, nextChallenge };
}

/** Two-step round: the opponent picks a tactic, then the scenario director frames the challenge. */
async function drawChallenge(llm: Llm, context: ChallengeContext, signal: AbortSignal): Promise<BattleChallenge> {
  const tactics = await ax(tacticsSignature).forward(
    llm,
    {
      opponentProfile: JSON.stringify(context.opponentProfile),
      battlefieldEnvironment: JSON.stringify(context.battlefieldEnvironment),
      userHealth: context.userHealth,
      opponentHealth: context.opponentHealth,
      previousUserAction: fallback(context.previousUserAction, OPENING_PREVIOUS_ACTION),
      previousScore: context.previousScore,
      roundNumber: context.roundNumber,
      opponentLearningLog: fallback(context.opponentLearningLog, OPENING_LEARNING_LOG),
      userProfile: JSON.stringify(context.userProfile),
    },
    callOptions(signal),
  );
  throwIfCancelled(signal);

  const tacticType = textOf(tactics.decision);
  const raw = await ax(challengeSignature).forward(
    llm,
    {
      scenarioContext: fallback(context.scenarioContext, "No narrative provided."),
      battlefieldEnvironment: JSON.stringify(context.battlefieldEnvironment),
      userProfile: JSON.stringify(context.userProfile),
      opponentProfile: JSON.stringify(context.opponentProfile),
      tacticDecision: fallback(tacticType, "unspecified"),
      tacticReasoning: fallback(textOf(tactics.reasoning), "Not provided."),
      targetWeakness: fallback(textOf(tactics.targetWeakness), "Not specified."),
      currentStateSummary: `Round ${context.roundNumber}. User HP: ${context.userHealth} | Opponent HP: ${context.opponentHealth}`,
      roundNumber: context.roundNumber,
    },
    callOptions(signal),
  );
  throwIfCancelled(signal);

  return {
    ...normalizeChallenge(raw, tacticType),
    updatedLearningLog: textOf(tactics.updatedLearningLog),
  };
}
