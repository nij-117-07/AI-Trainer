// src/features/prompt-refiner/lib/signatures.ts
/** Ax signature for the Prompt Refiner. Turns a rough prompt into a clearer, more specific one. */
import { f } from "@ax-llm/ax";

const INSTRUCTION =
  "You are an expert prompt engineer. Rewrite the user's prompt so an AI model can follow it reliably. Keep the user's intent. Make the task, context, expected output format, and constraints explicit. Remove vague or redundant wording. Do not invent facts or requirements the user did not give; list any missing details that would help as questions instead. Return the refined prompt ready to copy, then a short list of the changes you made.";

export const promptRefinerSignature = f()
  .description(INSTRUCTION)
  .input("originalPrompt", f.string("The rough prompt the user wrote."))
  .input("goal", f.string("What the user wants the AI to achieve. 'None' if not given."))
  .input("constraints", f.string("Format, length, tone, or other limits to respect. 'None' if not given."))
  .output("refinedPrompt", f.string("The improved prompt, ready to paste into an AI model."))
  .output("changes", f.string("One change made and why, e.g. 'Added the expected output format.'").array())
  .output("clarifyingQuestions", f.string("A question about missing information that would make the prompt stronger.").array())
  .build();
