// src/features/roadmap/lib/roadmap-ops.ts
/**
 * Pure roadmap edits. Each function returns a new roadmap and never mutates its input. Every edit
 * stamps updatedAt with ctx.now. Unknown ids leave the roadmap unchanged, so a stale edit after a
 * delete is harmless.
 */
import type {
  ExpansionRequest,
  OpContext,
  Roadmap,
  RoadmapExpansion,
  RoadmapFormValues,
  RoadmapMainPoint,
  RoadmapSubtopic,
} from "../types";
import { cleanText, requireText, ROADMAP_LIMITS } from "./validation";

export interface NewRoadmapInput {
  form: RoadmapFormValues;
  persona: string;
  topics: string[];
}

export function createRoadmap(input: NewRoadmapInput, ctx: OpContext): Roadmap {
  const { form } = input;
  const id = ctx.newId();
  const mainPoints: RoadmapMainPoint[] = input.topics
    .map((topic) => cleanText(topic, ROADMAP_LIMITS.title))
    .filter((title) => title !== "")
    .map((title) => ({ id: ctx.newId(), title, done: false, milestone: "", subtopics: [] }));

  return {
    id,
    subject: requireText(form.subject, "Subject", ROADMAP_LIMITS.subject),
    startLevel: requireText(form.startLevel, "Start level", ROADMAP_LIMITS.level),
    targetLevel: requireText(form.targetLevel, "Target level", ROADMAP_LIMITS.level),
    mode: form.mode,
    personaStyle: cleanText(form.personaStyle, ROADMAP_LIMITS.personaStyle),
    userInstructions: cleanText(form.userInstructions, ROADMAP_LIMITS.instructions),
    persona: cleanText(input.persona, ROADMAP_LIMITS.persona),
    mainPoints,
    createdAt: ctx.now,
    updatedAt: ctx.now,
  };
}

function withPoints(roadmap: Roadmap, mainPoints: RoadmapMainPoint[], ctx: OpContext): Roadmap {
  return { ...roadmap, mainPoints, updatedAt: ctx.now };
}

function hasPoint(roadmap: Roadmap, pointId: string): boolean {
  return roadmap.mainPoints.some((point) => point.id === pointId);
}

function changePoint(
  roadmap: Roadmap,
  pointId: string,
  change: (point: RoadmapMainPoint) => RoadmapMainPoint,
  ctx: OpContext,
): Roadmap {
  if (!hasPoint(roadmap, pointId)) return roadmap;
  return withPoints(
    roadmap,
    roadmap.mainPoints.map((point) => (point.id === pointId ? change(point) : point)),
    ctx,
  );
}

function changeSubtopics(
  point: RoadmapMainPoint,
  change: (subtopics: RoadmapSubtopic[]) => RoadmapSubtopic[],
): RoadmapMainPoint {
  return { ...point, subtopics: change(point.subtopics) };
}

export function toggleMainPoint(roadmap: Roadmap, pointId: string, ctx: OpContext): Roadmap {
  return changePoint(roadmap, pointId, (point) => ({ ...point, done: !point.done }), ctx);
}

export function renameMainPoint(roadmap: Roadmap, pointId: string, title: string, ctx: OpContext): Roadmap {
  const clean = cleanText(title, ROADMAP_LIMITS.title);
  if (!clean) return roadmap;
  return changePoint(roadmap, pointId, (point) => ({ ...point, title: clean }), ctx);
}

export function removeMainPoint(roadmap: Roadmap, pointId: string, ctx: OpContext): Roadmap {
  if (!hasPoint(roadmap, pointId)) return roadmap;
  return withPoints(
    roadmap,
    roadmap.mainPoints.filter((point) => point.id !== pointId),
    ctx,
  );
}

export function addMainPoint(roadmap: Roadmap, title: string, ctx: OpContext): Roadmap {
  const clean = cleanText(title, ROADMAP_LIMITS.title);
  if (!clean) return roadmap;
  const point: RoadmapMainPoint = { id: ctx.newId(), title: clean, done: false, milestone: "", subtopics: [] };
  return withPoints(roadmap, [...roadmap.mainPoints, point], ctx);
}

export function toggleSubtopic(roadmap: Roadmap, pointId: string, subtopicId: string, ctx: OpContext): Roadmap {
  return changePoint(
    roadmap,
    pointId,
    (point) =>
      changeSubtopics(point, (subtopics) =>
        subtopics.map((item) => (item.id === subtopicId ? { ...item, done: !item.done } : item)),
      ),
    ctx,
  );
}

export function addSubtopic(roadmap: Roadmap, pointId: string, title: string, ctx: OpContext): Roadmap {
  const clean = cleanText(title, ROADMAP_LIMITS.title);
  if (!clean) return roadmap;
  return changePoint(
    roadmap,
    pointId,
    (point) =>
      changeSubtopics(point, (subtopics) => [...subtopics, { id: ctx.newId(), title: clean, done: false }]),
    ctx,
  );
}

export function renameSubtopic(
  roadmap: Roadmap,
  pointId: string,
  subtopicId: string,
  title: string,
  ctx: OpContext,
): Roadmap {
  const clean = cleanText(title, ROADMAP_LIMITS.title);
  if (!clean) return roadmap;
  return changePoint(
    roadmap,
    pointId,
    (point) =>
      changeSubtopics(point, (subtopics) =>
        subtopics.map((item) => (item.id === subtopicId ? { ...item, title: clean } : item)),
      ),
    ctx,
  );
}

export function removeSubtopic(roadmap: Roadmap, pointId: string, subtopicId: string, ctx: OpContext): Roadmap {
  return changePoint(
    roadmap,
    pointId,
    (point) => changeSubtopics(point, (subtopics) => subtopics.filter((item) => item.id !== subtopicId)),
    ctx,
  );
}

/** Builds the expand-topic request for one main point, or null when the point is missing. */
export function buildExpansionRequest(roadmap: Roadmap, pointId: string): ExpansionRequest | null {
  const point = roadmap.mainPoints.find((item) => item.id === pointId);
  if (!point) return null;
  return {
    persona: roadmap.persona,
    subject: roadmap.subject,
    targetLevel: roadmap.targetLevel,
    fullTopicList: roadmap.mainPoints.map((item) => item.title),
    currentModule: point.title,
    mode: roadmap.mode,
  };
}

/** Replaces the subpoints of one main point with the generated ones and keeps the old milestone if none came back. */
export function applyExpansion(
  roadmap: Roadmap,
  pointId: string,
  expansion: RoadmapExpansion,
  ctx: OpContext,
): Roadmap {
  return changePoint(
    roadmap,
    pointId,
    (point) => ({
      ...point,
      milestone: expansion.milestone || point.milestone,
      subtopics: expansion.subtopics.map((title) => ({ id: ctx.newId(), title, done: false })),
    }),
    ctx,
  );
}

export function sortByUpdated(roadmaps: Roadmap[]): Roadmap[] {
  return [...roadmaps].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}
