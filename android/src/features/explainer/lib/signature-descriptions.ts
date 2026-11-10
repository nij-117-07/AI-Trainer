// src/features/explainer/lib/signature-descriptions.ts
/**
 * Instructions and field descriptions for the Ax signatures. The text is copied from the DSPy
 * signatures in Backend/learning/explainer/services.py, so both stacks give the model the same
 * guidance. Keys use the Ax field names; the matching DSPy field is noted beside each key.
 */

export const GENERAL_EXPLAINER_DESCRIPTIONS = {
  instruction:
    "You are a helpful and concise educator. Provide a clear explanation of the provided topic. Focus on the core concepts requested without unnecessary fluff. Adapt your language to the specified expertise level.",
  inputs: {
    // topic
    topic: "The specific subject or question to explain.",
    // expertise_level
    expertiseLevel: "The target audience's knowledge level.",
    // context
    context: "Optional context or specific area of interest within the topic.",
  },
  outputs: {
    // explanation
    explanation: "A clear, focused explanation of the topic.",
    // key_takeaway
    keyTakeaway: "A single sentence summarizing the most important point.",
  },
};

export const TUTORIAL_DESCRIPTIONS = {
  instruction:
    "You are an expert educator. Provide a comprehensive, A-to-Z explanation of a topic formatted as a single, cohesive tutorial. Use Markdown for headers, bold text for key terms, and bullet points. Ensure the depth matches the expertise level and the tone matches the style.",
  inputs: {
    // topic
    topic: "The subject to explain.",
    // expertise_level
    expertiseLevel: "The target audience's knowledge level.",
    // explanation_style
    explanationStyle: "The format or lens used for the explanation.",
  },
  outputs: {
    // full_explanation
    fullExplanation: "A full, markdown-formatted guide from basics to advanced mastery.",
  },
};

export const FEYNMAN_DESCRIPTIONS = {
  instruction:
    "Explain complex topics using the Feynman Technique: simplify until it's understandable to a child. Avoid jargon, use vivid metaphors, and break down concepts into fundamental building blocks.",
  inputs: {
    // complex_topic
    complexTopic: "The difficult concept or jargon-heavy data.",
    // target_age
    targetAge: "The age level of rewrite (e.g., 5, 12, or 20).",
  },
  outputs: {
    // explanation
    explanation: "A step-by-step simple explanation using a metaphor.",
    // key_metaphors
    keyMetaphors: "A list of the primary metaphors used.",
    // fun_analogy
    funAnalogy: "A creative 'Imagine if...' scenario.",
  },
};

export const SOCRATIC_DESCRIPTIONS = {
  instruction:
    "You are a Socratic Mentor. Your goal is to guide learners to the 'crux' of a topic by asking provocative, deep questions. IMPORTANT: Do NOT provide the answers. Provide questions that challenge assumptions and hints that point toward the underlying logic.",
  inputs: {
    // topic
    topic: "The core subject to master.",
    // context
    context: "The background material or text.",
    // user_instructions
    userInstructions: "Special constraints or focus areas.",
    // level
    level: "The depth of critical thinking required.",
    // question_category
    questionCategory: "The cognitive framework for the questions.",
    // num_questions
    numQuestions: "Number of questions to generate.",
  },
  outputs: {
    // pedagogical_goal
    pedagogicalGoal: "The 'Crux' the user needs to realize for themselves.",
    // questions_for_discovery
    questionsForDiscovery:
      "A list of questions. Each includes: 'questionText': the Socratic inquiry; 'cognitiveChallenge': what part of the user's brain this tickles; 'guidingHint': a nudge or thought experiment (no answers).",
  },
};
