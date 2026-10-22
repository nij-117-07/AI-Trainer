// src/features/practice/grader/actions/evaluate.ts
/**
 * Server Action for POST /assessment/grader/evaluate.
 * Grades a user's submission (text and/or image) against a target objective.
 */
"use server";

import { validateIdentity } from "@/features/identity/lib/auth-guard";
import {
  ExpectedLevelSchema,
  GradingResponseSchema,
  type GraderPayload,
  type GradingResponse,
  type TheoreticalGradingPayload,
} from "../types";
import { postFormData, safeParse, assessmentApiUrl } from "../../lib/api";

async function buildFormData(
  fields: TheoreticalGradingPayload,
  image: File | null
): Promise<FormData> {
  const identity = await validateIdentity();
  const formData = new FormData();
  formData.append("username", identity.username);
  formData.append("scenario", fields.scenario);
  formData.append("question_asked", fields.question_asked);
  formData.append("target_objective", fields.target_objective);
  formData.append("expected_level", fields.expected_level);
  if (fields.user_answer_text.trim()) {
    formData.append("user_answer_text", fields.user_answer_text.trim());
  }
  if (image) {
    formData.append("image", image, image.name);
  }
  return formData;
}

/** Grades a full submission from the standalone Grader page. */
export async function evaluateSubmissionAction(
  payload: GraderPayload
): Promise<GradingResponse> {
  safeParse(ExpectedLevelSchema, payload.expected_level, "Invalid expected level");
  if (!payload.user_answer_text.trim() && !payload.image) {
    throw new Error("Provide either an answer or an image to grade.");
  }

  const formData = await buildFormData(payload, payload.image);
  const raw = await postFormData<unknown>(
    assessmentApiUrl("/assessment/grader", "evaluate"),
    formData
  );
  return safeParse(GradingResponseSchema, raw, "Invalid grading response");
}

/** Grades a textual (and optionally image) answer from the Theoretical question page. */
export async function evaluateTheoreticalAnswerAction(
  payload: TheoreticalGradingPayload
): Promise<GradingResponse> {
  safeParse(ExpectedLevelSchema, payload.expected_level, "Invalid expected level");
  if (!payload.user_answer_text.trim() && !payload.image) {
    throw new Error("Provide either an answer or an image to grade.");
  }

  const formData = await buildFormData(payload, payload.image ?? null);
  const raw = await postFormData<unknown>(
    assessmentApiUrl("/assessment/grader", "evaluate"),
    formData
  );
  return safeParse(GradingResponseSchema, raw, "Invalid grading response");
}
