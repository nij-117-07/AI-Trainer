// src/features/tutor/lib/tutor-input.ts
/**
 * Validates the tutor form before a model call, mirrors the webui field limits, and moves the
 * conversation on after each answer (the question becomes "last topic taught").
 */
import type { TutorFormValues } from "../types";
import { isRecord, optionalText, requireText } from "./values";

export interface TutorInput {
  systemPrompt: string;
  userQuery: string;
  studentLevel: string;
  learningStyle: string;
  currentScenario: string;
  lastTopicTaught?: string;
}

/** The persona text comes from the chosen template, so it is passed in rather than stored in the form. */
export function buildTutorInput(values: TutorFormValues, personaPrompt: string): TutorInput {
  return {
    systemPrompt: requireText(personaPrompt, "Persona", 4000, 10),
    userQuery: requireText(values.userQuery, "Your question", 2000, 3),
    studentLevel: requireText(values.studentLevel, "Student level", 200, 2),
    learningStyle: requireText(values.learningStyle, "Learning style", 200, 2),
    currentScenario: optionalText(values.currentScenario, "Scenario", 500) ?? "None",
    lastTopicTaught: optionalText(values.lastTopicTaught, "Last topic taught", 500),
  };
}

export function advanceTurn(values: TutorFormValues): TutorFormValues {
  return { ...values, lastTopicTaught: values.userQuery.trim(), userQuery: "" };
}

export function startFresh(values: TutorFormValues): TutorFormValues {
  return { ...values, lastTopicTaught: "" };
}

export function parseTutorDraft(raw: unknown, defaults: TutorFormValues): TutorFormValues {
  if (!isRecord(raw)) return defaults;
  const pick = (key: keyof TutorFormValues): string =>
    typeof raw[key] === "string" ? (raw[key] as string) : defaults[key];
  return {
    persona: pick("persona"),
    userQuery: pick("userQuery"),
    studentLevel: pick("studentLevel"),
    learningStyle: pick("learningStyle"),
    currentScenario: pick("currentScenario"),
    lastTopicTaught: pick("lastTopicTaught"),
  };
}
