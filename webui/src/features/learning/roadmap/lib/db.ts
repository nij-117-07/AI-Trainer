// src/features/learning/roadmap/lib/db.ts
/**
 * File-backed storage for roadmap documents, scoped by owner username.
 * Mirrors the pages-db.ts pattern: a single JSON file read/modified/written
 * with graceful error recovery when the file is missing or corrupt.
 */
import { promises as fs } from "fs";
import path from "path";
import { Roadmap } from "../types";

const DB_PATH = path.join(process.cwd(), "data", "roadmaps.json");

async function readAll(): Promise<Roadmap[]> {
  try {
    await fs.access(DB_PATH);
    const data = await fs.readFile(DB_PATH, "utf8");
    if (!data || data.trim() === "") return [];
    const parsed = JSON.parse(data);
    // Accept both a bare array (older shape) and the object wrapper.
    if (Array.isArray(parsed)) return parsed as Roadmap[];
    if (parsed && Array.isArray(parsed.roadmaps)) return parsed.roadmaps as Roadmap[];
    return [];
  } catch {
    return [];
  }
}

async function writeAll(roadmaps: Roadmap[]): Promise<void> {
  await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
  await fs.writeFile(DB_PATH, JSON.stringify({ roadmaps }, null, 2), "utf8");
}

export async function listRoadmaps(owner: string): Promise<Roadmap[]> {
  const all = await readAll();
  return all
    .filter((roadmap) => roadmap.owner === owner)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getRoadmap(id: string, owner: string): Promise<Roadmap | null> {
  const all = await readAll();
  return all.find((roadmap) => roadmap.id === id && roadmap.owner === owner) ?? null;
}

export async function insertRoadmap(roadmap: Roadmap): Promise<void> {
  const all = await readAll();
  all.push(roadmap);
  await writeAll(all);
}

export async function saveRoadmap(id: string, owner: string, next: Roadmap): Promise<Roadmap | null> {
  const all = await readAll();
  const index = all.findIndex((roadmap) => roadmap.id === id && roadmap.owner === owner);
  if (index === -1) return null;
  all[index] = next;
  await writeAll(all);
  return next;
}

export async function deleteRoadmap(id: string, owner: string): Promise<boolean> {
  const all = await readAll();
  const filtered = all.filter((roadmap) => !(roadmap.id === id && roadmap.owner === owner));
  if (filtered.length === all.length) return false;
  await writeAll(filtered);
  return true;
}
