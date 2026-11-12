// src/features/testing-portal/lib/persistence.ts
/**
 * Storage for the MCQ generator. The setup form and the saved question list never share a key.
 * Saved data is read through sanitizeMcqResult, so damaged entries are dropped instead of crashing.
 */
import { loadDocument } from "@/lib/document-store";
import {
  OPTION_KEYS,
  type AnswerResult,
  type GradingResult,
  type McqItem,
  type OptionKey,
  type Options,
  type TheoreticalItem,
} from "../types";
import { PAST_QUESTIONS_LIMIT } from "./past-questions";

export const MCQ_STORAGE_KEYS = {
  form: "practice.testing-portal.mcq.form.v1",
  sessions: "practice.testing-portal.mcq.sessions.v1",
} as const;

/** Single-list storage from before sessions existed. It is moved into a session on first load. */
export const MCQ_LEGACY_KEYS = {
  result: "practice.testing-portal.mcq.result.v1",
  answers: "practice.testing-portal.mcq.answers.v1",
} as const;

export function mcqSessionKeys(sessionId: string) {
  return {
    result: `practice.testing-portal.mcq.session.${sessionId}.result.v1`,
    answers: `practice.testing-portal.mcq.session.${sessionId}.answers.v1`,
  };
}

export const THEORETICAL_STORAGE_KEYS = {
  form: "practice.testing-portal.theoretical.form.v1",
  sessions: "practice.testing-portal.theoretical.sessions.v1",
} as const;

/** Single-list storage from before sessions existed. It is moved into a session on first load. */
export const THEORETICAL_LEGACY_KEYS = {
  result: "practice.testing-portal.theoretical.result.v1",
  answers: "practice.testing-portal.theoretical.answers.v1",
} as const;

export function theoreticalSessionKeys(sessionId: string) {
  return {
    result: `practice.testing-portal.theoretical.session.${sessionId}.result.v1`,
    answers: `practice.testing-portal.theoretical.session.${sessionId}.answers.v1`,
  };
}

export const ANSWER_STORAGE_KEYS = {
  form: "practice.testing-portal.answer.form.v1",
  result: "practice.testing-portal.answer.result.v1",
} as const;

export interface SavedAnswer {
  question: string;
  answerText: string;
  keyConceptsCovered: string[];
}

export interface McqResult {
  questions: McqItem[];
  history: string[];
  contextSetting: string;
}

export const EMPTY_MCQ_RESULT: McqResult = { questions: [], history: [], contextSetting: "" };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isOptionKey(value: unknown): value is OptionKey {
  return (OPTION_KEYS as readonly unknown[]).includes(value);
}

function toQuestion(value: unknown): McqItem | null {
  if (!isRecord(value) || !isRecord(value.options)) return null;
  const questionText = typeof value.questionText === "string" ? value.questionText.trim() : "";
  if (!questionText || !isOptionKey(value.correctAnswer)) return null;
  const options = {} as Options;
  for (const key of OPTION_KEYS) {
    const text = value.options[key];
    if (typeof text !== "string" || !text.trim()) return null;
    options[key] = text.trim();
  }
  return { questionText, options, correctAnswer: value.correctAnswer };
}

export function sanitizeMcqResult(saved: unknown): McqResult {
  if (!isRecord(saved)) return EMPTY_MCQ_RESULT;
  const questions = Array.isArray(saved.questions)
    ? saved.questions.map(toQuestion).filter((question): question is McqItem => question !== null)
    : [];
  const history = Array.isArray(saved.history)
    ? saved.history.filter((item): item is string => typeof item === "string").slice(-PAST_QUESTIONS_LIMIT)
    : [];
  const contextSetting = typeof saved.contextSetting === "string" ? saved.contextSetting : "";
  return { questions, history, contextSetting };
}

export interface McqSessionSummary {
  id: string;
  title: string;
  questionCount: number;
  updatedAt: number;
}

export interface McqSessionIndex {
  activeId: string | null;
  sessions: McqSessionSummary[];
}

export const EMPTY_MCQ_SESSIONS: McqSessionIndex = { activeId: null, sessions: [] };

export function sanitizeMcqSessionIndex(saved: unknown): McqSessionIndex {
  if (!isRecord(saved) || !Array.isArray(saved.sessions)) return EMPTY_MCQ_SESSIONS;
  const sessions: McqSessionSummary[] = [];
  for (const item of saved.sessions) {
    if (!isRecord(item)) continue;
    const id = textOf(item.id);
    if (!id || sessions.some((session) => session.id === id)) continue;
    const questionCount = Math.floor(Number(item.questionCount));
    const updatedAt = Number(item.updatedAt);
    sessions.push({
      id,
      title: textOf(item.title) || "Untitled session",
      questionCount: Number.isFinite(questionCount) && questionCount > 0 ? questionCount : 0,
      updatedAt: Number.isFinite(updatedAt) ? updatedAt : 0,
    });
  }
  const activeId =
    typeof saved.activeId === "string" && sessions.some((session) => session.id === saved.activeId)
      ? saved.activeId
      : (sessions[0]?.id ?? null);
  return { activeId, sessions };
}

export async function loadMcqResult(sessionId: string): Promise<McqResult> {
  const saved = await loadDocument<unknown>(mcqSessionKeys(sessionId).result, null).catch(() => null);
  return sanitizeMcqResult(saved);
}

export interface McqAnswer {
  selected: OptionKey;
  checked: boolean;
}

/** Keyed by question index. */
export type McqAnswers = Partial<Record<number, McqAnswer>>;

export function sanitizeMcqAnswers(saved: unknown): McqAnswers {
  if (!isRecord(saved)) return {};
  const answers: McqAnswers = {};
  for (const [key, value] of Object.entries(saved)) {
    if (!/^\d+$/.test(key) || !isRecord(value) || !isOptionKey(value.selected)) continue;
    answers[Number(key)] = { selected: value.selected, checked: value.checked === true };
  }
  return answers;
}

export async function loadMcqAnswers(sessionId: string): Promise<McqAnswers> {
  const saved = await loadDocument<unknown>(mcqSessionKeys(sessionId).answers, null).catch(() => null);
  return sanitizeMcqAnswers(saved);
}

export interface TheoreticalResult {
  questions: TheoreticalItem[];
  history: string[];
  contextSetting: string;
  difficultyLevel: string;
}

export const EMPTY_THEORETICAL_RESULT: TheoreticalResult = {
  questions: [],
  history: [],
  contextSetting: "",
  difficultyLevel: "",
};

function textOf(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function toTheoreticalItem(value: unknown): TheoreticalItem | null {
  if (!isRecord(value)) return null;
  const questionText = textOf(value.questionText);
  if (!questionText) return null;
  return {
    questionText,
    focusArea: textOf(value.focusArea),
    evaluationCriteria: textOf(value.evaluationCriteria),
  };
}

export function sanitizeTheoreticalResult(saved: unknown): TheoreticalResult {
  if (!isRecord(saved)) return EMPTY_THEORETICAL_RESULT;
  const questions = Array.isArray(saved.questions)
    ? saved.questions.map(toTheoreticalItem).filter((item): item is TheoreticalItem => item !== null)
    : [];
  const history = Array.isArray(saved.history)
    ? saved.history.filter((item): item is string => typeof item === "string").slice(-PAST_QUESTIONS_LIMIT)
    : [];
  return {
    questions,
    history,
    contextSetting: textOf(saved.contextSetting),
    difficultyLevel: textOf(saved.difficultyLevel),
  };
}

export interface TheoreticalSessionSummary {
  id: string;
  title: string;
  questionCount: number;
  updatedAt: number;
}

export interface TheoreticalSessionIndex {
  activeId: string | null;
  sessions: TheoreticalSessionSummary[];
}

export const EMPTY_THEORETICAL_SESSIONS: TheoreticalSessionIndex = { activeId: null, sessions: [] };

export function sanitizeTheoreticalSessionIndex(saved: unknown): TheoreticalSessionIndex {
  if (!isRecord(saved) || !Array.isArray(saved.sessions)) return EMPTY_THEORETICAL_SESSIONS;
  const sessions: TheoreticalSessionSummary[] = [];
  for (const item of saved.sessions) {
    if (!isRecord(item)) continue;
    const id = textOf(item.id);
    if (!id || sessions.some((session) => session.id === id)) continue;
    const questionCount = Math.floor(Number(item.questionCount));
    const updatedAt = Number(item.updatedAt);
    sessions.push({
      id,
      title: textOf(item.title) || "Untitled session",
      questionCount: Number.isFinite(questionCount) && questionCount > 0 ? questionCount : 0,
      updatedAt: Number.isFinite(updatedAt) ? updatedAt : 0,
    });
  }
  const activeId =
    typeof saved.activeId === "string" && sessions.some((session) => session.id === saved.activeId)
      ? saved.activeId
      : (sessions[0]?.id ?? null);
  return { activeId, sessions };
}

export async function loadTheoreticalResult(sessionId: string): Promise<TheoreticalResult> {
  const saved = await loadDocument<unknown>(theoreticalSessionKeys(sessionId).result, null).catch(() => null);
  return sanitizeTheoreticalResult(saved);
}

/** The user's work on one theoretical question. The image is not stored. */
export interface TheoreticalAnswer {
  answer: string;
  /** The answer text the saved grade was made for. */
  gradedText: string | null;
  grade: GradingResult | null;
  expert: AnswerResult | null;
}

export const EMPTY_THEORETICAL_ANSWER: TheoreticalAnswer = { answer: "", gradedText: null, grade: null, expert: null };

/** Keyed by question index. */
export type TheoreticalAnswers = Record<number, TheoreticalAnswer>;

export function sanitizeTheoreticalAnswers(saved: unknown): TheoreticalAnswers {
  if (!isRecord(saved)) return {};
  const answers: TheoreticalAnswers = {};
  for (const [key, value] of Object.entries(saved)) {
    if (!/^\d+$/.test(key) || !isRecord(value)) continue;
    const rawGrade = value.grade;
    const rawExpert = value.expert;
    const expertText = isRecord(rawExpert) ? textOf(rawExpert.answerText) : "";
    answers[Number(key)] = {
      answer: typeof value.answer === "string" ? value.answer : "",
      gradedText: typeof value.gradedText === "string" ? value.gradedText : null,
      grade: isRecord(rawGrade) ? toGrade(rawGrade) : null,
      expert:
        isRecord(rawExpert) && expertText
          ? { answerText: expertText, keyConceptsCovered: stringList(rawExpert.keyConceptsCovered) }
          : null,
    };
  }
  return answers;
}

export async function loadTheoreticalAnswers(sessionId: string): Promise<TheoreticalAnswers> {
  const saved = await loadDocument<unknown>(theoreticalSessionKeys(sessionId).answers, null).catch(() => null);
  return sanitizeTheoreticalAnswers(saved);
}

/** Returns the saved answer, or null when there is none or it is unreadable. */
export function sanitizeAnswerResult(saved: unknown): SavedAnswer | null {
  if (!isRecord(saved)) return null;
  const answerText = textOf(saved.answerText);
  if (!answerText) return null;
  const keyConceptsCovered = Array.isArray(saved.keyConceptsCovered)
    ? saved.keyConceptsCovered.map(textOf).filter((concept) => concept.length > 0)
    : [];
  return { question: textOf(saved.question), answerText, keyConceptsCovered };
}

export async function loadAnswerResult(): Promise<SavedAnswer | null> {
  const saved = await loadDocument<unknown>(ANSWER_STORAGE_KEYS.result, null).catch(() => null);
  return sanitizeAnswerResult(saved);
}

/** The form keys are the ones the solver has always used, so a saved draft still loads. */
export const SOLVER_STORAGE_KEYS = {
  question: "practice.testing-portal.solver.form.v1.question",
  context: "practice.testing-portal.solver.form.v1.context",
  options: "practice.testing-portal.solver.form.v1.options",
  result: "practice.testing-portal.solver.result.v1",
} as const;

export interface SavedSolve {
  question: string;
  context: string;
  options: Options;
  correctOption: OptionKey;
  reasoning: string;
}

/** Returns the saved answer, or null when there is none or it is unreadable. */
export function sanitizeSolverResult(saved: unknown): SavedSolve | null {
  if (!isRecord(saved) || !isRecord(saved.options) || !isOptionKey(saved.correctOption)) return null;
  const options = {} as Options;
  for (const key of OPTION_KEYS) {
    options[key] = textOf(saved.options[key]);
  }
  return {
    question: textOf(saved.question),
    context: textOf(saved.context),
    options,
    correctOption: saved.correctOption,
    reasoning: textOf(saved.reasoning),
  };
}

export async function loadSolverResult(): Promise<SavedSolve | null> {
  const saved = await loadDocument<unknown>(SOLVER_STORAGE_KEYS.result, null).catch(() => null);
  return sanitizeSolverResult(saved);
}

export const GRADER_STORAGE_KEYS = {
  form: "practice.testing-portal.grader.form.v1",
  result: "practice.testing-portal.grader.result.v1",
} as const;

export interface SavedGrade {
  questionAsked: string;
  targetObjective: string;
  userAnswerText: string;
  hadImage: boolean;
  grade: GradingResult;
}

function stringList(value: unknown): string[] {
  return Array.isArray(value) ? value.map(textOf).filter((item) => item.length > 0) : [];
}

function toGrade(raw: Record<string, unknown>): GradingResult {
  const score = Number(raw.score);
  return {
    combinedAnalysis: textOf(raw.combinedAnalysis),
    score: Number.isFinite(score) ? score : 0,
    strengths: stringList(raw.strengths),
    weaknesses: stringList(raw.weaknesses),
    detailedFeedback: textOf(raw.detailedFeedback),
    isTargetMet: raw.isTargetMet === true,
  };
}

/** Returns the saved grade, or null when there is none or it is unreadable. */
export function sanitizeGraderResult(saved: unknown): SavedGrade | null {
  if (!isRecord(saved) || !isRecord(saved.grade)) return null;
  return {
    questionAsked: textOf(saved.questionAsked),
    targetObjective: textOf(saved.targetObjective),
    userAnswerText: textOf(saved.userAnswerText),
    hadImage: saved.hadImage === true,
    grade: toGrade(saved.grade),
  };
}

export async function loadGraderResult(): Promise<SavedGrade | null> {
  const saved = await loadDocument<unknown>(GRADER_STORAGE_KEYS.result, null).catch(() => null);
  return sanitizeGraderResult(saved);
}
