// src/features/clarity-trainer/lib/signatures.ts
/**
 * Ax signatures for the Clarity Trainer. Instructions and field descriptions live in
 * signature-descriptions.ts, which is copied from Backend/practice/clarity_trainer/services.py.
 */
import { f } from "@ax-llm/ax";
import {
  CONCISE_REWRITER_DESCRIPTIONS,
  CRITIC_COACH_DESCRIPTIONS,
  IDEAL_RESPONSE_DESCRIPTIONS,
  MESSAGE_ANALYZER_DESCRIPTIONS,
  SCENARIO_GENERATOR_DESCRIPTIONS,
} from "./signature-descriptions";
import { CATEGORY_VALUES, CLARITY_VALUES, DIFFICULTY_VALUES, VERBOSITY_VALUES } from "../types";

const scenario = SCENARIO_GENERATOR_DESCRIPTIONS;
const analyzer = MESSAGE_ANALYZER_DESCRIPTIONS;
const coach = CRITIC_COACH_DESCRIPTIONS;
const rewriter = CONCISE_REWRITER_DESCRIPTIONS;
const ideal = IDEAL_RESPONSE_DESCRIPTIONS;

export const scenarioGeneratorSignature = f()
  .description(scenario.instruction)
  .input("difficulty", f.string(scenario.inputs.difficulty).optional())
  .input(
    "category",
    f.string(`${scenario.inputs.category} One of: ${CATEGORY_VALUES.join(", ")}.`).optional(),
  )
  .input("userContext", f.string(scenario.inputs.userContext).optional())
  .output("scenarioTitle", f.string(scenario.outputs.scenarioTitle))
  .output("situation", f.string(scenario.outputs.situation))
  .output("characters", f.string(scenario.outputs.characters).array())
  .output("yourGoal", f.string(scenario.outputs.yourGoal))
  .output("constraints", f.string(scenario.outputs.constraints).array())
  .output("promptToUser", f.string(scenario.outputs.promptToUser))
  .output("idealLengthSeconds", f.number(scenario.outputs.idealLengthSeconds))
  .output("difficultyAssigned", f.class([...DIFFICULTY_VALUES], scenario.outputs.difficultyAssigned))
  .build();

export const messageAnalyzerSignature = f()
  .description(analyzer.instruction)
  .input("scenarioTitle", f.string(analyzer.inputs.scenarioTitle))
  .input("situation", f.string(analyzer.inputs.situation))
  .input("yourGoal", f.string(analyzer.inputs.yourGoal))
  .input("userResponse", f.string(analyzer.inputs.userResponse))
  .output("verbosityLevel", f.class([...VERBOSITY_VALUES], analyzer.outputs.verbosityLevel))
  .output("wordCount", f.number(analyzer.outputs.wordCount))
  .output("fillerWords", f.string(analyzer.outputs.fillerWords).array())
  .output("redundantPhrases", f.string(analyzer.outputs.redundantPhrases).array())
  .output("clarityScore", f.class([...CLARITY_VALUES], analyzer.outputs.clarityScore))
  .output("goalAchievement", f.number(analyzer.outputs.goalAchievement))
  .output("toneAppropriateness", f.number(analyzer.outputs.toneAppropriateness))
  .output("coreMessage", f.string(analyzer.outputs.coreMessage))
  .output("scenarioFitNote", f.string(analyzer.outputs.scenarioFitNote))
  .build();

export const criticCoachSignature = f()
  .description(coach.instruction)
  .input("scenarioTitle", f.string(coach.inputs.scenarioTitle))
  .input("situation", f.string(coach.inputs.situation))
  .input("userResponse", f.string(coach.inputs.userResponse))
  .input("analysisSummary", f.string(coach.inputs.analysisSummary))
  .output("qualityScore", f.number(coach.outputs.qualityScore))
  .output("whatWorked", f.string(coach.outputs.whatWorked).array())
  .output("whatToCut", f.string(coach.outputs.whatToCut).array())
  .output("whatToAdd", f.string(coach.outputs.whatToAdd).array())
  .output("rewriteSuggestion", f.string(coach.outputs.rewriteSuggestion))
  .output("onePrinciple", f.string(coach.outputs.onePrinciple))
  .output("coachMessage", f.string(coach.outputs.coachMessage))
  .build();

export const conciseRewriterSignature = f()
  .description(rewriter.instruction)
  .input("scenarioContext", f.string(rewriter.inputs.scenarioContext))
  .input("userResponse", f.string(rewriter.inputs.userResponse))
  .input("coreMessage", f.string(rewriter.inputs.coreMessage))
  .output("rewrittenResponse", f.string(rewriter.outputs.rewrittenResponse))
  .output("originalWords", f.number(rewriter.outputs.originalWords))
  .output("newWords", f.number(rewriter.outputs.newWords))
  .output("percentCut", f.number(rewriter.outputs.percentCut))
  .output("whyBetter", f.string(rewriter.outputs.whyBetter).array())
  .build();

export const idealResponseSignature = f()
  .description(ideal.instruction)
  .input("scenarioTitle", f.string(ideal.inputs.scenarioTitle))
  .input("situation", f.string(ideal.inputs.situation))
  .input("yourGoal", f.string(ideal.inputs.yourGoal))
  .input("constraints", f.string(ideal.inputs.constraints))
  .output("idealOpening", f.string(ideal.outputs.idealOpening))
  .output("idealFullResponse", f.string(ideal.outputs.idealFullResponse))
  .output("whyIdeal", f.string(ideal.outputs.whyIdeal).array())
  .output("wordCount", f.number(ideal.outputs.wordCount))
  .output("estimatedSeconds", f.number(ideal.outputs.estimatedSeconds))
  .build();
