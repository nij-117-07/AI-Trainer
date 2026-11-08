// src/features/word-of-the-day/lib/signatures.ts
/**
 * Ax signature for the Word of the Day. Instructions and field descriptions live in
 * signature-descriptions.ts, which is copied from Backend/linguistic/word_of_the_day/services.py.
 */
import { f } from "@ax-llm/ax";
import { WORD_OF_THE_DAY_DESCRIPTIONS } from "./signature-descriptions";

const word = WORD_OF_THE_DAY_DESCRIPTIONS;

export const wordOfTheDaySignature = f()
  .description(word.instruction)
  .input("currentDate", f.string(word.inputs.currentDate))
  .input("targetLanguage", f.string(word.inputs.targetLanguage))
  .input("nativeLanguage", f.string(word.inputs.nativeLanguage))
  .input(
    "userProficiency",
    f.string(`${word.inputs.userProficiency} One of: basic, academic, poetic, slang.`),
  )
  .input("thematicFocus", f.string(word.inputs.thematicFocus).optional())
  .input("dailySeed", f.string(word.inputs.dailySeed))
  .input("userCustomInstructions", f.string(word.inputs.userCustomInstructions).optional())
  .output("chosenWord", f.string(word.outputs.chosenWord))
  .output("nativeTranslation", f.string(word.outputs.nativeTranslation))
  .output("phoneticAndAudioGuide", f.string(word.outputs.phoneticAndAudioGuide))
  .output("morphologyBreakdown", f.string(word.outputs.morphologyBreakdown))
  .output("primaryDefinition", f.string(word.outputs.primaryDefinition))
  .output("theVibeCheck", f.string(word.outputs.theVibeCheck))
  .output("historicalEvolution", f.string(word.outputs.historicalEvolution))
  .output("modernUsageSentence", f.string(word.outputs.modernUsageSentence))
  .output("synonymWeb", f.string(word.outputs.synonymWeb).array())
  .build();
