// src/features/subtopic-lister/lib/learned.ts
/** Collects what the learner has finished across their roadmaps, grouped by subject. */
import type { Roadmap } from "@/features/roadmap/types";
import type { LearnedTopic } from "../types";

export function summarizeLearned(roadmaps: Pick<Roadmap, "subject" | "mainPoints">[]): LearnedTopic[] {
  const topics: LearnedTopic[] = [];
  for (const roadmap of roadmaps) {
    const items: string[] = [];
    for (const point of roadmap.mainPoints) {
      if (point.done) items.push(point.title);
      for (const subtopic of point.subtopics) {
        if (subtopic.done) items.push(subtopic.title);
      }
    }
    if (items.length > 0) topics.push({ subject: roadmap.subject, items });
  }
  return topics;
}

export function formatLearned(topics: LearnedTopic[]): string {
  return topics.map((topic) => `${topic.subject}: ${topic.items.join("; ")}`).join("\n");
}
