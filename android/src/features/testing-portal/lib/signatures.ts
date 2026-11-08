// src/features/testing-portal/lib/signatures.ts
/**
 * Ax signatures for the Testing Portal. Instructions and field descriptions live in
 * signature-descriptions.ts, which is copied from Backend/practice/testing_portal/services.py.
 */
import { f } from "@ax-llm/ax";
import {
  ANSWER_GENERATOR_DESCRIPTIONS,
  GRADER_DESCRIPTIONS,
  MCQ_GENERATOR_DESCRIPTIONS,
  SOLVER_DESCRIPTIONS,
  THEORETICAL_GENERATOR_DESCRIPTIONS,
} from "./signature-descriptions";

const mcq = MCQ_GENERATOR_DESCRIPTIONS;
const theoretical = THEORETICAL_GENERATOR_DESCRIPTIONS;
const answer = ANSWER_GENERATOR_DESCRIPTIONS;
const solver = SOLVER_DESCRIPTIONS;
const grader = GRADER_DESCRIPTIONS;

export const mcqSignature = f()
  .description(mcq.instruction)
  .input("variationSeed", f.string(mcq.inputs.variationSeed))
  .input("topic", f.string(mcq.inputs.topic))
  .input("questionType", f.string(mcq.inputs.questionType))
  .input("numQuestions", f.number(mcq.inputs.numQuestions))
  .input("difficultyLevel", f.string(mcq.inputs.difficultyLevel))
  .input("contextSetting", f.string(mcq.inputs.contextSetting))
  .input("pastQuestions", f.string(mcq.inputs.pastQuestions).optional())
  .input("customInstructions", f.string(mcq.inputs.customInstructions).optional())
  .output(
    "questions",
    f
      .object(
        {
          questionText: f.string(mcq.outputs.questionText),
          options: f.object(
            {
              A: f.string("Option A text"),
              B: f.string("Option B text"),
              C: f.string("Option C text"),
              D: f.string("Option D text"),
            },
            mcq.outputs.options,
          ),
          correctAnswer: f.class(["A", "B", "C", "D"], mcq.outputs.correctAnswer),
        },
        mcq.outputs.questions,
      )
      .array(),
  )
  .build();

export const theoreticalSignature = f()
  .description(theoretical.instruction)
  .input("variationSeed", f.string(theoretical.inputs.variationSeed))
  .input("topic", f.string(theoretical.inputs.topic))
  .input("questionType", f.string(theoretical.inputs.questionType))
  .input("sourceContext", f.string(theoretical.inputs.sourceContext).optional())
  .input("pastQuestions", f.string(theoretical.inputs.pastQuestions).optional())
  .input("numQuestions", f.number(theoretical.inputs.numQuestions))
  .input("difficultyLevel", f.string(theoretical.inputs.difficultyLevel))
  .input("contextSetting", f.string(theoretical.inputs.contextSetting))
  .input("customInstructions", f.string(theoretical.inputs.customInstructions).optional())
  .output(
    "questions",
    f
      .object(
        {
          questionText: f.string(theoretical.outputs.questionText),
          focusArea: f.string(theoretical.outputs.focusArea),
          evaluationCriteria: f.string(theoretical.outputs.evaluationCriteria),
        },
        theoretical.outputs.questions,
      )
      .array(),
  )
  .build();

export const answerSignature = f()
  .description(answer.instruction)
  .input("question", f.string(answer.inputs.question))
  .input("context", f.string(answer.inputs.context))
  .input("difficultyLevel", f.string(answer.inputs.difficultyLevel))
  .input("responseFormat", f.string(answer.inputs.responseFormat))
  .input("customInstructions", f.string(answer.inputs.customInstructions).optional())
  .output("answerText", f.string(answer.outputs.answerText))
  .output("keyConceptsCovered", f.string(answer.outputs.keyConceptsCovered).array())
  .build();

export const solverSignature = f()
  .description(solver.instruction)
  .input("question", f.string(solver.inputs.question))
  .input("optionA", f.string(solver.inputs.optionA))
  .input("optionB", f.string(solver.inputs.optionB))
  .input("optionC", f.string(solver.inputs.optionC))
  .input("optionD", f.string(solver.inputs.optionD))
  .input("context", f.string(solver.inputs.context).optional())
  .output("correctOption", f.class(["A", "B", "C", "D"], solver.outputs.correctOption))
  .output("reasoning", f.string(solver.outputs.reasoning))
  .build();

export const graderSignature = f()
  .description(grader.instruction)
  .input("scenario", f.string(grader.inputs.scenario))
  .input("questionAsked", f.string(grader.inputs.questionAsked))
  .input("targetObjective", f.string(grader.inputs.targetObjective))
  .input("expectedLevel", f.string(grader.inputs.expectedLevel))
  .input("userAnswerText", f.string(grader.inputs.userAnswerText).optional())
  .input("userAnswerImage", f.image(grader.inputs.userAnswerImage).optional())
  .output("combinedAnalysis", f.string(grader.outputs.combinedAnalysis))
  .output("score", f.number(grader.outputs.score).min(0).max(10))
  .output("strengths", f.string(grader.outputs.strengths).array())
  .output("weaknesses", f.string(grader.outputs.weaknesses).array())
  .output("detailedFeedback", f.string(grader.outputs.detailedFeedback))
  .output("isTargetMet", f.boolean(grader.outputs.isTargetMet))
  .build();
