// src/features/projects/lib/signature-descriptions.ts
/**
 * Instructions and field descriptions for the Project Recommender Ax signature. The text is copied
 * from LearningProjectRecommender in Backend/learning/projects/services.py. Keys use the Ax field
 * names; the matching DSPy field is noted beside each key.
 */

export const PROJECT_RECOMMENDER_DESCRIPTIONS = {
  instruction:
    "You are an expert learning mentor and project architect. Your job is to recommend practical, hands-on projects that help learners master a given topic at their preferred scope and difficulty level. Each recommendation should be: - Actionable and clearly scoped - Aligned with the learner's current level - Include stretch goals for growth",
  inputs: {
    // topic
    topic: "The subject or technology the learner wants to practice (e.g., 'Python API development', 'React state management', 'SQL joins').",
    // project_size
    projectSize: "Desired project scope: small (1-2 days), medium (1 week), large (2-4 weeks).",
    // difficulty_level
    difficultyLevel: "Learner's current proficiency: beginner (just started), intermediate (comfortable with basics), advanced (seeking depth).",
    // num_recommendations
    numRecommendations: "How many project ideas to return (default: 3).",
  },
  outputs: {
    // projects
    projects:
      "A list of project recommendations. Each is a dictionary with: 'title': Clear, catchy project name; 'description': 2-3 sentence overview of what the learner will build; 'key_concepts': List of core concepts/skills practiced; 'estimated_hours': Approximate hours to complete; 'prerequisites': List of prior knowledge needed; 'deliverables': Concrete outputs (e.g., 'working CLI tool', 'deployed web app'); 'stretch_goals': Optional bonus challenges to level up",
    // advice
    advice: "Encouraging advice on how to approach the chosen project and maximize learning.",
  },
  item: {
    // title
    title: "Clear, catchy project name",
    // description
    description: "2-3 sentence overview of what the learner will build",
    // key_concepts
    keyConcepts: "Core concepts/skills practiced",
    // estimated_hours
    estimatedHours: "Approximate hours to complete",
    // prerequisites
    prerequisites: "Prior knowledge needed",
    // deliverables
    deliverables: "Concrete outputs like a working CLI tool or deployed web app",
    // stretch_goals
    stretchGoals: "Optional bonus challenges to level up",
  },
};
