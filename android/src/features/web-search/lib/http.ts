// src/features/web-search/lib/http.ts
/** Fetch helpers for the search providers: a timeout, readable network errors, and a form encoder. */

const CORS_HINT = " On web, the browser may block this request (CORS).";

/** Encodes key/value pairs as an application/x-www-form-urlencoded or query string body. */
export function toFormBody(entries: [string, string][]): string {
  return entries.map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`).join("&");
}

function isWebRuntime(): boolean {
  return typeof (globalThis as { document?: unknown }).document !== "undefined";
}

/** Fetches with a timeout. Network failures and timeouts become readable errors that name the service. */
export async function fetchWithTimeout(
  service: string,
  url: string,
  init: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (error) {
    if (controller.signal.aborted) throw new Error(`${service} did not respond in time.`);
    const detail = error instanceof Error && error.message ? error.message : "network error";
    throw new Error(`Unable to reach ${service}: ${detail}.${isWebRuntime() ? CORS_HINT : ""}`);
  } finally {
    clearTimeout(timer);
  }
}
