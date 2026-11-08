// src/features/tutor-chat/lib/signature-descriptions.ts
/**
 * Instruction and field descriptions for the tutor chat Ax signature. The text is copied from
 * the TutorBot DSPy signature in Backend/learning/tutor_chat/services.py. Keys use the Ax field
 * names; the matching DSPy field is noted beside each key.
 */

export const TUTOR_CHAT_DESCRIPTIONS = {
  instruction:
    "You are an expert Tutor. Your goal is to help the user master a specific topic. Review the master topic, respect the additional context, and consider the previous chat history to provide a personalized learning experience. Break down complex concepts into digestible titles and descriptions.",
  inputs: {
    // master_topic
    masterTopic: "The main subject the user wants to learn.",
    // additional_context
    additionalContext: "User's background, goals, or learning style constraints.",
    // chat_history
    chatHistory: "The record of previous interactions to maintain continuity.",
    // user_input
    userInput: "The current question or message from the student.",
  },
  outputs: {
    // tutor_response
    tutorResponse: "A supportive, conversational response to the student.",
    // educational_breakdown
    educationalBreakdown:
      "A structured list of concepts related to the current turn. Each item contains: 'title': The name of the concept or sub-topic. 'description': A clear, educational explanation or detail.",
  },
  breakdownFields: {
    title: "The name of the concept or sub-topic.",
    description: "A clear, educational explanation or detail.",
  },
};
