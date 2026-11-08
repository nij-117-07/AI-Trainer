// src/features/battleground/lib/signatures.ts
/**
 * Ax signatures for the Battleground Simulator. Instructions and field descriptions live in
 * signature-descriptions.ts, which is copied from Backend/practice/battleground/services.py.
 * Open-key dictionaries and dictionary inputs travel as JSON strings; enum inputs are plain
 * strings with the allowed values listed in the description.
 */
import { f } from "@ax-llm/ax";
import {
  CHALLENGE_DESCRIPTIONS,
  EVALUATOR_DESCRIPTIONS,
  OPPONENT_DESCRIPTIONS,
  SCENARIO_DESCRIPTIONS,
  TACTICS_DESCRIPTIONS,
  USER_PROFILE_DESCRIPTIONS,
} from "./signature-descriptions";

const profile = USER_PROFILE_DESCRIPTIONS;
const opponent = OPPONENT_DESCRIPTIONS;
const scenario = SCENARIO_DESCRIPTIONS;
const tactics = TACTICS_DESCRIPTIONS;
const challenge = CHALLENGE_DESCRIPTIONS;
const evaluator = EVALUATOR_DESCRIPTIONS;

const DIFFICULTY_HINT = "One of: easy, medium, hard.";

export const userProfileSignature = f()
  .description(profile.instruction)
  .input("userName", f.string(profile.inputs.userName))
  .input("userExpertise", f.string(profile.inputs.userExpertise))
  .input("userPreferredStyle", f.string(profile.inputs.userPreferredStyle))
  .input("userBackground", f.string(profile.inputs.userBackground))
  .input("battlegroundTopic", f.string(profile.inputs.battlegroundTopic))
  .output(
    "userProfile",
    f
      .object(
        {
          callsign: f.string(profile.outputs.profile.callsign).optional(),
          rank: f.string(profile.outputs.profile.rank).optional(),
          specializations: f.string(profile.outputs.profile.specializations).array().optional(),
          strengths: f.string(profile.outputs.profile.strengths).array().optional(),
          weaknesses: f.string(profile.outputs.profile.weaknesses).array().optional(),
          availableLoadout: f.string(profile.outputs.profile.availableLoadout).array().optional(),
          combatDoctrine: f.string(profile.outputs.profile.combatDoctrine).optional(),
        },
        profile.outputs.userProfile,
      ),
  )
  .build();

export const opponentSignature = f()
  .description(opponent.instruction)
  .input("battlegroundTopic", f.string(opponent.inputs.battlegroundTopic))
  .input("difficulty", f.string(`${opponent.inputs.difficulty} ${DIFFICULTY_HINT}`))
  .input("userProfile", f.string(opponent.inputs.userProfile))
  .input("battlegroundTheme", f.string(opponent.inputs.battlegroundTheme))
  .output(
    "opponentProfile",
    f
      .object(
        {
          name: f.string(opponent.outputs.profile.name).optional(),
          title: f.string(opponent.outputs.profile.title).optional(),
          capabilities: f.string(opponent.outputs.profile.capabilities).optional(),
          motives: f.string(opponent.outputs.profile.motives).optional(),
          personality: f.string(opponent.outputs.profile.personality).array().optional(),
          adaptabilityStyle: f.string(opponent.outputs.profile.adaptabilityStyle).optional(),
          signatureTactics: f.string(opponent.outputs.profile.signatureTactics).array().optional(),
          weaknesses: f.string(opponent.outputs.profile.weaknesses).array().optional(),
          availableResources: f.string(opponent.outputs.profile.availableResources).array().optional(),
        },
        opponent.outputs.opponentProfile,
      ),
  )
  .output("opponentStrategy", f.string(opponent.outputs.opponentStrategy))
  .output("firstImpression", f.string(opponent.outputs.firstImpression))
  .build();

export const scenarioSignature = f()
  .description(scenario.instruction)
  .input("battlegroundTopic", f.string(scenario.inputs.battlegroundTopic))
  .input("difficulty", f.string(`${scenario.inputs.difficulty} ${DIFFICULTY_HINT}`))
  .input("userProfile", f.string(scenario.inputs.userProfile))
  .input("opponentProfile", f.string(scenario.inputs.opponentProfile))
  .input("opponentStrategy", f.string(scenario.inputs.opponentStrategy))
  .output("scenarioContext", f.string(scenario.outputs.scenarioContext))
  .output(
    "battlefieldEnvironment",
    f
      .object(
        {
          terrain: f.string(scenario.outputs.environment.terrain).optional(),
          weatherConditions: f.string(scenario.outputs.environment.weatherConditions).optional(),
          timeOfDay: f.string(scenario.outputs.environment.timeOfDay).optional(),
          hazards: f.string(scenario.outputs.environment.hazards).optional(),
          strategicPoints: f.string(scenario.outputs.environment.strategicPoints).optional(),
        },
        scenario.outputs.battlefieldEnvironment,
      ),
  )
  .output("initialUserHealth", f.number(scenario.outputs.initialUserHealth))
  .output("initialOpponentHealth", f.number(scenario.outputs.initialOpponentHealth))
  .output("evaluationCriteria", f.string(scenario.outputs.evaluationCriteria))
  .output("missionObjective", f.string(scenario.outputs.missionObjective))
  .output("rulesOfEngagement", f.string(scenario.outputs.rulesOfEngagement).array())
  .build();

export const tacticsSignature = f()
  .description(tactics.instruction)
  .input("opponentProfile", f.string(tactics.inputs.opponentProfile))
  .input("battlefieldEnvironment", f.string(tactics.inputs.battlefieldEnvironment))
  .input("userHealth", f.number(tactics.inputs.userHealth))
  .input("opponentHealth", f.number(tactics.inputs.opponentHealth))
  .input("previousUserAction", f.string(tactics.inputs.previousUserAction))
  .input("previousScore", f.number(tactics.inputs.previousScore))
  .input("roundNumber", f.number(tactics.inputs.roundNumber))
  .input("opponentLearningLog", f.string(tactics.inputs.opponentLearningLog))
  .input("userProfile", f.string(tactics.inputs.userProfile))
  .output("decision", f.string(tactics.outputs.decision))
  .output("reasoning", f.string(tactics.outputs.reasoning))
  .output("targetWeakness", f.string(tactics.outputs.targetWeakness))
  .output("expectedUserResponseType", f.string(tactics.outputs.expectedUserResponseType))
  .output("updatedLearningLog", f.string(tactics.outputs.updatedLearningLog))
  .build();

export const challengeSignature = f()
  .description(challenge.instruction)
  .input("scenarioContext", f.string(challenge.inputs.scenarioContext))
  .input("battlefieldEnvironment", f.string(challenge.inputs.battlefieldEnvironment))
  .input("userProfile", f.string(challenge.inputs.userProfile))
  .input("opponentProfile", f.string(challenge.inputs.opponentProfile))
  .input("tacticDecision", f.string(challenge.inputs.tacticDecision))
  .input("tacticReasoning", f.string(challenge.inputs.tacticReasoning))
  .input("targetWeakness", f.string(challenge.inputs.targetWeakness))
  .input("currentStateSummary", f.string(challenge.inputs.currentStateSummary))
  .input("roundNumber", f.number(challenge.inputs.roundNumber))
  .output("missionBriefing", f.string(challenge.outputs.missionBriefing))
  .output("tacticalSituation", f.string(challenge.outputs.tacticalSituation))
  .output("specificChallenge", f.string(challenge.outputs.specificChallenge))
  .output("mainQuestion", f.string(challenge.outputs.mainQuestion))
  .output("constraints", f.string(challenge.outputs.constraints).array())
  .output("referenceMaterial", f.string(challenge.outputs.referenceMaterial))
  .output("environmentChange", f.string(challenge.outputs.environmentChange))
  .build();

export const evaluatorSignature = f()
  .description(evaluator.instruction)
  .input("scenarioContext", f.string(evaluator.inputs.scenarioContext))
  .input("battlefieldEnvironment", f.string(evaluator.inputs.battlefieldEnvironment))
  .input("evaluationCriteria", f.string(evaluator.inputs.evaluationCriteria))
  .input("currentChallenge", f.string(evaluator.inputs.currentChallenge))
  .input("mainQuestion", f.string(evaluator.inputs.mainQuestion))
  .input("referenceMaterial", f.string(evaluator.inputs.referenceMaterial))
  .input("userResponse", f.string(evaluator.inputs.userResponse))
  .input("userHealth", f.number(evaluator.inputs.userHealth))
  .input("opponentHealth", f.number(evaluator.inputs.opponentHealth))
  .input("userProfile", f.string(evaluator.inputs.userProfile))
  .input("opponentProfile", f.string(evaluator.inputs.opponentProfile))
  .input("tacticUsed", f.string(evaluator.inputs.tacticUsed))
  .output("score", f.number(evaluator.outputs.score))
  .output("feedback", f.string(evaluator.outputs.feedback))
  .output("healthImpactUser", f.number(evaluator.outputs.healthImpactUser))
  .output("healthImpactOpponent", f.number(evaluator.outputs.healthImpactOpponent))
  .output("isTerminated", f.boolean(evaluator.outputs.isTerminated))
  .output("terminationReason", f.string(evaluator.outputs.terminationReason))
  .output("narrativeConsequence", f.string(evaluator.outputs.narrativeConsequence))
  .output("battlefieldShift", f.string(evaluator.outputs.battlefieldShift))
  .output("resourceImpact", f.string(evaluator.outputs.resourceImpact))
  .build();
