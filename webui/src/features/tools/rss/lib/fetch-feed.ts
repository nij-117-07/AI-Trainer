// src/features/tools/rss/lib/fetch-feed.ts
/**
 * Server-side RSS fetching with guardrails: only http/https targets,
 * SSRF protection (blocks loopback/private/link-local addresses), a bounded
 * download size, and a fetch timeout. Returns normalized RssFetchResult.
 */
import { lookup } from "dns/promises";
import { isIP } from "net";
import type { RssFeedConfig, RssFetchResult } from "../types";
import { parseFeedXml } from "./rss-parser";

const MAX_BYTES = 2 * 1024 * 1024; // 2MB cap on feed documents
const REQUEST_TIMEOUT_MS = 15_000;

/** True for hostnames/IPs that should never be fetched (SSRF guard). */
function isBlockedHost(host: string): boolean {
  const normalized = host.replace(/^\[|\]$/g, "").toLowerCase();
  if (normalized === "localhost" || normalized.endsWith(".local")) return true;

  if (isIP(normalized)) {
    const parts = normalized.split(".").map(Number);
    if (parts.length === 4) {
      const [a, b] = parts;
      if (a === 10 || a === 127) return true;
      if (a === 169 && b === 254) return true;
      if (a === 172 && b >= 16 && b <= 31) return true;
      if (a === 192 && b === 168) return true;
    }
    return normalized === "::1" || normalized.startsWith("fc") || normalized.startsWith("fd");
  }
  return false;
}

/** Resolves the hostname and rejects the fetch when it maps to a private IP. */
async function assertSafeTarget(url: URL): Promise<void> {
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Only http(s) feed URLs are allowed.");
  }
  if (isBlockedHost(url.hostname)) {
    throw new Error("Feed URLs pointing to local or private hosts are not allowed.");
  }
  const records = await lookup(url.hostname, { all: true });
  const blocked = records.some((record) => isBlockedHost(record.address));
  if (blocked) {
    throw new Error("Feed URL resolves to a private or loopback address.");
  }
}

/**
 * Fetches and parses a feed. Uses the provided cache when available; skips it
 * when `bypassCache` is true (manual refresh).
 */
export async function fetchFeed(config: RssFeedConfig, bypassCache = false): Promise<RssFetchResult> {
  const { getCachedFeed, setCachedFeed } = await import("./cache");
  const url = new URL(config.url);
  await assertSafeTarget(url);

  if (!bypassCache) {
    const cached = getCachedFeed(config.url);
    if (cached) return cached;
  }

  let response: Response;
  try {
    response = await fetch(url, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
  } catch (error) {
    throw new Error(
      `Unable to fetch feed: ${error instanceof Error ? error.message : "network error"}`
    );
  }

  if (!response.ok) {
    throw new Error(`Feed request failed (${response.status}) for ${config.name}.`);
  }

  const buffer = await response.arrayBuffer();
  if (buffer.byteLength > MAX_BYTES) {
    throw new Error(`Feed for ${config.name} exceeds the ${MAX_BYTES / 1024 / 1024}MB size limit.`);
  }

  const xml = new TextDecoder("utf-8").decode(buffer);
  const result = parseFeedXml(xml, config.id, config.name);
  result.items = result.items
    .map((item) => ({ ...item, feedId: config.id, feedName: config.name }))
    .slice(0, 200);
  setCachedFeed(config.url, result, config.refreshIntervalMinutes);
  return result;
}
