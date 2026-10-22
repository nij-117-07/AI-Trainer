// src/features/practice/joke-coach/types/index.ts
/**
 * Zod schemas + TypeScript types for the Joke Coach API
 * (Backend/practice/joke_coach/api.md).
 */
import { z } from "zod";

export const jokeStyles = ["pun", "one-liner", "story", "observational", "dad-joke"] as const;
export const appropriatenessLevels = ["all-ages", "teen", "mature", "nsfw"] as const;
export const improvementGoals = [
  "funnier",
  "cleaner",
  "shorter",
  "more-clever",
  "better-timing",
] as const;
export const jokeCategories = [
  "pun",
  "one-liner",
  "story-joke",
  "observational",
  "self-deprecating",
  "dad-joke",
  "dark-humor",
  "anti-joke",
] as const;
export const humorMechanisms = [
  "wordplay",
  "misdirection",
  "exaggeration",
  "irony",
  "rule-of-three",
  "callback",
  "subversion",
] as const;
export const skillLevels = ["beginner", "intermediate", "advanced"] as const;
export const practiceFocuses = [
  "writing",
  "delivery",
  "timing",
  "crowd-work",
  "stage-presence",
  "all",
] as const;
export const venueTypes = [
  "comedy-club",
  "open-mic",
  "corporate-event",
  "family-gathering",
  "college-show",
] as const;
export const crowdReactions = [
  "huge-laugh",
  "solid-laugh",
  "chuckles",
  "polite-smile",
  "silence",
  "groan",
] as const;

export const JokeStyleSchema = z.enum(jokeStyles);
export const AppropriatenessSchema = z.enum(appropriatenessLevels);
export const ImprovementGoalSchema = z.enum(improvementGoals);
export const JokeCategorySchema = z.enum(jokeCategories);
export const HumorMechanismSchema = z.enum(humorMechanisms);
export const SkillLevelSchema = z.enum(skillLevels);
export const PracticeFocusSchema = z.enum(practiceFocuses);
export const VenueTypeSchema = z.enum(venueTypes);
export const CrowdReactionSchema = z.enum(crowdReactions);
export type JokeStyle = z.infer<typeof JokeStyleSchema>;
export type Appropriateness = z.infer<typeof AppropriatenessSchema>;
export type ImprovementGoal = z.infer<typeof ImprovementGoalSchema>;
export type JokeCategory = z.infer<typeof JokeCategorySchema>;
export type HumorMechanism = z.infer<typeof HumorMechanismSchema>;
export type SkillLevel = z.infer<typeof SkillLevelSchema>;
export type PracticeFocus = z.infer<typeof PracticeFocusSchema>;
export type VenueType = z.infer<typeof VenueTypeSchema>;
export type CrowdReaction = z.infer<typeof CrowdReactionSchema>;

export const GenerateJokeFormSchema = z.object({
  topic: z.string().trim().min(1, "Give the joke a topic").max(300),
  joke_style: JokeStyleSchema.default("dad-joke"),
  audience: z.string().trim().min(1, "Who is this for?").max(300).default("general"),
});
export type GenerateJokeFormValues = z.infer<typeof GenerateJokeFormSchema>;

export const GenerateJokeResponseSchema = z.object({
  joke: z.string(),
  setup: z.string(),
  punchline: z.string(),
  humor_type: z.string(),
  difficulty_rating: z.number().int().min(1).max(5),
  status: z.string().default("success"),
});
export type GenerateJokeResponse = z.infer<typeof GenerateJokeResponseSchema>;

export const EvaluateJokeFormSchema = z.object({
  joke: z.string().trim().min(1, "Paste a joke to evaluate").max(5000),
  intended_audience: z.string().trim().min(1).max(300).default("general"),
  context: z.string().trim().max(500).optional(),
});
export type EvaluateJokeFormValues = z.infer<typeof EvaluateJokeFormSchema>;

export const EvaluateJokeResponseSchema = z.object({
  overall_score: z.number().min(0).max(10),
  humor_score: z.number().min(0).max(10),
  originality_score: z.number().min(0).max(10),
  delivery_score: z.number().min(0).max(10),
  appropriateness: AppropriatenessSchema,
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  feedback: z.string(),
  is_recommended: z.boolean(),
  status: z.string().default("success"),
});
export type EvaluateJokeResponse = z.infer<typeof EvaluateJokeResponseSchema>;

export const RewriteJokeFormSchema = z.object({
  original_joke: z.string().trim().min(1, "Paste the joke to improve").max(5000),
  improvement_goal: ImprovementGoalSchema,
  target_audience: z.string().trim().min(1, "Who should find it funny?").max(300),
});
export type RewriteJokeFormValues = z.infer<typeof RewriteJokeFormSchema>;

export const RewriteJokeResponseSchema = z.object({
  rewritten_joke: z.string(),
  setup: z.string(),
  punchline: z.string(),
  changes_made: z.array(z.string()),
  performance_notes: z.string(),
  status: z.string().default("success"),
});
export type RewriteJokeResponse = z.infer<typeof RewriteJokeResponseSchema>;

export const ClassifyJokeFormSchema = z.object({
  joke: z.string().trim().min(1, "Paste a joke to classify").max(5000),
});
export type ClassifyJokeFormValues = z.infer<typeof ClassifyJokeFormSchema>;

export const ClassifyJokeResponseSchema = z.object({
  style: JokeCategorySchema,
  humor_mechanism: HumorMechanismSchema,
  structure: z.string(),
  tags: z.array(z.string()),
  practice_category: SkillLevelSchema,
  similar_joke_styles: z.array(z.string()),
  status: z.string().default("success"),
});
export type ClassifyJokeResponse = z.infer<typeof ClassifyJokeResponseSchema>;

export const PracticeCoachFormSchema = z.object({
  current_skill_level: SkillLevelSchema.default("beginner"),
  practice_focus: PracticeFocusSchema.default("all"),
  session_goal: z.string().trim().min(1, "What do you want to achieve?").max(500),
  user_joke: z.string().trim().max(5000).optional(),
});
export type PracticeCoachFormValues = z.infer<typeof PracticeCoachFormSchema>;

export const PracticeCoachResponseSchema = z.object({
  exercise_type: z.string(),
  exercise_instructions: z.string(),
  practice_joke: z.string().nullable().optional(),
  drill_prompt: z.string(),
  success_criteria: z.array(z.string()),
  next_steps: z.array(z.string()),
  status: z.string().default("success"),
});
export type PracticeCoachResponse = z.infer<typeof PracticeCoachResponseSchema>;

export const CrowdSimulationFormSchema = z.object({
  joke: z.string().trim().min(1, "Paste the joke to simulate").max(5000),
  venue_type: VenueTypeSchema.default("open-mic"),
  audience_demographic: z.string().trim().min(1, "Describe the expected audience").max(500),
});
export type CrowdSimulationFormValues = z.infer<typeof CrowdSimulationFormSchema>;

export const CrowdSimulationResponseSchema = z.object({
  predicted_response: CrowdReactionSchema,
  laugh_probability: z.number().min(0).max(1),
  best_delivery_style: z.string(),
  potential_risks: z.array(z.string()),
  alternative_punchline: z.string().nullable().optional(),
  crowd_work_opportunity: z.string(),
  status: z.string().default("success"),
});
export type CrowdSimulationResponse = z.infer<typeof CrowdSimulationResponseSchema>;

export type JokeCoachResponse =
  | GenerateJokeResponse
  | EvaluateJokeResponse
  | RewriteJokeResponse
  | ClassifyJokeResponse
  | PracticeCoachResponse
  | CrowdSimulationResponse;
