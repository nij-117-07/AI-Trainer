// src/features/joke-coach/lib/signatures.ts
/**
 * Ax signatures for the Joke Coach tools. Instructions and field descriptions live in
 * signature-descriptions.ts, which is copied from Backend/practice/joke_coach/services.py.
 */
import { f } from "@ax-llm/ax";
import {
  CROWD_RESPONSE_DESCRIPTIONS,
  JOKE_CLASSIFIER_DESCRIPTIONS,
  JOKE_EVALUATOR_DESCRIPTIONS,
  JOKE_GENERATOR_DESCRIPTIONS,
  JOKE_REWRITER_DESCRIPTIONS,
  PRACTICE_COACH_DESCRIPTIONS,
} from "./signature-descriptions";

const generator = JOKE_GENERATOR_DESCRIPTIONS;
const evaluator = JOKE_EVALUATOR_DESCRIPTIONS;
const rewriter = JOKE_REWRITER_DESCRIPTIONS;
const classifier = JOKE_CLASSIFIER_DESCRIPTIONS;
const coach = PRACTICE_COACH_DESCRIPTIONS;
const crowd = CROWD_RESPONSE_DESCRIPTIONS;

export const jokeGeneratorSignature = f()
  .description(generator.instruction)
  .input("jokeTopic", f.string(generator.inputs.jokeTopic))
  .input(
    "jokeStyle",
    f.string(`${generator.inputs.jokeStyle} One of: pun, one-liner, story, observational, dad-joke.`),
  )
  .input("audience", f.string(generator.inputs.audience))
  .output("joke", f.string(generator.outputs.joke))
  .output("setup", f.string(generator.outputs.setup))
  .output("punchline", f.string(generator.outputs.punchline))
  .output("humorType", f.string(generator.outputs.humorType))
  .output("difficultyRating", f.number(generator.outputs.difficultyRating))
  .build();

export const jokeEvaluatorSignature = f()
  .description(evaluator.instruction)
  .input("jokeText", f.string(evaluator.inputs.jokeText))
  .input("intendedAudience", f.string(evaluator.inputs.intendedAudience))
  .input("evaluationContext", f.string(evaluator.inputs.evaluationContext).optional())
  .output("overallScore", f.number(evaluator.outputs.overallScore))
  .output("humorScore", f.number(evaluator.outputs.humorScore))
  .output("originalityScore", f.number(evaluator.outputs.originalityScore))
  .output("deliveryScore", f.number(evaluator.outputs.deliveryScore))
  .output("appropriateness", f.string(evaluator.outputs.appropriateness))
  .output("strengths", f.string(evaluator.outputs.strengths).array())
  .output("weaknesses", f.string(evaluator.outputs.weaknesses).array())
  .output("feedback", f.string(evaluator.outputs.feedback))
  .output("isRecommended", f.boolean(evaluator.outputs.isRecommended))
  .build();

export const jokeRewriterSignature = f()
  .description(rewriter.instruction)
  .input("originalJoke", f.string(rewriter.inputs.originalJoke))
  .input(
    "improvementGoal",
    f.string(`${rewriter.inputs.improvementGoal} One of: funnier, cleaner, shorter, more-clever, better-timing.`),
  )
  .input("targetAudience", f.string(rewriter.inputs.targetAudience))
  .output("rewrittenJoke", f.string(rewriter.outputs.rewrittenJoke))
  .output("setup", f.string(rewriter.outputs.setup))
  .output("punchline", f.string(rewriter.outputs.punchline))
  .output("changesMade", f.string(rewriter.outputs.changesMade).array())
  .output("performanceNotes", f.string(rewriter.outputs.performanceNotes))
  .build();

export const jokeClassifierSignature = f()
  .description(classifier.instruction)
  .input("jokeText", f.string(classifier.inputs.jokeText))
  .output("style", f.string(classifier.outputs.style))
  .output("humorMechanism", f.string(classifier.outputs.humorMechanism))
  .output("structure", f.string(classifier.outputs.structure))
  .output("tags", f.string(classifier.outputs.tags).array())
  .output("practiceCategory", f.string(classifier.outputs.practiceCategory))
  .output("similarJokeStyles", f.string(classifier.outputs.similarJokeStyles).array())
  .build();

export const practiceCoachSignature = f()
  .description(coach.instruction)
  .input(
    "currentSkillLevel",
    f.string(`${coach.inputs.currentSkillLevel} One of: beginner, intermediate, advanced.`),
  )
  .input(
    "practiceFocus",
    f.string(`${coach.inputs.practiceFocus} One of: writing, delivery, timing, crowd-work, stage-presence, all.`),
  )
  .input("userJoke", f.string(coach.inputs.userJoke).optional())
  .input("sessionGoal", f.string(coach.inputs.sessionGoal))
  .output("exerciseType", f.string(coach.outputs.exerciseType))
  .output("exerciseInstructions", f.string(coach.outputs.exerciseInstructions))
  .output("practiceJoke", f.string(coach.outputs.practiceJoke))
  .output("drillPrompt", f.string(coach.outputs.drillPrompt))
  .output("successCriteria", f.string(coach.outputs.successCriteria).array())
  .output("nextSteps", f.string(coach.outputs.nextSteps).array())
  .build();

export const crowdResponseSignature = f()
  .description(crowd.instruction)
  .input("jokeText", f.string(crowd.inputs.jokeText))
  .input(
    "venueType",
    f.string(
      `${crowd.inputs.venueType} One of: comedy-club, open-mic, corporate-event, family-gathering, college-show.`,
    ),
  )
  .input("audienceDemographic", f.string(crowd.inputs.audienceDemographic))
  .output("predictedResponse", f.string(crowd.outputs.predictedResponse))
  .output("laughProbability", f.number(crowd.outputs.laughProbability))
  .output("bestDeliveryStyle", f.string(crowd.outputs.bestDeliveryStyle))
  .output("potentialRisks", f.string(crowd.outputs.potentialRisks).array())
  .output("alternativePunchline", f.string(crowd.outputs.alternativePunchline))
  .output("crowdWorkOpportunity", f.string(crowd.outputs.crowdWorkOpportunity))
  .build();
