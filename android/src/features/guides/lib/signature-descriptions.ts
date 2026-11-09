// src/features/guides/lib/signature-descriptions.ts
/**
 * Instructions and field descriptions for the Ax signatures. The text is copied from the DSPy
 * signatures in Backend/learning/guides/services.py, so both stacks give the model the same
 * guidance. Keys use the Ax field names; the matching DSPy field is noted beside each key.
 */

export const TASK_GUIDE_DESCRIPTIONS = {
  instruction:
    "You are a Mentor and Skill Master. Your goal is to generate actionable, highly relevant tasks/projects to help a user master a specific skill. Consider their current level and previous work to ensure a logical progression in difficulty and complexity.",
  inputs: {
    // random_seed
    randomSeed: "A unique UUID or seed to ensure randomness in the generation process.",
    // learning_subject
    learningSubject: "What the user is currently learning.",
    // target_goal
    targetGoal: "The end goal or dream project the user wants to achieve.",
    // current_level
    currentLevel: "The user's skill level (e.g., Beginner, Intermediate, Advanced).",
    // num_tasks
    numTasks: "The number of tasks/projects to generate.",
    // previous_tasks
    previousTasks: "List of tasks the user has already completed.",
    // custom_instructions
    customInstructions: "Specific preferences (e.g., 'focus on backend', 'no external libraries').",
  },
  outputs: {
    // mentor_feedback
    mentorFeedback:
      "A brief, encouraging assessment of the user's progress and the logic behind the new tasks.",
    // task_list
    taskList:
      "A structured list of tasks. Each task must contain: 'title', 'description', 'difficulty' (Easy/Medium/Hard), 'learning_outcomes', 'estimated_hours'.",
  },
};

export const WHAT_TO_LEARN_DESCRIPTIONS = {
  instruction:
    "Personalized learning recommender. Analyze user interests, history, and specifically avoid repeating previous suggestions. Tailor the response to any custom user instructions provided.",
  inputs: {
    // broader_topic
    broaderTopic: "The general domain (e.g., Computer Science, Cooking).",
    // specific_interest
    specificInterest: "The specific sub-topic the user wants to focus on.",
    // learned_before
    learnedBefore: "Background knowledge to avoid teaching basics.",
    // previous_suggestions
    previousSuggestions: "A list of topics already suggested to the user. DO NOT repeat these.",
    // custom_user_input
    customUserInput: "Any specific user constraints or requests (e.g., 'focus on practical projects').",
    // topic_level
    topicLevel: "Difficulty: Beginner, Intermediate, or Advanced.",
    // seed_uuid
    seedUuid: "Unique hash to ensure non-deterministic outputs.",
  },
  outputs: {
    // recommendations
    recommendations:
      "A list of 2-3 new topics. Each contains: 'topic_name': the specific subject name, 'reason': why this is a good next step.",
  },
};
