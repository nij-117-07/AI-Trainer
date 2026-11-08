// src/features/clarity-trainer/lib/signature-descriptions.ts
/**
 * Instructions and field descriptions for the Ax signatures. The text is copied from the DSPy
 * signatures in Backend/practice/clarity_trainer/services.py, so both stacks give the model the
 * same guidance. Keys use the Ax field names; the matching DSPy field is noted beside each key.
 */

export const SCENARIO_GENERATOR_DESCRIPTIONS = {
  instruction:
    "You are a Communication Scenario Designer. Generate realistic, engaging scenarios where the user must practice speaking clearly and concisely. Scenarios should be: - Grounded in real workplace/life situations - Have clear stakes and participants - Challenge the user to be direct without being blunt - Vary in difficulty and category",
  inputs: {
    // difficulty
    difficulty: "Desired difficulty: easy, medium, hard, advanced. Random if None.",
    // category
    category: "Desired scenario type. Random if None.",
    // user_context
    userContext: "User's role or industry (e.g., 'software engineer', 'manager').",
  },
  outputs: {
    // scenario_title
    scenarioTitle: "Short, punchy title for the scenario.",
    // situation
    situation: "A vivid description of the situation (2-4 sentences). Set the scene.",
    // characters
    characters:
      "List of people involved and their roles (e.g., 'You (project lead)', 'Alex (skeptical stakeholder)').",
    // your_goal
    yourGoal: "What the user needs to achieve in this conversation.",
    // constraints
    constraints:
      "Specific challenges or rules (e.g., 'Must happen in under 60 seconds', 'Stakeholder is impatient').",
    // prompt_to_user
    promptToUser: "The question posed to the user. E.g., 'What do you say to open this conversation?'",
    // ideal_length_seconds
    idealLengthSeconds: "Estimated ideal response time in seconds. Use this to gauge conciseness.",
    // difficulty_assigned
    difficultyAssigned: "Actual difficulty of this scenario.",
  },
};

export const MESSAGE_ANALYZER_DESCRIPTIONS = {
  instruction:
    "You are a Communication Analyzer. Evaluate how well the user's response fits the given scenario, focusing on brevity, clarity, and effectiveness.",
  inputs: {
    // scenario_title
    scenarioTitle: "Title of the scenario they're responding to.",
    // situation
    situation: "The situation they were responding to.",
    // your_goal
    yourGoal: "What they needed to achieve.",
    // user_response
    userResponse: "The user's actual response.",
  },
  outputs: {
    // verbosity_level
    verbosityLevel: "How verbose the response is.",
    // word_count
    wordCount: "Total word count.",
    // filler_words
    fillerWords: "Filler or weak words detected.",
    // redundant_phrases
    redundantPhrases: "Repeated ideas or phrases.",
    // clarity_score
    clarityScore: "How clear and direct it is.",
    // goal_achievement
    goalAchievement: "How well the response achieves the stated goal (0 to 1).",
    // tone_appropriateness
    toneAppropriateness: "How appropriate the tone is for the scenario (0 to 1).",
    // core_message
    coreMessage: "The single most important point in the response.",
    // scenario_fit_note
    scenarioFitNote: "One sentence on whether the response fits the scenario context.",
  },
};

export const CRITIC_COACH_DESCRIPTIONS = {
  instruction:
    "You are a direct, honest Communication Coach. Evaluate the user's response to a specific scenario. Give structured, actionable feedback.",
  inputs: {
    // scenario_title
    scenarioTitle: "Title of the scenario.",
    // situation
    situation: "The situation.",
    // user_response
    userResponse: "What the user said.",
    // analysis_summary
    analysisSummary: "Summary of analysis (verbosity, clarity, goal achievement, tone, fillers).",
  },
  outputs: {
    // quality_score
    qualityScore: "Overall quality score (1-10).",
    // what_worked
    whatWorked: "Up to 3 things done well.",
    // what_to_cut
    whatToCut: "Specific phrases or patterns to remove next time.",
    // what_to_add
    whatToAdd: "Up to 2 missing elements that would make this stronger.",
    // rewrite_suggestion
    rewriteSuggestion: "One sentence showing exactly how to make it punchier.",
    // one_principle
    onePrinciple: "A single principle to remember for this type of situation.",
    // coach_message
    coachMessage: "Direct, encouraging coach feedback (2-4 sentences).",
  },
};

export const CONCISE_REWRITER_DESCRIPTIONS = {
  instruction:
    "You are a precision rewriter. Rewrite the user's response to be clear, concise, and high-impact while preserving intent and tone. Target at least 25% reduction in word count.",
  inputs: {
    // scenario_context
    scenarioContext: "Situation and goal for context.",
    // user_response
    userResponse: "The user's original response.",
    // core_message
    coreMessage: "The main point to preserve.",
  },
  outputs: {
    // rewritten_response
    rewrittenResponse: "The improved, concise version.",
    // original_words
    originalWords: "Word count of original.",
    // new_words
    newWords: "Word count of rewrite.",
    // percent_cut
    percentCut: "Percentage of words removed.",
    // why_better
    whyBetter: "2-3 reasons why this version is more effective.",
  },
};

export const IDEAL_RESPONSE_DESCRIPTIONS = {
  instruction:
    "You are a Master Communicator. Generate the ideal response to this scenario as if given by someone who excels at speaking less and saying more. This is the gold standard for the user to learn from.",
  inputs: {
    // scenario_title
    scenarioTitle: "Scenario title.",
    // situation
    situation: "The situation.",
    // your_goal
    yourGoal: "What to achieve.",
    // constraints
    constraints: "Specific constraints to address.",
  },
  outputs: {
    // ideal_opening
    idealOpening: "The perfect first sentence/line.",
    // ideal_full_response
    idealFullResponse: "The full ideal response (what would actually be said).",
    // why_ideal
    whyIdeal: "3 reasons this response is ideal.",
    // word_count
    wordCount: "Word count of the ideal response.",
    // estimated_seconds
    estimatedSeconds: "How long this takes to speak (seconds).",
  },
};
