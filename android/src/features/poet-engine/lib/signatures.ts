// src/features/poet-engine/lib/signatures.ts
/**
 * Ax signature for the Poet Engine. Instructions and field descriptions live in
 * signature-descriptions.ts, which is copied from Backend/linguistic/poet_engine/services.py.
 */
import { f } from "@ax-llm/ax";
import { POETIC_LANGUAGE_EXPLAINER_DESCRIPTIONS } from "./signature-descriptions";

const poet = POETIC_LANGUAGE_EXPLAINER_DESCRIPTIONS;

export const poeticLanguageExplainerSignature = f()
  .description(poet.instruction)
  .input("targetLanguage", f.string(poet.inputs.targetLanguage))
  .input("nativeLanguage", f.string(poet.inputs.nativeLanguage))
  .input("conceptWord", f.string(poet.inputs.conceptWord))
  .input("poeticStyle", f.string(poet.inputs.poeticStyle))
  .input("userMood", f.string(poet.inputs.userMood))
  .input(
    "userCustomInstruction",
    f.string(poet.inputs.userCustomInstruction).optional(),
  )
  .output("etymologicalSoul", f.string(poet.outputs.etymologicalSoul))
  .output("originalPoetry", f.string(poet.outputs.originalPoetry))
  .output("soulfulTranslation", f.string(poet.outputs.soulfulTranslation))
  .output(
    "philosophicalReflection",
    f.string(poet.outputs.philosophicalReflection),
  )
  .output("visualMetaphor", f.string(poet.outputs.visualMetaphor))
  .build();
