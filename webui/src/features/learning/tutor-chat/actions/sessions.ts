// src/features/learning/tutor-chat/actions/sessions.ts
/**
 * Server Actions for tutor chat session CRUD + turn handling, backed by
 * per-user session files in data/tutor/. The owner is always derived from the
 * authenticated session, never trusted from the client. Sending a turn is a
 * single atomic action: append the user message, call the backend, persist the
 * assistant reply with its breakdown, and return the updated session.
 */
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { validateIdentity } from "@/features/identity/lib/auth-guard";
import { safeParse } from "@/features/learning/lib/api";
import {
  CreateSessionInputSchema,
  TutorChatSessionSchema,
  UpdateSessionSettingsSchema,
  type ChatMessage,
  type TutorChatSession,
  type TutorChatSessionSummary,
} from "../types";
import {
  deleteSessionFile,
  getSession,
  listSessionFiles,
  saveSession,
} from "../lib/db";
import { tutorChatAction } from "./chat";

function now(): string {
  return new Date().toISOString();
}

function toSummary(session: TutorChatSession): TutorChatSessionSummary {
  const messages = session.chat_history;
  const last = messages.length > 0 ? messages[messages.length - 1] : null;
  return {
    id: session.id,
    master_topic: session.master_topic,
    updatedAt: session.updatedAt,
    messageCount: messages.length,
    lastMessage: last?.content ?? "",
  };
}

export async function listSessionsAction(): Promise<TutorChatSessionSummary[]> {
  const identity = await validateIdentity();
  const sessions = await listSessionFiles(identity.username);
  return sessions.map(toSummary);
}

export async function getSessionAction(id: string): Promise<TutorChatSession | null> {
  const identity = await validateIdentity();
  return getSession(id, identity.username);
}

export async function createSessionAction(
  input: unknown
): Promise<TutorChatSession> {
  const identity = await validateIdentity();
  const payload = safeParse(CreateSessionInputSchema, input, "Invalid session input");

  const timestamp = now();
  const session: TutorChatSession = {
    id: crypto.randomUUID(),
    owner: identity.username,
    master_topic: payload.master_topic,
    additional_context: payload.additional_context,
    chat_history: [],
    breakdowns: [],
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  const validated = safeParse(TutorChatSessionSchema, session, "Invalid session document");
  await saveSession(validated);

  revalidatePath("/learning/tutor-chat");
  return validated;
}

export async function updateSessionSettingsAction(
  id: string,
  input: unknown
): Promise<TutorChatSession> {
  const identity = await validateIdentity();
  const session = await getSession(id, identity.username);
  if (!session) throw new Error("Session not found.");

  const payload = safeParse(UpdateSessionSettingsSchema, input, "Invalid session settings");

  const updated: TutorChatSession = {
    ...session,
    master_topic: payload.master_topic,
    additional_context: payload.additional_context,
    updatedAt: now(),
  };
  const validated = safeParse(TutorChatSessionSchema, updated, "Invalid session document");
  await saveSession(validated);

  revalidatePath("/learning/tutor-chat");
  return validated;
}

export async function sendTurnAction(
  id: string,
  input: unknown
): Promise<TutorChatSession> {
  const identity = await validateIdentity();
  const session = await getSession(id, identity.username);
  if (!session) throw new Error("Session not found.");

  const payload = safeParse(
    z.object({ user_input: z.string().trim().min(1) }),
    input,
    "Invalid user input"
  );

  const userMessage: ChatMessage = { role: "user", content: payload.user_input };
  const historyWithUser: ChatMessage[] = [...session.chat_history, userMessage];

  const response = await tutorChatAction({
    master_topic: session.master_topic,
    additional_context: session.additional_context || undefined,
    chat_history: historyWithUser,
    user_input: payload.user_input,
  });

  const assistantMessage: ChatMessage = {
    role: "assistant",
    content: response.tutor_response,
  };

  const updated: TutorChatSession = {
    ...session,
    chat_history: [...historyWithUser, assistantMessage],
    breakdowns: [...session.breakdowns, response.educational_breakdown],
    updatedAt: now(),
  };
  const validated = safeParse(TutorChatSessionSchema, updated, "Invalid session document");
  await saveSession(validated);

  revalidatePath("/learning/tutor-chat");
  return validated;
}

export async function deleteSessionAction(id: string): Promise<void> {
  const identity = await validateIdentity();
  await deleteSessionFile(id, identity.username);
  revalidatePath("/learning/tutor-chat");
}
