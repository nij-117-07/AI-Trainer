// src/features/negotiation/lib/signatures.ts
/**
 * Ax signatures for Negotiation Practice. Instructions and field descriptions live in
 * signature-descriptions.ts, which is copied from Backend/practice/negotiation/services.py.
 */
import { f } from "@ax-llm/ax";
import {
  FEEDBACK_EVALUATOR_DESCRIPTIONS,
  MESSAGE_ANALYZER_DESCRIPTIONS,
  OPPONENT_RESPONSE_DESCRIPTIONS,
  SCENARIO_GENERATOR_DESCRIPTIONS,
} from "./signature-descriptions";

const scenarioGen = SCENARIO_GENERATOR_DESCRIPTIONS;
const opponent = OPPONENT_RESPONSE_DESCRIPTIONS;
const analyzer = MESSAGE_ANALYZER_DESCRIPTIONS;
const evaluator = FEEDBACK_EVALUATOR_DESCRIPTIONS;

const scenarioFields = scenarioGen.scenarioFields;
const positionFields = opponent.internalPositionFields;
const categoryFields = evaluator.categoryFields;

export const scenarioGeneratorSignature = f()
  .description(scenarioGen.instruction)
  .input("difficulty", f.string(`${scenarioGen.inputs.difficulty} One of: beginner, intermediate, advanced.`))
  .input("domain", f.string(scenarioGen.inputs.domain))
  .output(
    "scenario",
    f.object(
      {
        title: f.string(scenarioFields.title),
        context: f.string(scenarioFields.context),
        yourRole: f.string(scenarioFields.yourRole),
        yourGoal: f.string(scenarioFields.yourGoal),
        yourConstraints: f.string(scenarioFields.yourConstraints),
        opponentRole: f.string(scenarioFields.opponentRole),
        opponentGoal: f.string(scenarioFields.opponentGoal),
        opponentConstraints: f.string(scenarioFields.opponentConstraints),
        keyIssues: f.string(scenarioFields.keyIssues).array(),
        startingStanceOpponent: f.string(scenarioFields.startingStanceOpponent),
      },
      scenarioGen.outputs.scenario,
    ),
  )
  .build();

export const opponentResponseSignature = f()
  .description(opponent.instruction)
  .input("scenarioContext", f.string(opponent.inputs.scenarioContext))
  .input("opponentRole", f.string(opponent.inputs.opponentRole))
  .input("opponentGoal", f.string(opponent.inputs.opponentGoal))
  .input("opponentConstraints", f.string(opponent.inputs.opponentConstraints))
  .input("conversationHistory", f.string(opponent.inputs.conversationHistory))
  .input("userLastMessage", f.string(opponent.inputs.userLastMessage))
  .output("opponentReply", f.string(opponent.outputs.opponentReply))
  .output(
    "internalPosition",
    f.object(
      {
        satisfaction: f.number(positionFields.satisfaction),
        willingnessToConcede: f.string(positionFields.willingnessToConcede),
        concessionsMade: f.string(positionFields.concessionsMade).array(),
        keyDemands: f.string(positionFields.keyDemands).array(),
      },
      opponent.outputs.internalPosition,
    ),
  )
  .build();

export const messageAnalyzerSignature = f()
  .description(analyzer.instruction)
  .input("traineeMessage", f.string(analyzer.inputs.traineeMessage))
  .input("scenarioContext", f.string(analyzer.inputs.scenarioContext))
  .output("tacticsUsed", f.string(analyzer.outputs.tacticsUsed).array())
  .output("effectivenessRating", f.number(analyzer.outputs.effectivenessRating))
  .output("feedbackSnippet", f.string(analyzer.outputs.feedbackSnippet))
  .build();

export const feedbackEvaluatorSignature = f()
  .description(evaluator.instruction)
  .input("scenarioContext", f.string(evaluator.inputs.scenarioContext))
  .input("fullConversation", f.string(evaluator.inputs.fullConversation))
  .input("finalOutcome", f.string(evaluator.inputs.finalOutcome))
  .output("overallScore", f.number(evaluator.outputs.overallScore))
  .output(
    "scoresByCategory",
    f.object(
      {
        preparation: f.number(categoryFields.preparation),
        communication: f.number(categoryFields.communication),
        strategy: f.number(categoryFields.strategy),
        listening: f.number(categoryFields.listening),
        problemSolving: f.number(categoryFields.problemSolving),
        flexibility: f.number(categoryFields.flexibility),
      },
      evaluator.outputs.scoresByCategory,
    ),
  )
  .output("strengths", f.string(evaluator.outputs.strengths).array())
  .output("areasForImprovement", f.string(evaluator.outputs.areasForImprovement).array())
  .output("keyTakeaways", f.string(evaluator.outputs.keyTakeaways).array())
  .output("suggestedResources", f.string(evaluator.outputs.suggestedResources).array())
  .build();
