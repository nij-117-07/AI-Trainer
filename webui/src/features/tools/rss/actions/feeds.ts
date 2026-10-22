// src/features/tools/rss/actions/feeds.ts
/**
 * Server Actions for managing RSS feed providers.
 * All mutations validate input with Zod, persist to the server JSON store,
 * and return typed results for the client hooks.
 */
"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { RssFeedInputSchema, type RssFeedConfig, type RssFeedInput } from "../types";
import { readFeeds, writeFeeds } from "../lib/store";
import { invalidateFeed } from "../lib/cache";

function now(): string {
  return new Date().toISOString();
}

/** Returns every configured feed provider (enabled or not). */
export async function listFeedsAction(): Promise<RssFeedConfig[]> {
  return readFeeds();
}

/** Creates a new feed provider from validated input. */
export async function createFeedAction(input: RssFeedInput): Promise<RssFeedConfig> {
  const parsed = RssFeedInputSchema.parse(input);
  const feeds = await readFeeds();
  const config: RssFeedConfig = {
    ...parsed,
    id: randomUUID(),
    createdAt: now(),
    updatedAt: now(),
  };
  feeds.push(config);
  await writeFeeds(feeds);
  revalidatePath("/tools/rss");
  return config;
}

/** Updates an existing feed provider by id. */
export async function updateFeedAction(
  id: string,
  input: Partial<RssFeedInput>
): Promise<RssFeedConfig> {
  const parsed = RssFeedInputSchema.partial().parse(input);
  const feeds = await readFeeds();
  const index = feeds.findIndex((feed) => feed.id === id);
  if (index === -1) {
    throw new Error("Feed provider not found.");
  }
  const previous = feeds[index];
  const updated: RssFeedConfig = { ...previous, ...parsed, id, updatedAt: now() };
  feeds[index] = updated;
  await writeFeeds(feeds);
  if (parsed.url && parsed.url !== previous.url) {
    invalidateFeed(previous.url);
  }
  revalidatePath("/tools/rss");
  return updated;
}

/** Deletes a feed provider and its cached items. */
export async function deleteFeedAction(id: string): Promise<{ success: true }> {
  const feeds = await readFeeds();
  const target = feeds.find((feed) => feed.id === id);
  const remaining = feeds.filter((feed) => feed.id !== id);
  if (target) invalidateFeed(target.url);
  await writeFeeds(remaining);
  revalidatePath("/tools/rss");
  return { success: true };
}
