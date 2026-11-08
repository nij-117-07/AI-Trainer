// src/features/foresight-trainer/lib/signatures.ts
/**
 * Ax signatures for the Foresight Trainer. Instructions and field descriptions live in
 * signature-descriptions.ts, which is copied from Backend/practice/foresight_trainer/services.py.
 * Dict and list inputs are sent as JSON text, one record per line for lists.
 */
import { f } from "@ax-llm/ax";
import {
  CONSEQUENCE_ENGINE_DESCRIPTIONS,
  CONTEXT_ANALYZER_DESCRIPTIONS,
  DECISION_EVALUATOR_DESCRIPTIONS,
  INSIGHT_GENERATOR_DESCRIPTIONS,
  NEXT_SCENE_GENERATOR_DESCRIPTIONS,
  OPTION_DESIGNER_DESCRIPTIONS,
  PROGRESS_TRACKER_DESCRIPTIONS,
  SITUATION_GENERATOR_DESCRIPTIONS,
} from "./signature-descriptions";

const analyzer = CONTEXT_ANALYZER_DESCRIPTIONS;
const situation = SITUATION_GENERATOR_DESCRIPTIONS;
const designer = OPTION_DESIGNER_DESCRIPTIONS;
const evaluator = DECISION_EVALUATOR_DESCRIPTIONS;
const consequence = CONSEQUENCE_ENGINE_DESCRIPTIONS;
const nextScene = NEXT_SCENE_GENERATOR_DESCRIPTIONS;
const insight = INSIGHT_GENERATOR_DESCRIPTIONS;
const progress = PROGRESS_TRACKER_DESCRIPTIONS;

export const contextAnalyzerSignature = f()
  .description(analyzer.instruction)
  .input("userContext", f.string(analyzer.inputs.userContext))
  .input("mainTheme", f.string(analyzer.inputs.mainTheme))
  .input("difficultyLevel", f.string(analyzer.inputs.difficultyLevel))
  .output(
    "scenarioBlueprint",
    f.object(
      {
        setting: f.string("Where and when this takes place"),
        protagonist: f.string("Who the user is in this scenario (role, constraints, resources)"),
        coreConflict: f.string("The central tension or problem"),
        stakes: f.string("What happens if they succeed or fail"),
        thinkingSkill: f.string("The specific cognitive skill being trained"),
        tone: f.string("The narrative tone (tense, reflective, fast-paced, etc.)"),
        hiddenVariables: f.string("A factor the user does not know about yet").array(),
      },
      analyzer.outputs.scenarioBlueprint,
    ),
  )
  .build();

export const situationGeneratorSignature = f()
  .description(situation.instruction)
  .input("scenarioBlueprint", f.string(situation.inputs.scenarioBlueprint))
  .input("sceneNumber", f.number(situation.inputs.sceneNumber))
  .input("previousContext", f.string(situation.inputs.previousContext).optional())
  .output("sceneNarrative", f.string(situation.outputs.sceneNarrative))
  .output("decisionPoint", f.string(situation.outputs.decisionPoint))
  .output("timePressure", f.string(situation.outputs.timePressure))
  .build();

export const optionDesignerSignature = f()
  .description(designer.instruction)
  .input("decisionPoint", f.string(designer.inputs.decisionPoint))
  .input("sceneNarrative", f.string(designer.inputs.sceneNarrative))
  .input("scenarioBlueprint", f.string(designer.inputs.scenarioBlueprint))
  .output(
    "options",
    f
      .object(
        {
          id: f.string("Option letter (A, B, C, D)"),
          title: f.string("Short 3-5 word label for the option"),
          description: f.string("What this action involves (2-3 sentences)"),
          approachType: f.string("The thinking style of this option"),
          riskLevel: f.string("low, medium, or high"),
          timeCost: f.string("fast, moderate, or slow"),
          hiddenTradeoff: f.string("What this option sacrifices (shown only after choice)"),
        },
        designer.outputs.options,
      )
      .array(),
  )
  .output("customOptionPrompt", f.string(designer.outputs.customOptionPrompt))
  .build();

export const decisionEvaluatorSignature = f()
  .description(evaluator.instruction)
  .input("userChoice", f.string(evaluator.inputs.userChoice))
  .input("userReasoning", f.string(evaluator.inputs.userReasoning))
  .input("options", f.string(evaluator.inputs.options))
  .input("scenarioBlueprint", f.string(evaluator.inputs.scenarioBlueprint))
  .output(
    "evaluation",
    f.object(
      {
        scores: f.object({
          foresight: f.number("Foresight score, 1-10"),
          empathy: f.number("Empathy score, 1-10"),
          creativity: f.number("Creativity score, 1-10"),
          riskAwareness: f.number("Risk awareness score, 1-10"),
          reasoningQuality: f.number("Reasoning quality score, 1-10"),
        }),
        overallScore: f.number("Weighted average score, 1-10"),
        strengths: f.string("A thing done well in their thinking").array(),
        blindSpots: f.string("A thing missed or not considered").array(),
        thinkingPattern: f.string("Style of thinker they are showing"),
        oneLesson: f.string("A single powerful insight about their decision-making"),
      },
      evaluator.outputs.evaluation,
    ),
  )
  .build();

export const consequenceEngineSignature = f()
  .description(consequence.instruction)
  .input("userChoice", f.string(consequence.inputs.userChoice))
  .input("userReasoning", f.string(consequence.inputs.userReasoning))
  .input("scenarioBlueprint", f.string(consequence.inputs.scenarioBlueprint))
  .input("sceneNarrative", f.string(consequence.inputs.sceneNarrative))
  .input("evaluation", f.string(consequence.inputs.evaluation))
  .output(
    "consequences",
    f.object(
      {
        immediateEffects: f.string("Something that happens right away").array(),
        delayedEffects: f.string("Something that emerges later").array(),
        hiddenReveal: f.string("Which hidden variable(s) get revealed and how"),
        newComplication: f.string("A new problem or twist that arises"),
        relationshipImpact: f.string("How key characters/stakeholders are affected"),
        resourceChanges: f.string("What resources were gained or lost"),
        worldStateUpdate: f.string("Brief summary of how the world has changed"),
      },
      consequence.outputs.consequences,
    ),
  )
  .build();

export const nextSceneGeneratorSignature = f()
  .description(nextScene.instruction)
  .input("consequences", f.string(nextScene.inputs.consequences))
  .input("scenarioBlueprint", f.string(nextScene.inputs.scenarioBlueprint))
  .input("sceneNumber", f.number(nextScene.inputs.sceneNumber))
  .input("previousSceneSummary", f.string(nextScene.inputs.previousSceneSummary))
  .input("evaluation", f.string(nextScene.inputs.evaluation))
  .output("sceneNarrative", f.string(nextScene.outputs.sceneNarrative))
  .output("decisionPoint", f.string(nextScene.outputs.decisionPoint))
  .output("timePressure", f.string(nextScene.outputs.timePressure))
  .output("difficultyAdjustment", f.string(nextScene.outputs.difficultyAdjustment))
  .build();

export const insightGeneratorSignature = f()
  .description(insight.instruction)
  .input("evaluation", f.string(insight.inputs.evaluation))
  .input("userReasoning", f.string(insight.inputs.userReasoning))
  .input("sceneNumber", f.number(insight.inputs.sceneNumber))
  .input("decisionHistory", f.string(insight.inputs.decisionHistory).optional())
  .output(
    "insightReport",
    f.object(
      {
        patternObservation: f.string("The thinking pattern being noticed"),
        cognitiveBiasAlert: f.string("A bias detected, or 'none_detected'"),
        strengthSpotlight: f.string("One specific thing done brilliantly"),
        growthEdge: f.string("One specific area to stretch into next time"),
        realWorldParallel: f.string("A real-world situation where this pattern matters"),
        coachingQuestion: f.string("A powerful question to sit with before the next scene"),
      },
      insight.outputs.insightReport,
    ),
  )
  .build();

export const progressTrackerSignature = f()
  .description(progress.instruction)
  .input("decisionHistory", f.string(progress.inputs.decisionHistory))
  .input("mainTheme", f.string(progress.inputs.mainTheme))
  .output(
    "progressReport",
    f.object(
      {
        overallGrowth: f.string("How their thinking has evolved (3-4 sentences)"),
        scoreTrajectory: f.string("How each dimension changed over time, as a JSON object"),
        dominantPattern: f.string("Their most common thinking style"),
        underusedStrengths: f.string("A thinking style they rarely use but should").array(),
        criticalBlindSpot: f.string("The #1 thing holding them back"),
        bestMoment: f.string("The scene where they showed the best thinking"),
        skillAssessment: f.string("developing, competent, proficient, or expert"),
        recommendedFocus: f.string("What to work on in the next scenario"),
        archetype: f.string("A thinker archetype name"),
      },
      progress.outputs.progressReport,
    ),
  )
  .build();
