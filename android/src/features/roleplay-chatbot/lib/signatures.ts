// src/features/roleplay-chatbot/lib/signatures.ts
/**
 * Ax signature for the Roleplay Chatbot. Instructions and field descriptions live in
 * signature-descriptions.ts, which is copied from Backend/learning/roleplay_chatbot/services.py.
 */
import { f } from "@ax-llm/ax";
import { ROLEPLAY_CHATBOT_DESCRIPTIONS } from "./signature-descriptions";

const roleplay = ROLEPLAY_CHATBOT_DESCRIPTIONS;

export const roleplaySignature = f()
  .description(roleplay.instruction)
  .input("systemPrompt", f.string(roleplay.inputs.systemPrompt))
  .input("conversationHistory", f.string(roleplay.inputs.conversationHistory))
  .input("latestUserMessage", f.string(roleplay.inputs.latestUserMessage))
  .output("characterResponse", f.string(roleplay.outputs.characterResponse))
  .output("emotionTag", f.string(roleplay.outputs.emotionTag))
  .output("actionDescription", f.string(roleplay.outputs.actionDescription))
  .build();
