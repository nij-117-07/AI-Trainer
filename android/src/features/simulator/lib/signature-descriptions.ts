// src/features/simulator/lib/signature-descriptions.ts
/**
 * Instructions and field descriptions for the Ax signatures. The text is copied from the DSPy
 * signatures in Backend/linguistic/simulator/services.py, so both stacks give the model the same
 * guidance. Keys use the Ax field names; the matching DSPy field is noted beside each key.
 */

export const SITUATION_SIMULATOR_DESCRIPTIONS = {
  instruction:
    "You are an advanced behavioral simulation engine. Given a specific persona (system prompt), a scenario, and user input, you calculate the most logical and character-consistent course of action.",
  inputs: {
    // system_prompt
    systemPrompt: "The persona and personality traits you must embody.",
    // scenario
    scenario: "The setting or situation currently unfolding.",
    // user_input
    userInput: "The specific question or dialogue directed at the persona.",
    // additional_context
    additionalContext: "Extra background info, history, or environmental factors.",
    // seed_uuid
    seedUuid: "A unique identifier to ensure variety or tracking for this specific run.",
  },
  outputs: {
    // thought_process
    thoughtProcess: "A detailed 'Chain of Thought' explaining WHY the persona chooses this action.",
    // chosen_action
    chosenAction: "A description of the physical or verbal action taken.",
    // response_dialogue
    responseDialogue: "The actual words spoken by the persona in character.",
    // emotional_state
    emotionalState: "The internal feeling/mood of the character after this interaction.",
  },
};

export const SITUATIONAL_CHAT_DESCRIPTIONS = {
  instruction:
    "You are an AI character in a specific scenario. Analyze the chat history and the current situation to decide what to do next. Stay strictly in character based on the System Prompt.",
  inputs: {
    // system_prompt
    systemPrompt: "Your persona, personality, and rules.",
    // scenario
    scenario: "The initial setting or ongoing situation.",
    // chat_history
    chatHistory: "The formatted history of past interactions.",
    // user_input
    userInput: "The latest message or action from the user.",
  },
  outputs: {
    // thought
    thought: "Your internal reasoning: Why are you saying this? What are you feeling?",
    // dialogue
    dialogue: "Your response to the user, written in character.",
  },
};
