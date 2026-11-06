// src/features/learning/tutor-chat/lib/db.ts
/**
 * File-backed storage for tutor chat sessions, scoped by owner username.
 * Each session lives in its own file under data/tutor/<id>.json so concurrent
 * users never contend for a single shared file. Missing/corrupt files degrade
 * gracefully to empty results.
 */
import { promises as fs } from "fs";
import path from "path";
import {
  TutorChatSessionSchema,
  type ChatMessage,
  type TutorChatSession,
} from "../types";

const TUTOR_DATA_DIR = path.join(process.cwd(), "data", "tutor");

function sessionFile(id: string): string {
  return path.join(TUTOR_DATA_DIR, `${id}.json`);
}

/**
 * Migrates a legacy session whose breakdown was embedded on each assistant
 * message into the current shape: chat_history keeps only {role, content} and
 * the per-reply breakdowns move into the parallel `breakdowns` array.
 */
function migrateLegacySession(raw: unknown): TutorChatSession | null {
  if (!raw || typeof raw !== "object") return null;
  const base = raw as Record<string, unknown>;

  const messages: ChatMessage[] = [];
  const breakdowns: unknown[] = [];
  for (const item of Array.isArray(base.chat_history) ? base.chat_history : []) {
    const record = item as { role?: unknown; content?: unknown; breakdown?: unknown };
    if (typeof record.role !== "string" || typeof record.content !== "string") continue;
    messages.push({ role: record.role, content: record.content });
    if (record.role === "assistant" && Array.isArray(record.breakdown)) {
      breakdowns.push(record.breakdown);
    }
  }

  const timestamp = new Date().toISOString();
  const candidate: unknown = {
    id: typeof base.id === "string" ? base.id : "",
    owner: typeof base.owner === "string" ? base.owner : "",
    master_topic: typeof base.master_topic === "string" ? base.master_topic : "",
    additional_context:
      typeof base.additional_context === "string" ? base.additional_context : "",
    chat_history: messages,
    breakdowns,
    createdAt: typeof base.createdAt === "string" ? base.createdAt : timestamp,
    updatedAt: typeof base.updatedAt === "string" ? base.updatedAt : timestamp,
  };

  const parsed = TutorChatSessionSchema.safeParse(candidate);
  return parsed.success ? parsed.data : null;
}

async function readSessionFile(id: string): Promise<TutorChatSession | null> {
  try {
    const data = await fs.readFile(sessionFile(id), "utf8");
    const raw = JSON.parse(data) as unknown;
    const parsed = TutorChatSessionSchema.safeParse(raw);
    if (parsed.success) return parsed.data;
    return migrateLegacySession(raw);
  } catch {
    return null;
  }
}

async function writeSessionFile(session: TutorChatSession): Promise<void> {
  await fs.mkdir(TUTOR_DATA_DIR, { recursive: true });
  await fs.writeFile(sessionFile(session.id), JSON.stringify(session, null, 2), "utf8");
}

export async function listSessionFiles(owner: string): Promise<TutorChatSession[]> {
  let names: string[];
  try {
    names = await fs.readdir(TUTOR_DATA_DIR);
  } catch {
    return [];
  }

  const sessions: TutorChatSession[] = [];
  for (const name of names) {
    if (!name.endsWith(".json")) continue;
    const session = await readSessionFile(name.replace(/\.json$/, ""));
    if (session && session.owner === owner) sessions.push(session);
  }
  return sessions.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getSession(id: string, owner: string): Promise<TutorChatSession | null> {
  const session = await readSessionFile(id);
  if (!session || session.owner !== owner) return null;
  return session;
}

export async function saveSession(session: TutorChatSession): Promise<TutorChatSession> {
  await writeSessionFile(session);
  return session;
}

export async function deleteSessionFile(id: string, owner: string): Promise<boolean> {
  const session = await readSessionFile(id);
  if (!session || session.owner !== owner) return false;
  try {
    await fs.unlink(sessionFile(id));
    return true;
  } catch {
    return false;
  }
}
