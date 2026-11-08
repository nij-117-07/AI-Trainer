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

export const PROJECT_SUGGESTOR_DESCRIPTIONS = {
  instruction:
    "You are a Strategic Innovation Consultant. Your task is to generate a specific number of high-impact, real-world project use cases based on a primary topic and industry. Each project must be distinct, technically challenging, and solve a legitimate professional pain point.",
  inputs: {
    // topic
    topic: "The core technology or subject matter (e.g., Vector Databases, LLMs, Blockchain).",
    // industry
    industry: "The vertical to apply the technology (e.g., Supply Chain, Legal, Healthcare).",
    // num_use_cases
    numUseCases: "The exact number of unique project ideas to generate.",
    // existing_suggestions
    existingSuggestions: "A list of project titles or concepts already suggested. DO NOT repeat these.",
    // user_instructions
    userInstructions:
      "Specific constraints or preferences (e.g., 'Focus on cost-saving', 'Use Python only', 'Target SME businesses').",
    // random_seed
    randomSeed: "A unique seed to ensure creativity and variety in results.",
  },
  outputs: {
    // brief_strategy
    briefStrategy: "A short overview of how the topic transforms the industry.",
    // projects
    projects:
      "A list of project objects. Each object must contain: 'title', 'problem', 'key_features'.",
  },
};

export const DAILY_PLANNER_DESCRIPTIONS = {
  instruction:
    "Expert Educational Consultant. Design a roadmap that bridges current knowledge to a specific target mastery level, ensuring continuity from previous work.",
  inputs: {
    // random_seed
    randomSeed: "A unique UUID or seed to ensure randomness in the generation process.",
    // master_topic
    masterTopic: "The broad field (e.g., 'DevOps', 'Machine Learning').",
    // subtopic_preference
    subtopicPreference: "Specific area to focus on today.",
    // user_level
    userLevel: "Current level.",
    // target_mastery
    targetMastery: "The depth of understanding the user wants to reach by end of day.",
    // existing_knowledge
    existingKnowledge: "What the user already knows.",
    // learning_focus
    learningFocus: "The preferred learning style.",
    // previously_learned_topics
    previouslyLearnedTopics: "Context from the previous session.",
  },
  outputs: {
    // learning_objective
    learningObjective: "Clear statement of achievement.",
    // mastery_gap_analysis
    masteryGapAnalysis: "A brief note on what is missing to reach the target_mastery.",
    // structured_roadmap
    structuredRoadmap: "Step-by-step tasks.",
    // recommended_exercise
    recommendedExercise: "A challenge designed to test the target mastery level.",
    // resource_suggestions
    resourceSuggestions: "Recommended learning resources.",
  },
};

export const PROJECT_ARCHITECT_DESCRIPTIONS = {
  instruction:
    "You are a Senior Product Architect. Given a Master Topic and a specific Subtopic, generate a unique, high-impact real-world project idea. Use the 'random_seed' to ensure the project concept is creative and distinct.",
  inputs: {
    // random_seed
    randomSeed: "A unique UUID or seed to ensure randomness in the generation process.",
    // master_topic
    masterTopic: "The broad field of study.",
    // subtopic_focus
    subtopicFocus: "The specific niche to master today.",
    // target_mastery
    targetMastery: "The skill level to reach (e.g. competency, architectural).",
    // preferred_industry
    preferredIndustry:
      "User's choice of industry (e.g., Healthcare, Gaming, Space Exploration).",
  },
  outputs: {
    // project_name
    projectName: "A unique, professional name for the project.",
    // industry_context
    industryContext: "The industry this project belongs to (e.g., Healthcare, FinTech, EdTech).",
    // problem_statement
    problemStatement: "The real-world problem this project solves.",
    // technical_requirements
    technicalRequirements:
      "List of specific features that must be implemented to ensure 'Full Knowledge'.",
    // stretch_goals
    stretchGoals: "Advanced features to move from competency to expert-level.",
    // validation_criteria
    validationCriteria:
      "How the user can prove the project is successful and mastery is achieved.",
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
