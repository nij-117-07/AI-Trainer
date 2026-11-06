// src/features/learning/lib/api.ts
/**
 * Shared server-only helpers for talking to the core backend (Explainer,
 * Roadmap, and future learning services).
 *
 * All URLs are resolved at runtime inside Server Actions / Route Handlers, so
 * the backend URL and API key are never exposed to the browser.
 */
import { z } from "zod";

/**
 * Builds the absolute URL for a backend endpoint under a service path.
 * @param servicePath e.g. "/learning/explainer" or "/learning/roadmap"
 * @param endpoint e.g. "explain" or "generate"
 */
export function learningApiUrl(servicePath: string, endpoint: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_CORE_API_URL;
  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_CORE_API_URL is not configured.");
  }
  const path = `${servicePath.replace(/^\/+/, "")}/${endpoint}`;
  return `${baseUrl.replace(/\/+$/, "")}/${path}`;
}

/**
 * Headers for server-to-server calls. The backend guards endpoints with an
 * `X-API-Key` header when `API_KEY` is set; the matching value is read from
 * the webui's `CORE_API_KEY` env var.
 */
export function apiHeaders(extra?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json", ...extra };
  const apiKey = process.env.CORE_API_KEY;
  if (apiKey) headers["X-API-Key"] = apiKey;
  return headers;
}

/** Posts a JSON payload and returns the parsed JSON body. */
export async function postJson<T>(url: string, body: unknown): Promise<T> {
  return requestJson<T>("POST", url, body);
}

/**
 * Sends a JSON request with any HTTP method and returns the parsed JSON body.
 * Used by services that expose CRUD endpoints (e.g. tutor prompt templates).
 * DELETE/204 responses resolve to `undefined`.
 */
export async function requestJson<T>(
  method: string,
  url: string,
  body?: unknown
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers: apiHeaders(),
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (error) {
    throw new Error(
      `Unable to reach the learning service: ${
        error instanceof Error ? error.message : "network error"
      }`
    );
  }

  if (!response.ok) {
    throw new Error(await readApiError(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export const getJson = <T>(url: string): Promise<T> => requestJson<T>("GET", url);
export const putJson = <T>(url: string, body: unknown): Promise<T> =>
  requestJson<T>("PUT", url, body);
export const patchJson = <T>(url: string, body: unknown): Promise<T> =>
  requestJson<T>("PATCH", url, body);
export const deleteJson = <T>(url: string): Promise<T> => requestJson<T>("DELETE", url);

/** Maps backend error responses (401/422/500) to a readable message. */
export async function readApiError(response: Response): Promise<string> {
  const raw = await response.text().catch(() => "");
  try {
    const parsed = JSON.parse(raw);
    const detail = parsed?.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) {
      return detail.map((item) => item?.msg ?? "validation error").join(", ");
    }
  } catch {
    // fall through to raw text
  }
  return raw ? `Request failed (${response.status}): ${raw}` : `Request failed (${response.status})`;
}

/** Zod-safe parse helper used by actions that receive external payloads. */
export function safeParse<T>(schema: z.ZodType<T>, value: unknown, label: string): T {
  const parsed = schema.safeParse(value);
  if (!parsed.success) {
    throw new Error(`${label}: ${parsed.error.issues.map((i) => i.message).join(", ")}`);
  }
  return parsed.data;
}
