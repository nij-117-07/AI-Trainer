// src/features/learning/explainer/types/index.ts
/**
 * Zod schemas + TypeScript interfaces for every Explainer API endpoint.
 * Schemas validate both the outgoing request bodies (in server actions and
 * route handlers) and the incoming responses, keeping types strict.
 */
import { z } from "zod";

export const expertiseLevels = ["beginner", "intermediate", "expert"] as const;
export const explanationStyles = ["academic", "practical", "with examples"] as const;
export const roadmapStyles = ["academic", "practical", "with examples", "conceptual"] as const;
export const userLevels = ["beginner", "intermediate", "advanced", "expert"] as const;
export const questionCategories = [
  "conceptual-bridge",
  "counterfactual",
  "first-principles",
  "applied-case-study",
  "reductio-ad-absurdum",
] as const;

// The backend accepts any value for these fields ("any value accepted"), so
// the schemas are free-form strings. The `*Options` lists above remain as
// suggested presets for the dropdown UIs.
const freeTextLevelSchema = z.string().trim().min(1, "Required").max(100);

export const ExpertiseLevelSchema = freeTextLevelSchema;
export const ExplanationStyleSchema = freeTextLevelSchema;
export const RoadmapStyleSchema = freeTextLevelSchema;
export const UserLevelSchema = freeTextLevelSchema;
export const QuestionCategorySchema = freeTextLevelSchema;

// ---------------------------------------------------------------------------
// Request schemas
// ---------------------------------------------------------------------------

export const ExplainRequestSchema = z.object({
  topic: z.string().trim().min(1, "Topic is required").max(200),
  expertise_level: ExpertiseLevelSchema.default("intermediate"),
  context: z.string().trim().max(2000).optional().default(""),
});

export const TutorialRequestSchema = z.object({
  topic: z.string().trim().min(1, "Topic is required").max(200),
  expertise_level: ExpertiseLevelSchema,
  explanation_style: ExplanationStyleSchema,
});

export const AtoZRequestSchema = z.object({
  topic: z.string().trim().min(1, "Topic is required").max(200),
  expertise_level: ExpertiseLevelSchema,
  explanation_style: RoadmapStyleSchema,
});

export const FeynmanRequestSchema = z.object({
  complex_topic: z.string().trim().min(1, "Topic is required").max(200),
  target_age: z.coerce.number().int().min(3).max(25).default(5),
});

export const OrchestratorRequestSchema = z.object({
  topic: z.string().trim().min(1, "Topic is required").max(200),
  expertise: z.string().trim().max(80).optional().default("Undergraduate"),
});

export const SocraticRequestSchema = z.object({
  topic: z.string().trim().min(1, "Topic is required").max(200),
  context: z.string().trim().min(1, "Context / background material is required").max(5000),
  user_instructions: z.string().trim().max(1000).optional().default(""),
  level: ExpertiseLevelSchema.default("intermediate"),
  question_category: QuestionCategorySchema,
  num_questions: z.coerce.number().int().min(1).max(10).default(3),
});

export const CurriculumRequestSchema = z.object({
  topic: z.string().trim().min(1, "Topic is required").max(200),
  context: z.string().trim().min(1, "Source material is required").max(5000),
  past_learning: z.string().trim().min(1, "Summary of past learning is required").max(2000),
  user_level: UserLevelSchema,
  user_hopes: z.string().trim().min(1, "What you want to achieve is required").max(1000),
  additional_instructions: z.string().trim().max(1000).optional().default(""),
});

// ---------------------------------------------------------------------------
// Response schemas
// ---------------------------------------------------------------------------

export const ExplainResponseSchema = z.object({
  explanation: z.string(),
  key_takeaway: z.string(),
});

export const TutorialResponseSchema = z.object({
  full_explanation: z.string(),
});

export const AtoZResponseSchema = z.object({
  summary: z.string(),
  knowledge_roadmap: z
    .array(z.object({ concept: z.string(), explanation: z.string() }))
    .default([]),
  practical_takeaway: z.string(),
});

export const FeynmanResponseSchema = z.object({
  explanation: z.string(),
  key_metaphors: z.array(z.string()).default([]),
  fun_analogy: z.string(),
});

export const SocraticResponseSchema = z.object({
  pedagogical_goal: z.string(),
  question_category: z.string(),
  questions_for_discovery: z
    .array(
      z.object({
        question_text: z.string(),
        cognitive_challenge: z.string(),
        guiding_hint: z.string(),
      })
    )
    .default([]),
});

export const CurriculumResponseSchema = z.object({
  session_id: z.string().optional(),
  rationale: z.string(),
  the_crux: z.string(),
  learning_roadmap: z
    .array(
      z.object({
        phase: z.string(),
        description: z.string(),
        learning_objective: z.string(),
      })
    )
    .default([]),
  suggested_focus: z.string(),
});

export const OrchestratorPlanEventSchema = z.object({
  titles: z.array(z.string()).default([]),
  prerequisites: z.array(z.string()).default([]),
});

export const OrchestratorChapterEventSchema = z.object({
  index: z.number().int(),
  title: z.string(),
  content: z.string(),
  analogy: z.string().optional(),
  jargon: z.array(z.string()).default([]),
});

// ---------------------------------------------------------------------------
// Inferred TypeScript types (prefer interfaces for public API shapes)
// ---------------------------------------------------------------------------

export type ExpertiseLevel = z.infer<typeof ExpertiseLevelSchema>;
export type ExplanationStyle = z.infer<typeof ExplanationStyleSchema>;
export type RoadmapStyle = z.infer<typeof RoadmapStyleSchema>;
export type UserLevel = z.infer<typeof UserLevelSchema>;
export type QuestionCategory = z.infer<typeof QuestionCategorySchema>;

export type ExplainRequest = z.input<typeof ExplainRequestSchema>;
export type TutorialRequest = z.input<typeof TutorialRequestSchema>;
export type AtoZRequest = z.input<typeof AtoZRequestSchema>;
export type FeynmanRequest = z.input<typeof FeynmanRequestSchema>;
export type OrchestratorRequest = z.input<typeof OrchestratorRequestSchema>;
export type SocraticRequest = z.input<typeof SocraticRequestSchema>;
export type CurriculumRequest = z.input<typeof CurriculumRequestSchema>;

export interface ExplainResponse {
  explanation: string;
  key_takeaway: string;
}

export interface TutorialResponse {
  full_explanation: string;
}

export interface RoadmapConcept {
  concept: string;
  explanation: string;
}

export interface AtoZResponse {
  summary: string;
  knowledge_roadmap: RoadmapConcept[];
  practical_takeaway: string;
}

export interface FeynmanResponse {
  explanation: string;
  key_metaphors: string[];
  fun_analogy: string;
}

export interface SocraticQuestion {
  question_text: string;
  cognitive_challenge: string;
  guiding_hint: string;
}

export interface SocraticResponse {
  pedagogical_goal: string;
  question_category: string;
  questions_for_discovery: SocraticQuestion[];
}

export interface RoadmapPhase {
  phase: string;
  description: string;
  learning_objective: string;
}

export interface CurriculumResponse {
  session_id?: string;
  rationale: string;
  the_crux: string;
  learning_roadmap: RoadmapPhase[];
  suggested_focus: string;
}

export interface OrchestratorPlan {
  titles: string[];
  prerequisites: string[];
}

export interface OrchestratorChapter {
  index: number;
  title: string;
  content: string;
  analogy?: string;
  jargon: string[];
}
