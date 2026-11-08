// src/features/observation-trainer/lib/signatures.ts
/**
 * Ax signatures for the Observation Trainer. Instructions and field descriptions live in
 * signature-descriptions.ts, which is copied from Backend/practice/observation_trainer/services.py.
 */
import { f } from "@ax-llm/ax";
import { OBSERVATION_RATINGS } from "../types";
import {
  HIDDEN_DETAILS_DESCRIPTIONS,
  IMAGE_DESCRIBER_DESCRIPTIONS,
  OBSERVATION_EVALUATOR_DESCRIPTIONS,
} from "./signature-descriptions";

const describer = IMAGE_DESCRIBER_DESCRIPTIONS;
const evaluator = OBSERVATION_EVALUATOR_DESCRIPTIONS;
const hidden = HIDDEN_DETAILS_DESCRIPTIONS;

export const imageDescriberSignature = f()
  .description(describer.instruction)
  .input("sourceImage", f.image(describer.inputs.sourceImage))
  .input("scenarioContext", f.string(describer.inputs.scenarioContext).optional())
  .output("detailedDescription", f.string(describer.outputs.detailedDescription))
  .output("keyElements", f.string(describer.outputs.keyElements).array())
  .output("subtleDetails", f.string(describer.outputs.subtleDetails).array())
  .build();

export const observationEvaluatorSignature = f()
  .description(evaluator.instruction)
  .input("sourceImage", f.image(evaluator.inputs.sourceImage))
  .input("imageDescription", f.string(evaluator.inputs.imageDescription))
  .input("userObservations", f.string(evaluator.inputs.userObservations))
  .input("trainingScenario", f.string(evaluator.inputs.trainingScenario))
  .input("contextCategory", f.string(evaluator.inputs.contextCategory).optional())
  .output("accuracyAssessment", f.string(evaluator.outputs.accuracyAssessment))
  .output("scenarioRelevanceAssessment", f.string(evaluator.outputs.scenarioRelevanceAssessment))
  .output("observationRating", f.class([...OBSERVATION_RATINGS], evaluator.outputs.observationRating))
  .output("scoreOutOf10", f.number(evaluator.outputs.scoreOutOf10).min(1).max(10))
  .output("strengths", f.string(evaluator.outputs.strengths).array())
  .output("areasForImprovement", f.string(evaluator.outputs.areasForImprovement).array())
  .output("scenarioSpecificFeedback", f.string(evaluator.outputs.scenarioSpecificFeedback))
  .output("feedbackMessage", f.string(evaluator.outputs.feedbackMessage))
  .build();

export const hiddenDetailsRevealerSignature = f()
  .description(hidden.instruction)
  .input("sourceImage", f.image(hidden.inputs.sourceImage))
  .input("imageDescription", f.string(hidden.inputs.imageDescription))
  .input("userObservations", f.string(hidden.inputs.userObservations))
  .input("trainingScenario", f.string(hidden.inputs.trainingScenario))
  .input("trainingFocus", f.string(hidden.inputs.trainingFocus).optional())
  .output(
    "missedDetails",
    f
      .object(
        {
          detail: f.string(hidden.outputs.missedDetail.detail),
          category: f.string(hidden.outputs.missedDetail.category),
          significance: f.string(hidden.outputs.missedDetail.significance),
          scenarioPriority: f.string(hidden.outputs.missedDetail.scenarioPriority),
        },
        hidden.outputs.missedDetails,
      )
      .array(),
  )
  .output("observationScoreIfTheseNoticed", f.number(hidden.outputs.observationScoreIfTheseNoticed).min(1).max(10))
  .output("scenarioSkillGap", f.string(hidden.outputs.scenarioSkillGap))
  .output("trainingTip", f.string(hidden.outputs.trainingTip))
  .output("practiceExercise", f.string(hidden.outputs.practiceExercise))
  .output("encouragement", f.string(hidden.outputs.encouragement))
  .build();
