// src/features/learning/roadmap/actions/generate.ts
/**
 * Server Action for POST /learning/roadmap/generate.
 * Validates the request, calls the backend, and returns the persona prompt
 * plus the generated main topics. Nothing is persisted here — the client
 * previews the result before creating a roadmap.
 */
"use server";

import {
  RoadmapRequest,
  RoadmapRequestSchema,
  RoadmapResponse,
  RoadmapResponseSchema,
} from "../types";
import { roadmapApiUrl, postJson, safeParse } from "../lib/api";

export async function generateRoadmapAction(input: RoadmapRequest): Promise<RoadmapResponse> {
  const payload = safeParse(RoadmapRequestSchema, input, "Invalid roadmap request");
  const raw = await postJson<unknown>(roadmapApiUrl("generate"), payload);
  return safeParse(RoadmapResponseSchema, raw, "Invalid roadmap response");
}
