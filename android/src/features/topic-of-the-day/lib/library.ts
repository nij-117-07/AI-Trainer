// src/features/topic-of-the-day/lib/library.ts
/**
 * Pure helpers for the topic library: reading a stored value safely, and changing broader topics
 * and topics. Each change returns a new library and leaves the input unchanged.
 */
import type { BroadTopic, SavedTopic, TopicLibrary } from "../types";
import { normalizeTopicOfTheDay } from "./normalize";
import { isRecord, listOf, textOf } from "./text";

export const EMPTY_TOPIC_LIBRARY: TopicLibrary = { broadTopics: [], topics: [] };

export function newId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Keeps only well-formed broader topics and topics, so a damaged saved value never breaks the screens. */
export function sanitizeLibrary(raw: unknown): TopicLibrary {
  if (!isRecord(raw)) return EMPTY_TOPIC_LIBRARY;

  const broadTopics = listOf(raw.broadTopics).flatMap((item): BroadTopic[] => {
    if (!isRecord(item)) return [];
    const id = textOf(item.id);
    const name = textOf(item.name);
    return id && name ? [{ id, name }] : [];
  });

  const topics = listOf(raw.topics).flatMap((item): SavedTopic[] => {
    if (!isRecord(item)) return [];
    const id = textOf(item.id);
    const broadId = textOf(item.broadId);
    if (!id || !broadId) return [];
    const content = normalizeTopicOfTheDay(item, textOf(item.date));
    const createdAt = typeof item.createdAt === "number" ? item.createdAt : 0;
    return [{ ...content, id, broadId, focus: textOf(item.focus), createdAt }];
  });

  return { broadTopics, topics };
}

export function findBroadTopic(library: TopicLibrary, id: string | undefined): BroadTopic | undefined {
  return id ? library.broadTopics.find((broad) => broad.id === id) : undefined;
}

/** Topics under one broader topic, newest first. */
export function topicsFor(library: TopicLibrary, broadId: string): SavedTopic[] {
  return library.topics.filter((topic) => topic.broadId === broadId).sort((a, b) => b.createdAt - a.createdAt);
}

export function addBroadTopic(library: TopicLibrary, name: string): TopicLibrary {
  return { ...library, broadTopics: [...library.broadTopics, { id: newId("broad"), name }] };
}

export function renameBroadTopic(library: TopicLibrary, id: string, name: string): TopicLibrary {
  return {
    ...library,
    broadTopics: library.broadTopics.map((broad) => (broad.id === id ? { ...broad, name } : broad)),
  };
}

/** Removes the broader topic and every topic saved under it. */
export function deleteBroadTopic(library: TopicLibrary, id: string): TopicLibrary {
  return {
    broadTopics: library.broadTopics.filter((broad) => broad.id !== id),
    topics: library.topics.filter((topic) => topic.broadId !== id),
  };
}

export function addTopic(library: TopicLibrary, topic: SavedTopic): TopicLibrary {
  return { ...library, topics: [...library.topics, topic] };
}

export function deleteTopics(library: TopicLibrary, ids: string[]): TopicLibrary {
  const removed = new Set(ids);
  return { ...library, topics: library.topics.filter((topic) => !removed.has(topic.id)) };
}
