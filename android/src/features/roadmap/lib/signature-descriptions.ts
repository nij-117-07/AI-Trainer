// src/features/roadmap/lib/signature-descriptions.ts
/**
 * Instructions and field descriptions for the roadmap Ax signatures. The text is copied from the
 * DSPy signatures in Backend/learning/roadmap/services.py, so both stacks give the model the same
 * guidance. Keys use the Ax field names; the matching DSPy field is noted beside each key.
 */

export const PERSONA_DESCRIPTIONS = {
  instruction:
    "Analyze the user's learning goal and generate a specific expert persona. This persona will act as the system prompt for the roadmap generation.",
  inputs: {
    // learning_topic
    learningTopic: "The subject matter.",
    // target_level
    targetLevel: "The expertise level the user wants to reach.",
    // persona_requirements
    personaRequirements: "Any specific style requirements (e.g., 'academic', 'industry-focused', 'encouraging').",
  },
  outputs: {
    // generated_persona_prompt
    generatedPersonaPrompt:
      "A detailed system prompt describing the expert persona, their tone, and their pedagogical approach.",
  },
};

export const MAIN_TOPIC_DESCRIPTIONS = {
  instruction: "Generate the high-level chapters of a roadmap.",
  inputs: {
    // persona
    persona: "The persona/role to adopt.",
    // learning_topic
    learningTopic: "The overall subject (e.g., Python).",
    // current_level
    currentLevel: "Starting point of the user.",
    // target_level
    targetLevel: "The ultimate goal level.",
    // roadmap_type
    roadmapType: "How comprehensive the roadmap should be (Detailed or Short).",
    // user_instructions
    userInstructions: "Specific requests.",
  },
  outputs: {
    // main_topics
    mainTopics: "List of main headings.",
  },
};

export const SUBTOPIC_DESCRIPTIONS = {
  instruction:
    "Generate specific deep-dive points for a particular segment of the roadmap. Use the overall goal and the full context to ensure relevance.",
  inputs: {
    // persona
    persona: "The persona/role to adopt.",
    // learning_topic
    learningTopic: "The main subject being learned.",
    // user_target_level
    userTargetLevel: "The final expertise level the user wants to reach.",
    // full_topic_list
    fullTopicList: "The sequence of all main topics in the roadmap.",
    // current_module
    currentModule: "The specific topic we are currently expanding.",
    // roadmap_type
    roadmapType: "Detailed or Short (influences number of sub-bullets).",
    // user_instructions
    userInstructions: "Optional request from the user about how the subpoints should be written or focused. Follow it.",
    // existing_subtopics
    existingSubtopics:
      "Subpoints already listed for this module. Do not repeat them. Keep the useful ones and apply the user's request when there is one.",
  },
  outputs: {
    // subtopics
    subtopics: "List of specific concepts, tasks, or lessons.",
    // milestone
    milestone: "A specific project or test to confirm mastery of this module.",
  },
};
