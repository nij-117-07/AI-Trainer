// src/features/interview/lib/signatures.ts
/**
 * Ax signatures for the Interview Simulator. Instructions and field descriptions live in
 * signature-descriptions.ts, which is copied from Backend/practice/interview/services.py.
 * Dictionary inputs are sent as JSON text and list inputs as one item per line.
 */
import { f } from "@ax-llm/ax";
import {
  ANSWER_REVIEWER_DESCRIPTIONS,
  PROGRESS_TRACKER_DESCRIPTIONS,
  QUESTION_GENERATOR_DESCRIPTIONS,
  SESSION_MANAGER_DESCRIPTIONS,
} from "./signature-descriptions";

const manager = SESSION_MANAGER_DESCRIPTIONS;
const generator = QUESTION_GENERATOR_DESCRIPTIONS;
const reviewer = ANSWER_REVIEWER_DESCRIPTIONS;
const tracker = PROGRESS_TRACKER_DESCRIPTIONS;

export const sessionManagerSignature = f()
  .description(manager.instruction)
  .input("candidateProfile", f.string(manager.inputs.candidateProfile))
  .input("positionDetails", f.string(manager.inputs.positionDetails))
  .input("interviewContext", f.string(manager.inputs.interviewContext))
  .input("sessionHistory", f.string(`${manager.inputs.sessionHistory}. One JSON entry per line.`))
  .input("progressState", f.string(manager.inputs.progressState))
  .input("questionsAsked", f.number(manager.inputs.questionsAsked))
  .input("maxQuestions", f.number(manager.inputs.maxQuestions))
  .input("timeRemainingMinutes", f.number(manager.inputs.timeRemainingMinutes))
  .output(
    "nextAction",
    f.class(["new_question", "follow_up", "switch_topic", "end_session"], manager.outputs.nextAction),
  )
  .output("actionReasoning", f.string(manager.outputs.actionReasoning))
  .output(
    "directive",
    f
      .object(
        {
          action: f.string("new_question or follow_up.").optional(),
          questionType: f
            .string("One of: technical, behavioral, system_design, coding, hr, leadership, domain.")
            .optional(),
          topic: f.string("Specific topic to cover.").optional(),
          difficulty: f.string("One of: easy, medium, hard, expert.").optional(),
          focusArea: f.string("What specifically to probe.").optional(),
          shouldReferenceLastAnswer: f
            .boolean("True for follow-ups that build on the last answer.")
            .optional(),
          toneGuidance: f.string("How the question should feel.").optional(),
          constraints: f.string("Any special instructions.").optional(),
        },
        manager.outputs.directive,
      ),
  )
  .build();

export const questionGeneratorSignature = f()
  .description(generator.instruction)
  .input("directive", f.string(generator.inputs.directive))
  .input("candidateProfile", f.string(generator.inputs.candidateProfile))
  .input("positionDetails", f.string(generator.inputs.positionDetails))
  .input("interviewContext", f.string(generator.inputs.interviewContext))
  .input("previousQuestion", f.string(generator.inputs.previousQuestion).optional())
  .input("previousAnswer", f.string(generator.inputs.previousAnswer).optional())
  .input("previousReview", f.string(generator.inputs.previousReview).optional())
  .input("allQuestionsAsked", f.string(`${generator.inputs.allQuestionsAsked}. One question per line.`))
  .output("question", f.string(generator.outputs.question))
  .output("topic", f.string(generator.outputs.topic))
  .output("difficulty", f.class(["easy", "medium", "hard", "expert"], generator.outputs.difficulty))
  .output("expectedKeywords", f.string(generator.outputs.expectedKeywords).array())
  .output("evaluationCriteria", f.string(generator.outputs.evaluationCriteria))
  .output("redFlags", f.string(generator.outputs.redFlags).array())
  .output("sampleStrongAnswer", f.string(generator.outputs.sampleStrongAnswer))
  .output("sampleWeakAnswer", f.string(generator.outputs.sampleWeakAnswer))
  .build();

export const answerReviewerSignature = f()
  .description(reviewer.instruction)
  .input("question", f.string(reviewer.inputs.question))
  .input("candidateAnswer", f.string(reviewer.inputs.candidateAnswer))
  .input("expectedKeywords", f.string(`${reviewer.inputs.expectedKeywords}. One keyword per line.`))
  .input("evaluationCriteria", f.string(reviewer.inputs.evaluationCriteria))
  .input("redFlags", f.string(`${reviewer.inputs.redFlags}. One flag per line.`))
  .input("sampleStrongAnswer", f.string(reviewer.inputs.sampleStrongAnswer))
  .input("sampleWeakAnswer", f.string(reviewer.inputs.sampleWeakAnswer))
  .input("positionLevel", f.string(reviewer.inputs.positionLevel))
  .input("questionType", f.string(reviewer.inputs.questionType))
  .input("difficulty", f.string(reviewer.inputs.difficulty))
  .output("overallScore", f.number(reviewer.outputs.overallScore))
  .output("technicalAccuracy", f.number(reviewer.outputs.technicalAccuracy))
  .output("completeness", f.number(reviewer.outputs.completeness))
  .output("clarityScore", f.number(reviewer.outputs.clarityScore))
  .output("depthScore", f.number(reviewer.outputs.depthScore))
  .output("strengths", f.string(reviewer.outputs.strengths).array())
  .output("weaknesses", f.string(reviewer.outputs.weaknesses).array())
  .output("missedKeywords", f.string(reviewer.outputs.missedKeywords).array())
  .output("redFlagsDetected", f.string(reviewer.outputs.redFlagsDetected).array())
  .output("improvedAnswer", f.string(reviewer.outputs.improvedAnswer))
  .output("weakTopicsIdentified", f.string(reviewer.outputs.weakTopicsIdentified).array())
  .output(
    "recommendation",
    f.class(["move_on", "follow_up", "switch_topic"], reviewer.outputs.recommendation),
  )
  .output("followUpSuggestion", f.string(reviewer.outputs.followUpSuggestion))
  .build();

export const progressTrackerSignature = f()
  .description(tracker.instruction)
  .input("currentProfile", f.string(tracker.inputs.currentProfile))
  .input("latestReview", f.string(tracker.inputs.latestReview))
  .input("questionTopic", f.string(tracker.inputs.questionTopic))
  .input("questionType", f.string(tracker.inputs.questionType))
  .output(
    "updatedProfile",
    f
      .object(
        {
          overallScore: f.number("Average score across answered questions (0.0 to 10.0).").optional(),
          questionsAnswered: f.number("How many questions have been answered.").optional(),
          weakAreas: f.string("A weak area.").array().optional(),
          strongAreas: f.string("A strong area.").array().optional(),
          topicsCovered: f.string("A topic covered so far.").array().optional(),
          topicScores: f
            .string("JSON object mapping each topic name to a score from 0.0 to 10.0.")
            .optional(),
          typeScores: f
            .string("JSON object mapping each question type to a score from 0.0 to 10.0.")
            .optional(),
          recommendedNextTopics: f.string("A topic to study next.").array().optional(),
          confidenceLevel: f.string("Confidence level, such as low, medium or high.").optional(),
        },
        tracker.outputs.updatedProfile,
      ),
  )
  .output("performanceTrend", f.class(["improving", "stable", "declining"], tracker.outputs.performanceTrend))
  .build();
