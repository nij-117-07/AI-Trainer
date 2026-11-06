// src/features/practice/interview/lib/setup-form.ts
/**
 * Setup-form draft: curated defaults, the localStorage key and the wrapped
 * usePersistedForm hook. Lives in lib so both the page header (DraftStatus)
 * and the form component share one draft instance.
 */
"use client";

import { usePersistedForm } from "@/features/learning/explainer/hooks/usePersistedForm";
import { InterviewSetupSchema, type InterviewSetupValues } from "../types";

export const INTERVIEW_SETUP_KEY = "practice.interview.setup.v1";

export const INTERVIEW_SETUP_DEFAULTS: InterviewSetupValues = {
  candidate_name: "Asha",
  candidate_experience: "3 years building backend services",
  candidate_skills: "Python, FastAPI, PostgreSQL, AWS",
  position_role: "Senior Backend Engineer",
  position_company: "",
  position_skills: "Python, AWS, Distributed systems",
  position_level: "senior",
  interviewer_role: "Tech Lead",
  interview_type: "technical",
  interview_round: "technical round",
  interview_format: "60 min live",
  max_questions: 8,
  duration_minutes: 60,
};

export function useSetupDraft() {
  return usePersistedForm<InterviewSetupValues, null>({
    schema: InterviewSetupSchema,
    storageKey: INTERVIEW_SETUP_KEY,
    defaults: INTERVIEW_SETUP_DEFAULTS,
  });
}
