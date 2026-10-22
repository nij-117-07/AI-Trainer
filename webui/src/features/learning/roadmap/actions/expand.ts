// src/features/learning/roadmap/actions/expand.ts
/**
 * Server Action for POST /learning/roadmap/expand-topic.
 *
 * Loads the roadmap, deep-dives into one main point, writes the generated
 * subtopics + milestone into that point, persists the change, and returns the
 * updated main point so the client can merge it optimistically.
 */
"use server";

import { validateIdentity } from "@/features/identity/lib/auth-guard";
import {
  ExpandTopicResponseSchema,
  ExpandTopicRequestSchema,
  RoadmapMainPoint,
} from "../types";
import { roadmapApiUrl, postJson, safeParse } from "../lib/api";
import { getRoadmap, saveRoadmap } from "../lib/db";

export async function expandTopicAction(
  roadmapId: string,
  mainPointId: string
): Promise<RoadmapMainPoint> {
  const identity = await validateIdentity();
  const roadmap = await getRoadmap(roadmapId, identity.username);
  if (!roadmap) throw new Error("Roadmap not found.");

  const point = roadmap.main_topics.find((topic) => topic.id === mainPointId);
  if (!point) throw new Error("Main point not found.");

  const payload = safeParse(
    ExpandTopicRequestSchema,
    {
      persona: roadmap.persona,
      subject: roadmap.subject,
      target_level: roadmap.target_level,
      full_topic_list: roadmap.main_topics.map((topic) => topic.title),
      current_module: point.title,
      mode: roadmap.mode,
    },
    "Invalid expansion request"
  );

  const raw = await postJson<unknown>(roadmapApiUrl("expand-topic"), payload);
  const result = safeParse(ExpandTopicResponseSchema, raw, "Invalid expansion response");

  const updatedPoint: RoadmapMainPoint = {
    ...point,
    milestone: result.milestone || point.milestone,
    subtopics: result.subtopics.map((title) => ({
      id: crypto.randomUUID(),
      title,
      done: false,
    })),
  };

  roadmap.main_topics = roadmap.main_topics.map((topic) =>
    topic.id === mainPointId ? updatedPoint : topic
  );
  roadmap.updatedAt = new Date().toISOString();

  const saved = await saveRoadmap(roadmap.id, identity.username, roadmap);
  if (!saved) throw new Error("Failed to save the roadmap.");

  return updatedPoint;
}
