// src/features/explainer/lib/drafts.ts
/**
 * Saved drafts for the explainer tools: storage keys, starting values, and the parsers that read
 * stored JSON. Stored data is not trusted, so every field falls back to its default when it is
 * missing or has the wrong type.
 */
import type {
  ExplainFormValues,
  ExplainResult,
  FeynmanFormValues,
  FeynmanResult,
  SocraticFormValues,
  SocraticQuestion,
  SocraticResult,
  TutorialFormValues,
  TutorialResult,
} from "../types";

export interface ToolDraft<TForm, TResult> {
  form: TForm;
  result: TResult | null;
}

export const LIMITS = {
  topic: 200,
  level: 100,
  context: 2000,
  socraticContext: 5000,
  instructions: 1000,
} as const;

export const FEYNMAN_AGE = { min: 3, max: 25, fallback: 5 } as const;
export const SOCRATIC_QUESTIONS = { min: 1, max: 10, fallback: 3 } as const;

export const QUICK_EXPLAIN_KEY = "learning.quick-explain.v2";
export const TUTORIAL_KEY = "learning.a-to-z.v1";
export const FEYNMAN_KEY = "learning.feynman.v1";
export const SOCRATIC_KEY = "learning.socratic.v1";

export const QUICK_EXPLAIN_DEFAULTS: ExplainFormValues = {
  topic: "",
  explanationLevel: "beginner",
  context: "",
};

export const TUTORIAL_DEFAULTS: TutorialFormValues = {
  topic: "",
  expertiseLevel: "intermediate",
  explanationStyle: "practical",
};

export const FEYNMAN_DEFAULTS: FeynmanFormValues = {
  complexTopic: "",
  targetAge: FEYNMAN_AGE.fallback,
};

export const SOCRATIC_DEFAULTS: SocraticFormValues = {
  topic: "",
  context: "",
  userInstructions: "",
  level: "intermediate",
  questionCategory: "counterfactual",
  numQuestions: SOCRATIC_QUESTIONS.fallback,
};

type Record_ = Record<string, unknown>;

function asRecord(raw: unknown): Record_ {
  return typeof raw === "object" && raw !== null && !Array.isArray(raw) ? (raw as Record_) : {};
}

function textOf(raw: unknown, fallback = "", max = Number.POSITIVE_INFINITY): string {
  return typeof raw === "string" ? raw.slice(0, max) : fallback;
}

function numberOf(raw: unknown, fallback: number, min: number, max: number): number {
  return typeof raw === "number" && Number.isFinite(raw) ? Math.min(max, Math.max(min, Math.round(raw))) : fallback;
}

function textList(raw: unknown): string[] {
  return Array.isArray(raw) ? raw.filter((item): item is string => typeof item === "string" && item.trim() !== "") : [];
}

function recordList(raw: unknown): Record_[] {
  return Array.isArray(raw) ? raw.map(asRecord) : [];
}

function resultOf<T>(raw: unknown, read: (record: Record_) => T): T | null {
  return typeof raw === "object" && raw !== null ? read(asRecord(raw)) : null;
}

export function parseQuickExplain(raw: unknown): ToolDraft<ExplainFormValues, ExplainResult> {
  const record = asRecord(raw);
  const form = asRecord(record.form);
  return {
    form: {
      topic: textOf(form.topic, "", LIMITS.topic),
      explanationLevel: textOf(form.explanationLevel, QUICK_EXPLAIN_DEFAULTS.explanationLevel, LIMITS.level),
      context: textOf(form.context, "", LIMITS.context),
    },
    result: resultOf(record.result, (item) => ({
      explanation: textOf(item.explanation),
      keyTakeaway: textOf(item.keyTakeaway),
    })),
  };
}

export function parseTutorial(raw: unknown): ToolDraft<TutorialFormValues, TutorialResult> {
  const record = asRecord(raw);
  const form = asRecord(record.form);
  return {
    form: {
      topic: textOf(form.topic, "", LIMITS.topic),
      expertiseLevel: textOf(form.expertiseLevel, TUTORIAL_DEFAULTS.expertiseLevel, LIMITS.level),
      explanationStyle: textOf(form.explanationStyle, TUTORIAL_DEFAULTS.explanationStyle, LIMITS.level),
    },
    result: resultOf(record.result, (item) => ({
      fullExplanation: textOf(item.fullExplanation),
    })),
  };
}

export function parseFeynman(raw: unknown): ToolDraft<FeynmanFormValues, FeynmanResult> {
  const record = asRecord(raw);
  const form = asRecord(record.form);
  return {
    form: {
      complexTopic: textOf(form.complexTopic, "", LIMITS.topic),
      targetAge: numberOf(form.targetAge, FEYNMAN_DEFAULTS.targetAge, FEYNMAN_AGE.min, FEYNMAN_AGE.max),
    },
    result: resultOf(record.result, (item) => ({
      explanation: textOf(item.explanation),
      keyMetaphors: textList(item.keyMetaphors),
      funAnalogy: textOf(item.funAnalogy),
    })),
  };
}

function toQuestion(item: Record_): SocraticQuestion {
  return {
    questionText: textOf(item.questionText),
    cognitiveChallenge: textOf(item.cognitiveChallenge),
    guidingHint: textOf(item.guidingHint),
  };
}

export function parseSocratic(raw: unknown): ToolDraft<SocraticFormValues, SocraticResult> {
  const record = asRecord(raw);
  const form = asRecord(record.form);
  return {
    form: {
      topic: textOf(form.topic, "", LIMITS.topic),
      context: textOf(form.context, "", LIMITS.socraticContext),
      userInstructions: textOf(form.userInstructions, "", LIMITS.instructions),
      level: textOf(form.level, SOCRATIC_DEFAULTS.level, LIMITS.level),
      questionCategory: textOf(form.questionCategory, SOCRATIC_DEFAULTS.questionCategory, LIMITS.level),
      numQuestions: numberOf(
        form.numQuestions,
        SOCRATIC_DEFAULTS.numQuestions,
        SOCRATIC_QUESTIONS.min,
        SOCRATIC_QUESTIONS.max,
      ),
    },
    result: resultOf(record.result, (item) => ({
      pedagogicalGoal: textOf(item.pedagogicalGoal),
      questionsForDiscovery: recordList(item.questionsForDiscovery)
        .map(toQuestion)
        .filter((question) => question.questionText.trim() !== ""),
    })),
  };
}
