// src/lib/provider-errors.ts
/** Readable error text for responses from OpenAI-compatible model endpoints. */

export function extractErrorMessage(raw: string): string {
  try {
    const parsed = JSON.parse(raw) as { error?: unknown; message?: unknown };
    const error = parsed.error;
    const nested = error && typeof error === "object" ? (error as { message?: unknown }).message : error;
    if (typeof nested === "string" && nested.trim()) return nested.trim();
    if (typeof parsed.message === "string" && parsed.message.trim()) return parsed.message.trim();
  } catch {
    // Not JSON: fall through to the raw body.
  }
  return raw.trim().slice(0, 200) || "No details returned.";
}

export function hostOf(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}

/** True when the server answered with an HTML page, which usually means a wrong base URL. */
export function looksLikeWebPage(raw: string): boolean {
  return /^\s*<(!doctype|html)/i.test(raw);
}

/** Message for a failed call. Adds a hint when the key was rejected. */
export function describeFailure(label: string, status: number, host: string, raw: string, keyName: string): string {
  const detail = extractErrorMessage(raw).replace(/\.$/, "");
  const hint =
    status === 401 ? ` The ${keyName} was missing or rejected. An empty ${keyName} uses the chat API key.` : "";
  return `${label} failed (${status}) from ${host}: ${detail}.${hint}`;
}
