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

/**
 * Instruction and field descriptions for the system prompt writer. This is an Android-only helper:
 * the backend has no roleplay persona generator, so the wording is written for this app.
 */
export const ROLEPLAY_PROMPT_WRITER_DESCRIPTIONS = {
  instruction:
    "You write system prompts for a language roleplay partner. Given a short character idea and a target language, write a second-person system prompt (starting with 'You are') that makes the AI play that character. Cover who the character is, their personality and tone, the setting and what the learner is trying to do in the scene, how the character reacts, and that the character always replies in the target language and stays in character. Keep it under 150 words.",
  inputs: {
    // character_idea
    characterIdea: "A short description of the character or scene, for example 'a grumpy Parisian waiter'.",
    // language
    language: "The language the character must speak, for example French.",
  },
  outputs: {
    // system_prompt
    systemPrompt: "The complete system prompt, ready to use as the persona.",
  },
};
