// src/features/learning/roadmap/actions/crud.ts
/**
 * Server Actions for roadmap CRUD backed by data/roadmaps.json.
 * The owner is always derived from the authenticated session (never trusted
 * from the client), so roadmaps stay scoped per user.
 */
"use server";

import { revalidatePath } from "next/cache";
import { validateIdentity } from "@/features/identity/lib/auth-guard";
import { safeParse } from "@/features/learning/lib/api";
import {
  CreateRoadmapInput,
  CreateRoadmapInputSchema,
  Roadmap,
  RoadmapSchema,
} from "../types";
import {
  deleteRoadmap as dbDelete,
  getRoadmap as dbGet,
  insertRoadmap as dbInsert,
  listRoadmaps as dbList,
  saveRoadmap as dbSave,
} from "../lib/db";

export async function listRoadmapsAction(): Promise<Roadmap[]> {
  const identity = await validateIdentity();
  return dbList(identity.username);
}

export async function getRoadmapAction(id: string): Promise<Roadmap | null> {
  const identity = await validateIdentity();
  return dbGet(id, identity.username);
}

export async function createRoadmapAction(
  input: CreateRoadmapInput
): Promise<Roadmap> {
  const identity = await validateIdentity();
  const payload = safeParse(CreateRoadmapInputSchema, input, "Invalid roadmap");

  const now = new Date().toISOString();
  const roadmap: Roadmap = {
    id: crypto.randomUUID(),
    owner: identity.username,
    subject: payload.subject.trim(),
    start_level: payload.start_level,
    target_level: payload.target_level,
    mode: payload.mode,
    persona_style: payload.persona_style,
    user_instructions: payload.user_instructions,
    persona: payload.persona,
    main_topics: payload.main_topics.map((title) => ({
      id: crypto.randomUUID(),
      title: title.trim(),
      done: false,
      subtopics: [],
    })),
    createdAt: now,
    updatedAt: now,
  };

  const validated = safeParse(RoadmapSchema, roadmap, "Invalid roadmap document");
  await dbInsert(validated);

  revalidatePath("/learning/roadmap");
  return validated;
}

export async function saveRoadmapAction(roadmap: Roadmap): Promise<Roadmap> {
  const identity = await validateIdentity();
  if (roadmap.owner !== identity.username) {
    throw new Error("You are not allowed to modify this roadmap.");
  }

  const validated = safeParse(RoadmapSchema, roadmap, "Invalid roadmap document");
  const saved = await dbSave(validated.id, identity.username, validated);
  if (!saved) throw new Error("Roadmap not found.");

  revalidatePath("/learning/roadmap");
  revalidatePath(`/learning/roadmap/${saved.id}`);
  return saved;
}

export async function deleteRoadmapAction(id: string): Promise<void> {
  const identity = await validateIdentity();
  await dbDelete(id, identity.username);
  revalidatePath("/learning/roadmap");
}
