// src/features/chatbot/lib/request.ts
/** Builds and reads OpenAI-compatible chat requests. Pure functions, no network access. */
import type { ChatMessage } from "../types";

export const DEFAULT_BASE_URL = "https://api.openai.com/v1";

export interface RequestMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface SamplingParams {
  temperature: number;
  topP: number;
  maxTokens: number;
}

export type StreamEvent = { type: "delta"; text: string } | { type: "done" };

export function completionsEndpoint(baseUrl: string): string {
  const root = baseUrl.trim().replace(/\/+$/, "") || DEFAULT_BASE_URL;
  return `${root}/chat/completions`;
}

export function buildRequestMessages(systemPrompt: string, history: ChatMessage[], historyLimit: number): RequestMessage[] {
  const turns: RequestMessage[] = history
    .filter((message) => message.status === "done" && message.content.trim() !== "")
    .slice(-historyLimit)
    .map((message) => ({ role: message.role, content: message.content }));
  const system = systemPrompt.trim();
  return system ? [{ role: "system", content: system }, ...turns] : turns;
}

export function buildRequestBody(model: string, messages: RequestMessage[], params: SamplingParams, stream: boolean): string {
  const body: Record<string, unknown> = {
    model: model.trim(),
    messages,
    temperature: params.temperature,
    top_p: params.topP,
    stream,
  };
  if (params.maxTokens > 0) body.max_tokens = params.maxTokens;
  return JSON.stringify(body);
}

export function parseStreamLine(line: string): StreamEvent | null {
  const trimmed = line.trim();
  if (!trimmed.startsWith("data:")) return null;
  const payload = trimmed.slice(5).trim();
  if (payload === "[DONE]") return { type: "done" };
  try {
    const parsed = JSON.parse(payload) as { choices?: Array<{ delta?: { content?: unknown } }> };
    const piece = parsed.choices?.[0]?.delta?.content;
    return typeof piece === "string" && piece.length > 0 ? { type: "delta", text: piece } : null;
  } catch {
    return null;
  }
}

function detailFromJson(raw: string): string | null {
  try {
    const parsed = JSON.parse(raw) as { error?: unknown; message?: unknown };
    const error = parsed.error;
    const nested = error && typeof error === "object" ? (error as { message?: unknown }).message : error;
    if (typeof nested === "string" && nested.trim()) return nested.trim();
    if (typeof parsed.message === "string" && parsed.message.trim()) return parsed.message.trim();
    return null;
  } catch {
    return null;
  }
}

export function describeHttpError(status: number, host: string, raw: string): string {
  if (/^\s*<(!doctype|html)/i.test(raw)) {
    return `${host} returned a web page, not a chat API. Check the base URL in AI settings.`;
  }
  const detail = (detailFromJson(raw) ?? raw.trim().slice(0, 200)) || "No details returned";
  const hint = status === 401 ? " Check the chat API key in AI settings." : "";
  return `Chat request failed (${status}) from ${host}: ${detail.replace(/\.$/, "")}.${hint}`;
}

export function readCompletionText(raw: string): string {
  try {
    const parsed = JSON.parse(raw) as { choices?: Array<{ message?: { content?: unknown } }> };
    const content = parsed.choices?.[0]?.message?.content;
    if (typeof content === "string" && content.trim()) return content;
  } catch {
    // Fall through to the error below.
  }
  throw new Error("The model returned an empty reply.");
}
