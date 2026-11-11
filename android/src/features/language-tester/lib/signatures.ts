// src/features/language-tester/lib/signatures.ts
/**
 * Ax signatures for the Language Tester. Instructions and field descriptions live in
 * signature-descriptions.ts, which is copied from Backend/linguistic/language_tester/services.py.
 */
import { f } from "@ax-llm/ax";
import { CEFR_LEVELS, OPTION_KEYS, TEST_TYPES, ANSWER_STATUSES, CHALLENGE_VERDICTS } from "../types";
import {
  CHALLENGE_EVALUATOR_DESCRIPTIONS,
  FILL_IN_BLANK_DESCRIPTIONS,
  LANGUAGE_MCQ_DESCRIPTIONS,
  ROLEPLAY_CHAT_DESCRIPTIONS,
  TRANSLATION_CHALLENGE_DESCRIPTIONS,
  WORD_EVALUATOR_DESCRIPTIONS,
} from "./signature-descriptions";

const mcq = LANGUAGE_MCQ_DESCRIPTIONS;
const fib = FILL_IN_BLANK_DESCRIPTIONS;
const word = WORD_EVALUATOR_DESCRIPTIONS;
const challenge = TRANSLATION_CHALLENGE_DESCRIPTIONS;
const challengeCheck = CHALLENGE_EVALUATOR_DESCRIPTIONS;
const roleplay = ROLEPLAY_CHAT_DESCRIPTIONS;

const LEVEL_HINT = `One of: ${CEFR_LEVELS.join(", ")}.`;

export const assessmentSignature = f()
  .description(mcq.instruction)
  .input("targetLanguage", f.string(mcq.inputs.targetLanguage))
  .input("nativeLanguage", f.string(mcq.inputs.nativeLanguage))
  .input("level", f.string(`${mcq.inputs.level} ${LEVEL_HINT}`))
  .input("numQuestions", f.number(mcq.inputs.numQuestions))
  .input("scenario", f.string(mcq.inputs.scenario))
  .input("userDetails", f.string(mcq.inputs.userDetails))
  .input("seed", f.string(mcq.inputs.seed))
  .input("customInstructions", f.string(mcq.inputs.customInstructions).optional())
  .output("levelRationale", f.string(mcq.outputs.levelRationale))
  .output("assessmentTitle", f.string(mcq.outputs.assessmentTitle))
  .output(
    "questions",
    f
      .object(
        {
          id: f.string("Unique question ID."),
          questionText: f.string("The question."),
          options: f.object(
            {
              A: f.string("Option A text."),
              B: f.string("Option B text."),
              C: f.string("Option C text."),
              D: f.string("Option D text."),
            },
            "The answer choices.",
          ),
          correctAnswer: f.class([...OPTION_KEYS], "The correct letter (A, B, C, or D)."),
          explanation: f.string("Why the answer is correct (in the native language)."),
        },
        mcq.outputs.questions,
      )
      .array(),
  )
  .build();

export const fibSignature = f()
  .description(fib.instruction)
  .input("targetLanguage", f.string(fib.inputs.targetLanguage))
  .input("level", f.string(`${fib.inputs.level} ${LEVEL_HINT}`))
  .input("numQuestions", f.number(fib.inputs.numQuestions))
  .input("scenario", f.string(fib.inputs.scenario))
  .input("userDetails", f.string(fib.inputs.userDetails))
  .input("seed", f.string(fib.inputs.seed))
  .output(
    "questions",
    f
      .object(
        {
          sentence: f.string("The sentence with '____'."),
          correctWord: f.string("The missing word/phrase."),
          hint: f.string("A clue in the target language."),
          contextClue: f.string("Translation of the sentence in the native language."),
        },
        fib.outputs.questions,
      )
      .array(),
  )
  .build();

export const wordEvaluatorSignature = f()
  .description(word.instruction)
  .input("sentenceContext", f.string(word.inputs.sentenceContext))
  .input("correctWord", f.string(word.inputs.correctWord))
  .input("userAnswer", f.string(word.inputs.userAnswer))
  .output("isCorrect", f.boolean(word.outputs.isCorrect))
  .output("status", f.class([...ANSWER_STATUSES], word.outputs.status))
  .output("feedback", f.string(word.outputs.feedback))
  .output("improvementTip", f.string(word.outputs.improvementTip).optional())
  .build();

export const translationChallengeSignature = f()
  .description(challenge.instruction)
  .input("targetLanguage", f.string(challenge.inputs.targetLanguage))
  .input("nativeLanguage", f.string(challenge.inputs.nativeLanguage))
  .input("level", f.string(`${challenge.inputs.level} ${LEVEL_HINT}`))
  .input("scenario", f.string(challenge.inputs.scenario))
  .input("userPersona", f.string(challenge.inputs.userPersona))
  .input("testType", f.string(`${challenge.inputs.testType} One of: ${TEST_TYPES.join(", ")}.`))
  .input("seed", f.string(challenge.inputs.seed))
  .input("customInstructions", f.string(challenge.inputs.customInstructions).optional())
  .output("challengeInstruction", f.string(challenge.outputs.challengeInstruction))
  .output("sourceText", f.string(challenge.outputs.sourceText))
  .output("correctReference", f.string(challenge.outputs.correctReference))
  .output("vocabularyHighlights", f.string(challenge.outputs.vocabularyHighlights).array())
  .output("culturalTip", f.string(challenge.outputs.culturalTip).optional())
  .build();

export const challengeEvaluatorSignature = f()
  .description(challengeCheck.instruction)
  .input("challengePrompt", f.string(challengeCheck.inputs.challengePrompt))
  .input("modelAnswer", f.string(challengeCheck.inputs.modelAnswer))
  .input("userAttempt", f.string(challengeCheck.inputs.userAttempt))
  .output("verdict", f.class([...CHALLENGE_VERDICTS], challengeCheck.outputs.verdict))
  .output("whatWasRight", f.string(challengeCheck.outputs.whatWasRight))
  .output("improvement", f.string(challengeCheck.outputs.improvement))
  .build();

export const roleplaySignature = f()
  .description(roleplay.instruction)
  .input("targetLanguage", f.string(roleplay.inputs.targetLanguage))
  .input("level", f.string(`${roleplay.inputs.level} ${LEVEL_HINT}`))
  .input("scenario", f.string(roleplay.inputs.scenario))
  .input("userPersona", f.string(roleplay.inputs.userPersona))
  .input(
    "chatHistory",
    f.string(`${roleplay.inputs.chatHistory} One turn per line, as 'Speaker: message'.`),
  )
  .input("userLatestResponse", f.string(roleplay.inputs.userLatestResponse))
  .input("seed", f.string(roleplay.inputs.seed))
  .output("linguisticCritique", f.string(roleplay.outputs.linguisticCritique))
  .output("fluencyScore", f.number(roleplay.outputs.fluencyScore).min(1).max(10))
  .output("aiCharacterResponse", f.string(roleplay.outputs.aiCharacterResponse))
  .output("suggestedStrategies", f.string(roleplay.outputs.suggestedStrategies).array())
  .output("isGoalAchieved", f.boolean(roleplay.outputs.isGoalAchieved))
  .build();
