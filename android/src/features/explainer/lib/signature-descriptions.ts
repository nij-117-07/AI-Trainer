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

export const ATOZ_ROADMAP_DESCRIPTIONS = {
  instruction:
    "You are an expert educator. Provide a comprehensive, structured 'A to Z' explanation of a topic. Structure the response from foundational concepts to advanced applications, ensuring the tone and complexity match the requested level and type.",
  inputs: {
    // topic
    topic: "The subject or concept the user wants to understand.",
    // expertise_level
    expertiseLevel: "The depth of the explanation.",
    // explanation_style
    explanationStyle: "The format or lens used for the explanation.",
  },
  outputs: {
    // summary
    summary: "A high-level overview of the topic.",
    // knowledge_roadmap
    knowledgeRoadmap:
      "A chronological list of key concepts (A to Z). Each item includes: 'concept': the name of the principle or step; 'explanation': a detailed description based on the style and level.",
    // practical_takeaway
    practicalTakeaway: "A final 'how-to' or conclusion for the user.",
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

export const JOURNEY_PLAN_DESCRIPTIONS = {
  instruction:
    "You are a Master Educator. Your goal is to break down a complex topic into a logical progression from absolute beginner (A) to advanced expert (Z).",
  inputs: {
    // topic
    topic: "The subject the user wants to understand.",
    // depth_level
    depthLevel: "Level of detail (e.g., Undergraduate, PhD, Hobbyist).",
  },
  outputs: {
    // knowledge_graph_outline
    chapterTitles: "A list of 5-8 chronological chapters to cover the topic fully.",
    // core_prerequisites
    corePrerequisites: "What the user needs to know before starting.",
  },
};

export const JOURNEY_CHAPTER_DESCRIPTIONS = {
  instruction:
    "You are an Expert Subject Matter Specialist. Provide a high-density, clear, and structured explanation for a specific module of the topic.",
  inputs: {
    // full_topic
    fullTopic: "The overall subject of the journey.",
    // current_chapter
    currentChapter: "The chapter to explain now.",
    // context_of_other_chapters
    otherChapters: "The titles of all chapters in the journey, one per line.",
  },
  outputs: {
    // technical_explanation
    technicalExplanation: "Deep dive into the 'how' and 'why'.",
    // key_terms
    keyTerms: "Glossary of essential jargon for this section.",
    // mental_model_analogy
    mentalModelAnalogy: "A simple analogy to help the user visualize the concept.",
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

export const CURRICULUM_DESCRIPTIONS = {
  instruction:
    "You are the 'Curriculum Architect'. Your job is to synthesize the user's past knowledge, their current goals, and a new topic into a personalized learning session. You must identify the 'Crux' the user needs to master today.",
  inputs: {
    // topic
    topic: "The main topic to be learned today.",
    // context
    context: "Source material, documents, or raw text for the topic.",
    // past_learning
    pastLearning: "Summary of what the user already knows or did in previous sessions.",
    // user_level
    userLevel: "Cognitive level.",
    // user_hopes
    userHopes: "What the user specifically wants to achieve today (e.g., 'I want to be able to code a basic loop').",
    // seed
    variationSeed: "A unique string to vary the pedagogical approach and avoid repetitive paths.",
    // additional_instructions
    additionalInstructions: "Any extra constraints like 'keep it brief' or 'use medical analogies'.",
  },
  outputs: {
    // rationale
    rationale: "Strategic reasoning: how are we connecting past knowledge to today's topic?",
    // the_crux
    theCrux: "The core 'Aha!' moment the user needs to reach today.",
    // learning_roadmap
    learningRoadmap:
      "A step-by-step plan for the session. Each step includes: 'phase' (e.g., Bridge, Deep Dive, Challenge); 'description': what will be covered; 'learningObjective': the goal of this phase.",
    // suggested_focus
    suggestedFocus: "A one-sentence 'north star' for the user's session.",
  },
};
