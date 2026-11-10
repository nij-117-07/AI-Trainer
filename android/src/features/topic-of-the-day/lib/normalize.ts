// src/features/topic-of-the-day/lib/normalize.ts
/** Turns the raw model output into a TopicOfTheDay. Missing or wrongly typed fields become empty values. */
import type { TopicOfTheDay } from "../types";
import { textList, textOf } from "./text";

type RawTopicOfTheDay = { [K in keyof Omit<TopicOfTheDay, "date">]?: unknown };

export function normalizeTopicOfTheDay(raw: RawTopicOfTheDay, date: string): TopicOfTheDay {
  return {
    date,
    title: textOf(raw.title),
    whyItMatters: textOf(raw.whyItMatters),
    keyIdeas: textList(raw.keyIdeas),
    explanation: textOf(raw.explanation),
    workedExample: textOf(raw.workedExample),
    starterQuestion: textOf(raw.starterQuestion),
    tryToday: textOf(raw.tryToday),
  };
}
