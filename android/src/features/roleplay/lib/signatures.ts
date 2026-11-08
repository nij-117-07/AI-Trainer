// src/features/roleplay/lib/signatures.ts
/**
 * Ax signature for the Roleplay chat. Instructions and field descriptions live in
 * signature-descriptions.ts, which is copied from Backend/linguistic/roleplay_module/services.py.
 */
import { f } from "@ax-llm/ax";
import { ROLEPLAY_CHATBOT_DESCRIPTIONS } from "./signature-descriptions";

const roleplay = ROLEPLAY_CHATBOT_DESCRIPTIONS;

export const roleplayChatSignature = f()
  .description(roleplay.instruction)
  .input("roleplaySystemPrompt", f.string(roleplay.inputs.roleplaySystemPrompt))
  .input("chatHistory", f.string(roleplay.inputs.chatHistory))
  .input("currentUserMessage", f.string(roleplay.inputs.currentUserMessage))
  .input("language", f.string(roleplay.inputs.language))
  .input("seedUuid", f.string(roleplay.inputs.seedUuid))
  .input("additionalInstructions", f.string(roleplay.inputs.additionalInstructions).optional())
  .output("responseMessage", f.string(roleplay.outputs.responseMessage))
  .build();
