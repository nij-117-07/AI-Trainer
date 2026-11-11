// src/features/topic-suggestions/lib/topics.ts
/**
 * Rules for Topic Suggestions: the saved topic list, the saved generator draft, and how suggested
 * topics join the list. Stored JSON is not trusted, so every value is read through a normaliser.
 */
import { TOPIC_LEVELS } from "@/features/guides/options";
import { isRecord, listOf, textOf } from "@/features/guides/lib/text";
import type { TopicRecommendation } from "@/features/guides/types";
import type { AppendTopicsResult, SavedTopic, TopicCandidate, TopicContext, TopicFormValues } from "../types";

export const TOPIC_LIST_KEY = "learning.topic-suggestions.v1";
export const TOPIC_DRAFT_KEY = "learning.topic-suggestions-generator.v1";

export const TOPIC_FORM_DEFAULTS: TopicFormValues = {
  broaderTopic: "",
  specificInterest: "",
  learnedBefore: "",
  customUserInput: "",
  topicLevel: "Intermediate",
};

const LIMITS = {
  broaderTopic: 200,
  specificInterest: 200,
  learnedBefore: 2000,
  customUserInput: 1000,
} as const;

const HISTORY_LIMIT = 2000;

function textOr(value: unknown, fallback: string, max = Number.POSITIVE_INFINITY): string {
  return typeof value === "string" ? value.slice(0, max) : fallback;
}

function toRecommendation(raw: unknown): TopicRecommendation | null {
  if (!isRecord(raw)) return null;
  const topicName = textOf(raw.topicName);
  if (!topicName) return null;
  return { topicName, reason: textOf(raw.reason) };
}

export function normalizeList(raw: unknown): SavedTopic[] {
  return listOf(raw).flatMap((item) => {
    if (!isRecord(item)) return [];
    const topic = toRecommendation(item);
    const id = textOf(item.id);
    if (!topic || !id) return [];
    return [{ ...topic, id, done: item.done === true, addedAt: textOf(item.addedAt) }];
  });
}

export function normalizeDraft(raw: unknown): { form: TopicFormValues; batch: TopicCandidate[] | null } {
  const saved = isRecord(raw) && isRecord(raw.form) ? raw.form : {};
  const level = textOr(saved.topicLevel, TOPIC_FORM_DEFAULTS.topicLevel);
  const batch = isRecord(raw)
    ? listOf(raw.batch).flatMap((item) => {
        const topic = toRecommendation(item);
        return topic ? [{ ...topic, kept: isRecord(item) && item.kept === true }] : [];
      })
    : [];

  return {
    form: {
      broaderTopic: textOr(saved.broaderTopic, TOPIC_FORM_DEFAULTS.broaderTopic, LIMITS.broaderTopic),
      specificInterest: textOr(saved.specificInterest, TOPIC_FORM_DEFAULTS.specificInterest, LIMITS.specificInterest),
      learnedBefore: textOr(saved.learnedBefore, TOPIC_FORM_DEFAULTS.learnedBefore, LIMITS.learnedBefore),
      customUserInput: textOr(saved.customUserInput, TOPIC_FORM_DEFAULTS.customUserInput, LIMITS.customUserInput),
      topicLevel: (TOPIC_LEVELS as readonly string[]).includes(level) ? level : TOPIC_FORM_DEFAULTS.topicLevel,
    },
    batch: batch.length > 0 ? batch : null,
  };
}

/** Every topic already on the list, one per line, so the AI does not suggest them again. */
export function listHistory(topics: SavedTopic[], max = HISTORY_LIMIT): string {
  const names = topics.map((topic) => topic.topicName);
  let text = names.join("\n");
  while (text.length > max && names.length > 0) {
    names.shift();
    text = names.join("\n");
  }
  return text;
}

function keyOf(name: string): string {
  return name.trim().toLowerCase();
}

/** Adds suggested topics to the end of the list. A name already on the list is skipped. */
export function appendTopics(
  list: SavedTopic[],
  candidates: TopicRecommendation[],
  ctx: TopicContext,
): AppendTopicsResult {
  const seen = new Set(list.map((topic) => keyOf(topic.topicName)));
  const fresh: SavedTopic[] = [];
  let skipped = 0;
  for (const candidate of candidates) {
    const key = keyOf(candidate.topicName);
    if (seen.has(key)) {
      skipped += 1;
      continue;
    }
    seen.add(key);
    fresh.push({ ...candidate, id: ctx.newId(), done: false, addedAt: ctx.now });
  }
  return { topics: [...list, ...fresh], added: fresh.length, skipped };
}

/** The suggested topics the user ticked, in their original order. */
export function pickTopics(candidates: TopicRecommendation[], selected: boolean[]): TopicRecommendation[] {
  return candidates.filter((_, index) => selected[index] === true);
}

export function toggleTopic(list: SavedTopic[], id: string): SavedTopic[] {
  return list.map((topic) => (topic.id === id ? { ...topic, done: !topic.done } : topic));
}

export function removeTopic(list: SavedTopic[], id: string): SavedTopic[] {
  return list.filter((topic) => topic.id !== id);
}

export function describeAppend(added: number, skipped: number): string {
  if (added === 0) return "Those topics are already in your list.";
  const addedText = `Added ${added} topic${added === 1 ? "" : "s"} to your list.`;
  if (skipped === 0) return addedText;
  return `${addedText} ${skipped} ${skipped === 1 ? "was" : "were"} already there.`;
}
