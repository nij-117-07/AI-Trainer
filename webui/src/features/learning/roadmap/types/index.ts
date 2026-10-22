// src/features/learning/roadmap/types/index.ts
/**
 * Zod schemas + types for the Roadmap Generator service and the persisted
 * roadmap documents stored in data/roadmaps.json.
 */
import { z } from "zod";

// ---------------------------------------------------------------------------
// Backend API contracts (learning/roadmap/api.md)
// ---------------------------------------------------------------------------

export const RoadmapRequestSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  start_level: z.string().min(1, "Start level is required"),
  target_level: z.string().min(1, "Target level is required"),
  mode: z.enum(["detailed", "short"]).default("detailed"),
  persona_style: z.string().min(1, "Persona style is required").default("industry expert"),
  user_instructions: z.string().default(""),
});
export type RoadmapRequest = z.infer<typeof RoadmapRequestSchema>;

export const RoadmapResponseSchema = z.object({
  generated_persona_prompt: z.string(),
  main_topics: z.array(z.string()),
  status: z.string().optional(),
});
export type RoadmapResponse = z.infer<typeof RoadmapResponseSchema>;

export const ExpandTopicRequestSchema = z.object({
  persona: z.string().min(1),
  subject: z.string().min(1),
  target_level: z.string().min(1),
  full_topic_list: z.array(z.string()),
  current_module: z.string().min(1),
  mode: z.enum(["detailed", "short"]).default("detailed"),
});
export type ExpandTopicRequest = z.infer<typeof ExpandTopicRequestSchema>;

export const ExpandTopicResponseSchema = z.object({
  topic: z.string(),
  subtopics: z.array(z.string()),
  milestone: z.string(),
  status: z.string().optional(),
});
export type ExpandTopicResponse = z.infer<typeof ExpandTopicResponseSchema>;

// ---------------------------------------------------------------------------
// Persisted roadmap documents
// ---------------------------------------------------------------------------

export const RoadmapSubtopicSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Subtopic title is required"),
  done: z.boolean(),
});
export type RoadmapSubtopic = z.infer<typeof RoadmapSubtopicSchema>;

export const RoadmapMainPointSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Main point title is required"),
  done: z.boolean(),
  milestone: z.string().optional(),
  subtopics: z.array(RoadmapSubtopicSchema),
});
export type RoadmapMainPoint = z.infer<typeof RoadmapMainPointSchema>;

export const RoadmapSchema = z.object({
  id: z.string(),
  owner: z.string(),
  subject: z.string().min(1, "Subject is required"),
  start_level: z.string().min(1),
  target_level: z.string().min(1),
  mode: z.string(),
  persona_style: z.string(),
  user_instructions: z.string(),
  persona: z.string(),
  main_topics: z.array(RoadmapMainPointSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Roadmap = z.infer<typeof RoadmapSchema>;

/** Payload for creating a roadmap (owner/id/timestamps are added server-side). */
export const CreateRoadmapInputSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  start_level: z.string().min(1),
  target_level: z.string().min(1),
  mode: z.string(),
  persona_style: z.string(),
  user_instructions: z.string(),
  persona: z.string(),
  main_topics: z.array(z.string().min(1)).min(0),
});
export type CreateRoadmapInput = z.infer<typeof CreateRoadmapInputSchema>;
