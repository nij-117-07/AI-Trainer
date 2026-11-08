// src/features/resource-suggestor/lib/signature-descriptions.ts
/**
 * Instructions and field descriptions for the Resource Suggestor Ax signature. The text is copied
 * from ResourceSuggestor in Backend/learning/resource_suggestor/services.py, and the per-resource
 * field descriptions come from ResourceItem in schemas.py. Keys use the Ax field names; the matching
 * DSPy field is noted beside each key.
 */

export const RESOURCE_SUGGESTOR_DESCRIPTIONS = {
  instruction:
    "You are an expert Learning Resource Advisor. Your role is to analyze a learner's current background and their target learning topic, then provide personalized, high-quality resource recommendations. Consider the learner's existing knowledge to suggest resources that: - Bridge the gap between their current level and the target topic - Match their preferred learning style and constraints - Progress from foundational to advanced as needed - Include diverse resource types for comprehensive learning Provide actionable, specific resources with clear reasoning for each recommendation.",
  inputs: {
    // background_subject
    backgroundSubject: "The subject or domain the user is currently studying or has background knowledge in.",
    // target_topic
    targetTopic: "The specific topic or skill the user wants to learn.",
    // additional_preferences
    additionalPreferences:
      "Optional preferences like learning style, time commitment, difficulty preference, format preference, language, or any other constraints.",
  },
  outputs: {
    // learning_path_summary
    learningPathSummary: "A brief overview of the recommended learning approach and progression strategy.",
    // recommended_resources
    recommendedResources:
      "A list of 5-8 curated learning resources. Each resource must include: title, type, author_or_creator, description, difficulty_level, estimated_time, why_recommended, prerequisite_knowledge, access_info.",
    // next_steps
    nextSteps: "Suggested order to consume the resources and what to do after completing them.",
  },
  item: {
    // title
    title: "The exact name of the resource.",
    // type
    type: "Category: book, youtube_video, blog_post, online_course, documentation, podcast, github_repo, or paper.",
    // author_or_creator
    authorOrCreator: "Who created the resource, if known.",
    // description
    description: "What the resource covers and its key focus.",
    // difficulty_level
    difficultyLevel: "beginner, intermediate, or advanced.",
    // estimated_time
    estimatedTime: "Approximate time to complete (e.g. '3 hours', '2 weeks').",
    // why_recommended
    whyRecommended: "Specific reason this resource fits the learner's background and goals.",
    // prerequisite_knowledge
    prerequisiteKnowledge: "What the learner should know before starting this resource.",
    // access_info
    accessInfo: "How to access it (URL, platform name, or 'search for: [title]').",
  },
};
