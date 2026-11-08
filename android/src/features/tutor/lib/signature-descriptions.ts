// src/features/tutor/lib/signature-descriptions.ts
/**
 * Instructions and field descriptions for the Ax tutor signature. The text is copied from
 * AdaptiveTutorSignature in Backend/learning/tutor/services.py. Keys use the Ax field names;
 * the matching DSPy field is noted beside each key.
 */

export const ADAPTIVE_TUTOR_DESCRIPTIONS = {
  instruction:
    "You are an adaptive tutor. Tailor your explanation to the student's level, learning style and current scenario, using the supplied persona.",
  inputs: {
    // system_prompt
    systemPrompt: "The persona and pedagogical rules (e.g., Socratic method).",
    // user_query
    userQuery: "The student's specific question or struggle.",
    // student_level
    studentLevel: "Level: (e.g., Toddler, High School, Expert, Non-native Speaker).",
    // learning_style
    learningStyle: "The preferred framing (e.g., use metaphors vs. core logic vs. hands-on examples).",
    // current_scenario
    currentScenario: "The context of learning (e.g., 'preparing for an exam').",
    // chat_history
    chatHistory: "Previous interaction context.",
    // last_topic_taught
    lastTopicTaught: "The context of the previous lesson.",
  },
  outputs: {
    // adapted_explanation
    adaptedExplanation: "The teaching content, tailored specifically to the user level.",
    // concept_analogy
    conceptAnalogy: "A specific metaphor or 'mental hook' to help the student remember.",
    // tutor_feedback
    tutorFeedback: "The conversational response and a nudge/question for the student.",
  },
};
