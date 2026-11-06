// src/features/learning/tutor/lib/prompt-db.ts
/**
 * File-backed storage for tutor persona system prompts, one JSON file per
 * template under data/tutor/prompts/<name>.json. Replaces the backend-managed
 * prompt library so templates live entirely in the Next.js app. Templates are
 * shared across users (a persona library), not owner-scoped.
 */
import { promises as fs } from "fs";
import path from "path";
import { PromptResponseSchema, type PromptResponse } from "../types";

const PROMPTS_DIR = path.join(process.cwd(), "data", "tutor", "prompts");

/** Prompt names are validated by PromptSaveSchema; guard file paths anyway. */
function isSafeName(name: string): boolean {
  return /^[\w.-]+$/.test(name);
}

function promptFile(name: string): string {
  return path.join(PROMPTS_DIR, `${name}.json`);
}

async function readPromptFile(name: string): Promise<PromptResponse | null> {
  if (!isSafeName(name)) return null;
  try {
    const data = await fs.readFile(promptFile(name), "utf8");
    const parsed = PromptResponseSchema.safeParse(JSON.parse(data));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export async function listPromptFiles(): Promise<PromptResponse[]> {
  let names: string[];
  try {
    names = await fs.readdir(PROMPTS_DIR);
  } catch {
    return [];
  }

  const prompts: PromptResponse[] = [];
  for (const name of names) {
    if (!name.endsWith(".json")) continue;
    const prompt = await readPromptFile(name.slice(0, -5));
    if (prompt) prompts.push(prompt);
  }
  return prompts.sort((a, b) => a.name.localeCompare(b.name));
}

export async function getPromptFromStore(name: string): Promise<PromptResponse | null> {
  return readPromptFile(name);
}

export async function savePromptToStore(
  name: string,
  content: string
): Promise<PromptResponse> {
  if (!isSafeName(name)) throw new Error("Invalid prompt name.");
  const existing = await readPromptFile(name);
  const now = new Date().toISOString();
  const prompt: PromptResponse = {
    name,
    content,
    created_at: existing?.created_at ?? now,
    updated_at: now,
  };
  const validated = PromptResponseSchema.parse(prompt);
  await fs.mkdir(PROMPTS_DIR, { recursive: true });
  await fs.writeFile(promptFile(name), JSON.stringify(validated, null, 2), "utf8");
  return validated;
}

export async function deletePromptFromStore(name: string): Promise<boolean> {
  if (!isSafeName(name)) return false;
  try {
    await fs.unlink(promptFile(name));
    return true;
  } catch {
    return false;
  }
}
