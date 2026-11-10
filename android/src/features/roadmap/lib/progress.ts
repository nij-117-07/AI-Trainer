// src/features/roadmap/lib/progress.ts
/** Progress for a roadmap: every main point and subpoint counts equally toward the percentage. */
import type { Roadmap, RoadmapMainPoint, RoadmapProgress } from "../types";

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

export type StageStatus = "done" | "current" | "upcoming";

/** The first main point that is not done yet, or null when every point is done. */
export function nextMainPoint(roadmap: Pick<Roadmap, "mainPoints">): RoadmapMainPoint | null {
  return roadmap.mainPoints.find((point) => !point.done) ?? null;
}

/** Done points stay done; the first unfinished point is current; the rest are upcoming. */
export function stageStatuses(mainPoints: RoadmapMainPoint[]): StageStatus[] {
  let currentFound = false;
  return mainPoints.map((point) => {
    if (point.done) return "done";
    if (!currentFound) {
      currentFound = true;
      return "current";
    }
    return "upcoming";
  });
}
