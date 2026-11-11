// src/features/motivation/lib/reflection-session.ts
/**
 * Step-by-step state for one reflection round: the prompts, the answer to each, and the current
 * step. A round belongs to the prompts it started with, so new prompts start a new round.
 */
import { isRecord, listOf, textOf } from "./normalise";

export const REFLECTION_SESSION_KEY = "learning.motivation.reflect.session.v1";

export interface ReflectionSession {
  prompts: string[];
  answers: string[];
  /** Index of the prompt on screen. Equals prompts.length once the round is finished. */
  step: number;
  /** True once the answer to the current prompt has been saved. */
  submitted: boolean;
}

/** empty: no prompts. answering: the answer box is open. saved: the answer is saved, Next is shown. finished: the summary. */
export type ReflectionPhase = "empty" | "answering" | "saved" | "finished";

export function emptyReflectionSession(prompts: string[] = []): ReflectionSession {
  return { prompts, answers: prompts.map(() => ""), step: 0, submitted: false };
}

/** Rebuilds a stored round field by field. Anything damaged falls back to an empty round. */
export function restoreReflectionSession(raw: unknown): ReflectionSession {
  const record = isRecord(raw) ? raw : {};
  const session = isRecord(record.session) ? record.session : {};
  const prompts = listOf<unknown>(session.prompts).map(textOf).filter((prompt) => prompt !== "");
  const storedAnswers = listOf<unknown>(session.answers);
  const answers = prompts.map((_, index) => textOf(storedAnswers[index]));
  const step =
    typeof session.step === "number" && Number.isInteger(session.step)
      ? Math.min(Math.max(session.step, 0), prompts.length)
      : 0;
  return { prompts, answers, step, submitted: session.submitted === true && step < prompts.length };
}

/** Returns the stored round when it belongs to these prompts, or an empty round for them. */
export function roundFor(session: ReflectionSession, prompts: string[]): ReflectionSession {
  const same = session.prompts.length === prompts.length && session.prompts.every((prompt, index) => prompt === prompts[index]);
  return same ? session : emptyReflectionSession(prompts);
}

export function reflectionPhase(session: ReflectionSession): ReflectionPhase {
  if (session.prompts.length === 0) return "empty";
  if (session.step >= session.prompts.length) return "finished";
  return session.submitted ? "saved" : "answering";
}

export function stepLabel(session: ReflectionSession): string {
  return `Prompt ${session.step + 1} of ${session.prompts.length}`;
}

export function isLastStep(session: ReflectionSession): boolean {
  return session.step === session.prompts.length - 1;
}

export function withAnswer(session: ReflectionSession, text: string): ReflectionSession {
  if (reflectionPhase(session) !== "answering") return session;
  return { ...session, answers: session.answers.map((answer, index) => (index === session.step ? text : answer)) };
}

export function submitAnswer(session: ReflectionSession): ReflectionSession {
  if (reflectionPhase(session) !== "answering" || session.answers[session.step].trim() === "") return session;
  return { ...session, submitted: true };
}

export function advance(session: ReflectionSession): ReflectionSession {
  if (reflectionPhase(session) !== "saved") return session;
  return { ...session, step: session.step + 1, submitted: false };
}
