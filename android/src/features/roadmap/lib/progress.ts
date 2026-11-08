// src/features/roadmap/lib/progress.ts
/** Progress for a roadmap: every main point and subpoint counts equally toward the percentage. */
import type { Roadmap, RoadmapProgress } from "../types";

export function computeProgress(roadmap: Pick<Roadmap, "mainPoints">): RoadmapProgress {
  let total = 0;
  let done = 0;

  for (const point of roadmap.mainPoints) {
    total += 1;
    if (point.done) done += 1;

    total += point.subtopics.length;
    done += point.subtopics.filter((subtopic) => subtopic.done).length;
  }

  const percent = total === 0 ? 0 : Math.round((done / total) * 100);
  return { done, total, percent };
}

export function countSubtopics(roadmap: Pick<Roadmap, "mainPoints">): number {
  return roadmap.mainPoints.reduce((sum, point) => sum + point.subtopics.length, 0);
}
