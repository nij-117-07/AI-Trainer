// src/features/motivation/lib/signature-descriptions.ts
/**
 * Instructions and field descriptions for the Ax signatures. The text is copied from the DSPy
 * signatures in Backend/learning/motivation/services.py, so both stacks give the model the same
 * guidance. Keys use the Ax field names; the matching DSPy field is noted beside each key.
 */

export const MOTIVATIONAL_QUOTE_DESCRIPTIONS = {
  instruction:
    "You are a world-class motivational coach and philosopher. Your goal is to provide a highly personalized, impactful quote based on the user's current emotional state and the specific date/context.",
  inputs: {
    // random_seed
    randomSeed: "A unique UUID or seed to ensure randomness in the generation process.",
    // seed_topic
    seedTopic: "A keyword or topic to anchor the quote (e.g., Discipline, Loss, Success).",
    // current_date
    currentDate: "Today's date to help align with seasons or specific historical context.",
    // quote_type
    quoteType: "The stylistic delivery of the quote.",
    // user_feeling
    userFeeling: "How the user describes their current emotional state.",
  },
  outputs: {
    // quote
    quote: "The generated motivational quote.",
    // author_persona
    authorPersona: "The persona/name attributed to the quote (e.g., 'The Stoic Path' or 'The Modern Hustler').",
    // actionable_insight
    actionableInsight: "A 1-sentence micro-habit or action the user can take right now.",
  },
};

export const REFLECTION_PROMPT_DESCRIPTIONS = {
  instruction:
    "You are a compassionate journaling coach. Your mission is to help users transition from reactive thinking to deep self-awareness. Use the user's mood and goals to craft questions that bypass surface-level answers.",
  inputs: {
    // random_seed
    randomSeed: "A unique UUID or seed to ensure randomness in the generation process.",
    // current_mood
    currentMood: "User's mood today (e.g., 'anxious about work').",
    // goal_alignment
    goalAlignment: "Which personal goal or value they want to focus on.",
    // recent_patterns
    recentPatterns: "Summarized mood/progress trends from the past week.",
  },
  outputs: {
    // prompts
    prompts: "A list of 3 powerful, open-ended questions designed for deep journaling.",
    // perspective_shift
    perspectiveShift: "One transformative 'What if' sentence to reframe the user's current challenge.",
  },
};
