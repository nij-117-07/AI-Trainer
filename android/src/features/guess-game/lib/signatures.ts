// src/features/guess-game/lib/signatures.ts
/**
 * Ax signatures for the Guess Game. Instructions and field descriptions live in
 * signature-descriptions.ts, which is copied from Backend/practice/guess_game/services.py.
 */
import { f } from "@ax-llm/ax";
import {
  FAIL_GUIDE_DESCRIPTIONS,
  GAME_SETUP_DESCRIPTIONS,
  GUESS_EVALUATOR_DESCRIPTIONS,
  HINT_PROVIDER_DESCRIPTIONS,
} from "./signature-descriptions";

const setup = GAME_SETUP_DESCRIPTIONS;
const hint = HINT_PROVIDER_DESCRIPTIONS;
const evaluator = GUESS_EVALUATOR_DESCRIPTIONS;
const coach = FAIL_GUIDE_DESCRIPTIONS;

export const gameSetupSignature = f()
  .description(setup.instruction)
  .input("category", f.string(`${setup.inputs.category} One of: word, movie, sentence, book, celebrity, song.`))
  .input("difficulty", f.string(`${setup.inputs.difficulty} One of: easy, medium, hard, expert.`))
  .input("vocabularyTheme", f.string(setup.inputs.vocabularyTheme).optional())
  .output("mysteryItem", f.string(setup.outputs.mysteryItem))
  .output("firstHint", f.string(setup.outputs.firstHint))
  .output("funFact", f.string(setup.outputs.funFact))
  .build();

export const hintProviderSignature = f()
  .description(hint.instruction)
  .input("mysteryItem", f.string(hint.inputs.mysteryItem))
  .input("category", f.string(hint.inputs.category))
  .input("previousHints", f.string(`${hint.inputs.previousHints} One hint per line.`).optional())
  .input("hintNumber", f.number(hint.inputs.hintNumber))
  .output("newHint", f.string(hint.outputs.newHint))
  .output("hintEncouragement", f.string(hint.outputs.hintEncouragement))
  .build();

export const guessEvaluatorSignature = f()
  .description(evaluator.instruction)
  .input("mysteryItem", f.string(evaluator.inputs.mysteryItem))
  .input("category", f.string(evaluator.inputs.category))
  .input("userGuess", f.string(evaluator.inputs.userGuess))
  .input("difficulty", f.string(`${evaluator.inputs.difficulty} One of: easy, medium, hard, expert.`))
  .output("isCorrect", f.boolean(evaluator.outputs.isCorrect))
  .output("feedback", f.string(evaluator.outputs.feedback))
  .output("closenessScore", f.number(evaluator.outputs.closenessScore))
  .output("suggestion", f.string(evaluator.outputs.suggestion))
  .build();

export const failGuideSignature = f()
  .description(coach.instruction)
  .input("mysteryItem", f.string(coach.inputs.mysteryItem))
  .input("category", f.string(coach.inputs.category))
  .input("failedGuesses", f.string(`${coach.inputs.failedGuesses} One guess per line.`).optional())
  .input("hintNumber", f.number(coach.inputs.hintNumber))
  .output("coachingMessage", f.string(coach.outputs.coachingMessage))
  .output("thinkingFramework", f.string(coach.outputs.thinkingFramework))
  .output("partialReveal", f.string(coach.outputs.partialReveal).optional())
  .output("askForHint", f.boolean(coach.outputs.askForHint))
  .build();
