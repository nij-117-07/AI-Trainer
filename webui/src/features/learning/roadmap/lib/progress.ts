// src/features/learning/roadmap/lib/progress.ts
/**
 * Progress calculation for a roadmap: every main point and subpoint counts
 * equally toward the completion percentage.
 */
import { Roadmap } from "../types";

export interface RoadmapProgress {
  done: number;
  total: number;
  percent: number;
}

export function computeProgress(roadmap: Roadmap): RoadmapProgress {
  let total = 0;
  let done = 0;

  for (const point of roadmap.main_topics) {
    total += 1;
    if (point.done) done += 1;

    total += point.subtopics.length;
    done += point.subtopics.filter((subtopic) => subtopic.done).length;
  }

  const percent = total === 0 ? 0 : Math.round((done / total) * 100);
  return { done, total, percent };
}
