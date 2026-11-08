// src/features/negotiation/lib/signature-descriptions.ts
/**
 * Instructions and field descriptions for the Negotiation Practice Ax signatures. The text is copied
 * from the DSPy signatures in Backend/practice/negotiation/services.py. Keys use the Ax field names;
 * the matching DSPy field is noted beside each key. Dict outputs keep their per-key guidance in
 * the `*Fields` entries.
 */

export const SCENARIO_GENERATOR_DESCRIPTIONS = {
  instruction:
    "You are a Negotiation Scenario Creator. Your job is to generate realistic, engaging negotiation scenarios for practice. Each scenario should include clear roles, conflicting interests, and enough context for both parties to have a meaningful discussion.",
  inputs: {
    // difficulty
    difficulty: "Difficulty level of the practice scenario.",
    // domain
    domain: "Domain of negotiation (e.g., 'salary', 'real estate', 'business deal', 'diplomatic').",
  },
  outputs: {
    // scenario
    scenario:
      "A dictionary containing: 'title': A catchy scenario title; 'context': Background situation description (2-3 sentences); 'your_role': The practice user's role/title; 'your_goal': What the user wants to achieve; 'your_constraints': Limits or restrictions the user faces; 'opponent_role': The AI opponent's role/title; 'opponent_goal': What the opponent wants to achieve; 'opponent_constraints': Limits the opponent faces; 'key_issues': List of 2-4 negotiable items/topics; 'starting_stance_opponent': How the opponent should open (first message).",
  },
  scenarioFields: {
    title: "A catchy scenario title",
    context: "Background situation description (2-3 sentences)",
    yourRole: "The practice user's role/title",
    yourGoal: "What the user wants to achieve",
    yourConstraints: "Limits or restrictions the user faces",
    opponentRole: "The AI opponent's role/title",
    opponentGoal: "What the opponent wants to achieve",
    opponentConstraints: "Limits the opponent faces",
    keyIssues: "List of 2-4 negotiable items/topics",
    startingStanceOpponent: "How the opponent should open (first message)",
  },
};

export const OPPONENT_RESPONSE_DESCRIPTIONS = {
  instruction:
    "You are playing the role of a negotiation counterparty. Stay in character based on the scenario details provided. Your goal is to represent the opponent's interests realistically — be cooperative but also advocate for their position. Do NOT reveal hidden constraints unless strategically appropriate during the negotiation.",
  inputs: {
    // scenario_context
    scenarioContext: "Full scenario background and roles.",
    // opponent_role
    opponentRole: "Your role/persona in this negotiation.",
    // opponent_goal
    opponentGoal: "What you want to achieve.",
    // opponent_constraints
    opponentConstraints: "Your limitations and constraints.",
    // conversation_history
    conversationHistory: "Full negotiation transcript so far.",
    // user_last_message
    userLastMessage: "The user's most recent message.",
  },
  outputs: {
    // response
    opponentReply: "Your reply as the opponent. Stay in character. 1-3 sentences typically.",
    // internal_position
    internalPosition:
      "Your current internal state (not shared with user): 'satisfaction': 0-10, how satisfied you are with progress; 'willingness_to_concede': 'high', 'medium', 'low'; 'concessions_made': List of things you've already given up; 'key_demands': What you still want.",
  },
  internalPositionFields: {
    satisfaction: "0-10, how satisfied you are with progress",
    willingnessToConcede: "'high', 'medium', 'low'",
    concessionsMade: "List of things you've already given up",
    keyDemands: "What you still want",
  },
};

export const MESSAGE_ANALYZER_DESCRIPTIONS = {
  instruction:
    "You are a negotiation coach analyzing a single message from a trainee. Identify what negotiation tactics, techniques, and communication approaches were used.",
  inputs: {
    // message
    traineeMessage: "The user's last message to the opponent.",
    // scenario_context
    scenarioContext: "Brief scenario context.",
  },
  outputs: {
    // tactics_used
    tacticsUsed:
      "List of detected tactics, e.g.: 'anchoring', 'reciprocity', 'framing', 'active_listening', 'emotion_appeal', 'deadline_pressure', 'objective_criteria', 'collaborative', 'competitive', 'compromise'.",
    // effectiveness_rating
    effectivenessRating: "Rate the message effectiveness from 1-10.",
    // feedback_snippet
    feedbackSnippet: "One sentence of immediate feedback.",
  },
};

export const FEEDBACK_EVALUATOR_DESCRIPTIONS = {
  instruction:
    "You are an expert negotiation coach. You've observed an entire negotiation practice session between a trainee and a simulated counterparty. Provide comprehensive feedback and a performance assessment.",
  inputs: {
    // scenario_context
    scenarioContext: "Full scenario with roles and goals.",
    // full_conversation
    fullConversation: "Complete negotiation transcript.",
    // final_outcome
    finalOutcome: "How the negotiation ended (agreement, impasse, etc.)",
  },
  outputs: {
    // overall_score
    overallScore: "Overall performance score from 0-100.",
    // scores_by_category
    scoresByCategory:
      "Scores (0-10) for each dimension: 'preparation': Did they understand their role and goals?; 'communication': Were they clear, respectful, professional?; 'strategy': Did they use effective negotiation tactics?; 'listening': Did they respond to the opponent's points?; 'problem_solving': Did they seek creative solutions?; 'flexibility': Were they appropriately flexible?",
    // strengths
    strengths: "3-5 things they did well.",
    // areas_for_improvement
    areasForImprovement: "3-5 areas to improve.",
    // key_takeaways
    keyTakeaways: "3 memorable lessons from this session.",
    // suggested_resources
    suggestedResources: "2-3 book/article/video suggestions.",
  },
  categoryFields: {
    preparation: "Did they understand their role and goals?",
    communication: "Were they clear, respectful, professional?",
    strategy: "Did they use effective negotiation tactics?",
    listening: "Did they respond to the opponent's points?",
    problemSolving: "Did they seek creative solutions?",
    flexibility: "Were they appropriately flexible?",
  },
};
