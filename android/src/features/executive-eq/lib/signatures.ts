// src/features/executive-eq/lib/signatures.ts
/**
 * Ax signatures for the Executive EQ Trainer. Instructions and field descriptions live in
 * signature-descriptions.ts, which is copied from Backend/practice/executive_eq/services.py.
 */
import { f } from "@ax-llm/ax";
import {
  EQ_EVALUATOR_DESCRIPTIONS,
  EQ_TRAINER_DESCRIPTIONS,
  SCENARIO_GENERATOR_DESCRIPTIONS,
} from "./signature-descriptions";

const scenario = SCENARIO_GENERATOR_DESCRIPTIONS;
const trainer = EQ_TRAINER_DESCRIPTIONS;
const evaluator = EQ_EVALUATOR_DESCRIPTIONS;

export const scenarioSignature = f()
  .description(scenario.instruction)
  .input("userRole", f.string(scenario.inputs.userRole))
  .input("narrativeArc", f.string(scenario.inputs.narrativeArc))
  .input("learningFocus", f.string(scenario.inputs.learningFocus))
  .input("difficultyLevel", f.string(scenario.inputs.difficultyLevel))
  .input("industryContext", f.string(scenario.inputs.industryContext))
  .output("scenarioTitle", f.string(scenario.outputs.scenarioTitle))
  .output("settingDescription", f.string(scenario.outputs.settingDescription))
  .output(
    "npcProfile",
    f.object(
      {
        name: f.string("Full name"),
        title: f.string("Corporate title"),
        personality: f.string("Core behavioral traits"),
        hiddenMotive: f.string("What they actually want vs. what they say"),
        tell: f.string("A subtle non-verbal habit when lying or stressed"),
      },
      scenario.outputs.npcProfile,
    ),
  )
  .output("initialStakes", f.string(scenario.outputs.initialStakes))
  .output("openingHook", f.string(scenario.outputs.openingHook))
  .build();

export const eqTrainerSignature = f()
  .description(trainer.instruction)
  .input("previousScenario", f.string(trainer.inputs.previousScenario).optional())
  .input("narrativeArc", f.string(trainer.inputs.narrativeArc))
  .input("chatHistory", f.string(trainer.inputs.chatHistory))
  .input("learningFocus", f.string(trainer.inputs.learningFocus))
  .input("seed", f.string(trainer.inputs.seed))
  .input("userCustomization", f.string(trainer.inputs.userCustomization).optional())
  .output("rationale", f.string(trainer.outputs.rationale))
  .output("meetingScenario", f.string(trainer.outputs.meetingScenario))
  .output("npcDialogue", f.string(trainer.outputs.npcDialogue))
  .output("eqCoachMessage", f.string(trainer.outputs.eqCoachMessage))
  .output("suggestedStrategies", f.string(trainer.outputs.suggestedStrategies).array())
  .build();

export const eqEvaluatorSignature = f()
  .description(evaluator.instruction)
  .input("scenarioContext", f.string(evaluator.inputs.scenarioContext))
  .input("npcLastStatement", f.string(evaluator.inputs.npcLastStatement))
  .input("userResponse", f.string(evaluator.inputs.userResponse))
  .input("learningFocus", f.string(evaluator.inputs.learningFocus))
  .output("subtextAccuracy", f.string(evaluator.outputs.subtextAccuracy))
  .output("statusImpact", f.string(evaluator.outputs.statusImpact))
  .output("strategicGrade", f.string(evaluator.outputs.strategicGrade))
  .output("strengths", f.string(evaluator.outputs.strengths).array())
  .output("criticalFlaws", f.string(evaluator.outputs.criticalFlaws).array())
  .output("theRewrittenProMove", f.string(evaluator.outputs.theRewrittenProMove))
  .output("coachingTip", f.string(evaluator.outputs.coachingTip))
  .build();
