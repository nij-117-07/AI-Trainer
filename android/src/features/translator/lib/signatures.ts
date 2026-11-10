// src/features/translator/lib/signatures.ts
/**
 * Ax signature for the Translator tool. Instructions and field descriptions live in
 * signature-descriptions.ts, which is copied from Backend/linguistic/translator/services.py.
 */
import { f } from "@ax-llm/ax";
import { CONTEXTUAL_TRANSLATOR_DESCRIPTIONS } from "./signature-descriptions";

const translator = CONTEXTUAL_TRANSLATOR_DESCRIPTIONS;

export const contextualTranslatorSignature = f()
  .description(translator.instruction)
  .input("textToTranslate", f.string(translator.inputs.textToTranslate))
  .input("sourceLanguage", f.string(translator.inputs.sourceLanguage))
  .input("targetLanguage", f.string(translator.inputs.targetLanguage))
  .input(
    "tone",
    f.string(`${translator.inputs.tone} Preset tones: formal, casual, business, poetic, technical. Any other tone is also accepted.`),
  )
  .input("customInstructions", f.string(translator.inputs.customInstructions).optional())
  .output("rationale", f.string(translator.outputs.rationale))
  .output("translatedText", f.string(translator.outputs.translatedText))
  .output("culturalNotes", f.string(translator.outputs.culturalNotes).optional())
  .build();
