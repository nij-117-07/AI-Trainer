// src/features/joke-coach/lib/signatures.ts
/**
 * Ax signatures for the Joke Lab. Instructions and field descriptions live in
 * signature-descriptions.ts, which is copied from Backend/practice/joke_coach/services.py.
 */
import { f } from "@ax-llm/ax";
import {
  JOKE_EVALUATOR_DESCRIPTIONS,
  JOKE_GENERATOR_DESCRIPTIONS,
  JOKE_REWRITER_DESCRIPTIONS,
  JOKE_SCENARIO_DESCRIPTIONS,
} from "./signature-descriptions";

const scenario = JOKE_SCENARIO_DESCRIPTIONS;
const generator = JOKE_GENERATOR_DESCRIPTIONS;
const evaluator = JOKE_EVALUATOR_DESCRIPTIONS;
const rewriter = JOKE_REWRITER_DESCRIPTIONS;

export const jokeScenarioSignature = f()
  .description(scenario.instruction)
  .input("language", f.string(scenario.inputs.language))
  .input("theme", f.string(scenario.inputs.theme).optional())
  .output("title", f.string(scenario.outputs.title))
  .output("situation", f.string(scenario.outputs.situation))
  .output("audience", f.string(scenario.outputs.audience))
  .build();

export const jokeGeneratorSignature = f()
  .description(generator.instruction)
  .input("jokeTopic", f.string(generator.inputs.jokeTopic))
  .input(
    "jokeStyle",
    f.string(`${generator.inputs.jokeStyle} One of: pun, one-liner, story, observational, dad-joke.`),
  )
  .input("audience", f.string(generator.inputs.audience))
  .input("language", f.string(generator.inputs.language))
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
  .input("language", f.string(evaluator.inputs.language))
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
  .input("language", f.string(rewriter.inputs.language))
  .output("rewrittenJoke", f.string(rewriter.outputs.rewrittenJoke))
  .output("setup", f.string(rewriter.outputs.setup))
  .output("punchline", f.string(rewriter.outputs.punchline))
  .output("changesMade", f.string(rewriter.outputs.changesMade).array())
  .output("performanceNotes", f.string(rewriter.outputs.performanceNotes))
  .build();
