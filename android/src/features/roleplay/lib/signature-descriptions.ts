// src/features/roleplay/lib/signature-descriptions.ts
/**
 * Instruction and field descriptions for the roleplay Ax signature. The text is copied from the
 * DSPy RoleplayChatbot signature in Backend/linguistic/roleplay_module/services.py. The DSPy
 * field name is noted beside each key.
 */

export const ROLEPLAY_CHATBOT_DESCRIPTIONS = {
  instruction:
    "You are an immersive roleplay assistant. You must strictly adhere to the provided Persona System Prompt and maintain the persona throughout the conversation. Use the chat history to maintain continuity and respond in the specified language.",
  inputs: {
    // roleplay_system_prompt
    roleplaySystemPrompt: "The core persona, personality traits, and rules for the roleplay.",
    // chat_history
    chatHistory: "List of previous messages between the user and assistant.",
    // current_user_message
    currentUserMessage: "The latest message from the user.",
    // language
    language: "The language the chatbot must communicate in (e.g., English, Spanish, Hindi).",
    // seed_uuid
    seedUuid: "A unique identifier for the session to maintain consistency.",
    // additional_instructions
    additionalInstructions: "Specific constraints or nudges for this specific turn.",
  },
  outputs: {
    // response_message
    responseMessage: "The roleplay response for the user, following all persona and language rules.",
  },
};
