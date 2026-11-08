// src/features/interview/lib/validate.ts
/**
 * Setup form checks for the Interview Simulator. Messages and limits match the webui zod schema, so
 * a bad form is rejected before any request is sent.
 */
import { DURATION_LIMITS, MAX_QUESTIONS_LIMIT, POSITION_LEVEL_OPTIONS, QUESTION_TYPE_OPTIONS, optionValues } from "../options";
import type { InterviewSetup, InterviewSetupForm } from "../types";

export function requireText(value: string, label: string, max: number): string {
  const trimmed = value.trim();
  if (!trimmed) throw new Error(`${label} is required.`);
  if (trimmed.length > max) throw new Error(`${label} must be ${max} characters or fewer.`);
  return trimmed;
}

function required(value: string, emptyMessage: string, max: number): string {
  const trimmed = value.trim();
  if (!trimmed) throw new Error(emptyMessage);
  if (trimmed.length > max) throw new Error(`Keep this under ${max} characters.`);
  return trimmed;
}

function optional(value: string, max: number): string {
  const trimmed = value.trim();
  if (trimmed.length > max) throw new Error(`Keep this under ${max} characters.`);
  return trimmed;
}

function integerInRange(raw: number | string, min: number, max: number, message: string): number {
  const text = typeof raw === "number" ? String(raw) : raw.trim();
  const value = Number(text);
  if (!text || !Number.isInteger(value) || value < min || value > max) throw new Error(message);
  return value;
}

export function validateSetup(form: InterviewSetupForm): InterviewSetup {
  const levels = optionValues(POSITION_LEVEL_OPTIONS);
  if (!levels.includes(form.positionLevel)) throw new Error("Pick a seniority level.");
  if (!optionValues(QUESTION_TYPE_OPTIONS).includes(form.interviewType)) throw new Error("Pick an interview type.");
  return {
    candidateName: required(form.candidateName, "Enter the candidate's name", 200),
    candidateExperience: required(form.candidateExperience, "Describe the candidate's experience", 1000),
    candidateSkills: required(form.candidateSkills, "List the candidate's skills", 1000),
    positionRole: required(form.positionRole, "Enter the target role", 300),
    positionCompany: optional(form.positionCompany, 300),
    positionSkills: optional(form.positionSkills, 1000),
    positionLevel: form.positionLevel,
    interviewerRole: required(form.interviewerRole, "Enter the interviewer's role", 300),
    interviewType: form.interviewType,
    interviewRound: required(form.interviewRound, "Enter the round", 100),
    interviewFormat: required(form.interviewFormat, "Describe the format", 300),
    maxQuestions: integerInRange(
      form.maxQuestions,
      1,
      MAX_QUESTIONS_LIMIT,
      `Max questions must be a whole number from 1 to ${MAX_QUESTIONS_LIMIT}.`,
    ),
    durationMinutes: integerInRange(
      form.durationMinutes,
      DURATION_LIMITS.min,
      DURATION_LIMITS.max,
      `Duration must be a whole number of minutes from ${DURATION_LIMITS.min} to ${DURATION_LIMITS.max}.`,
    ),
  };
}
