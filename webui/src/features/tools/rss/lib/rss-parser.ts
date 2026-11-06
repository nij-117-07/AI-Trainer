// src/features/tools/rss/lib/rss-parser.ts
/**
 * Parses RSS 2.0 and Atom XML into normalized RssFeedItem[] using
 * fast-xml-parser. Normalizes dates to ISO-8601, extracts media enclosures,
 * and flattens single/array nodes so downstream code never handles XML shapes.
 */
import { XMLParser } from "fast-xml-parser";
import type { RssFetchResult, RssFeedItem } from "../types";

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  textNodeName: "#text",
  parseTagValue: false,
  parseAttributeValue: false,
  trimValues: true,
  cdataPropName: "__cdata",
});

/** Coerces a possibly-object XML value (cdata/text node) into a string. */
function textOf(value: unknown): string {
  if (value === undefined || value === null) return "";
  if (typeof value === "string" || typeof value === "number") {
    return String(value).trim();
  }
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    if (typeof obj.__cdata === "string") return obj.__cdata.trim();
    if (typeof obj["#text"] === "string") return obj["#text"].trim();
  }
  return "";
}

/** Normalizes any RSS/Atom date to ISO-8601 (or empty when unparseable). */
function normalizeDate(value: unknown): string {
  const raw = textOf(value);
  if (!raw) return "";
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? "" : parsed.toISOString();
}

/** Wraps a scalar-or-array XML node as an array. */
function asArray<T>(value: T | T[] | undefined | null): T[] {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

interface EnclosureNode {
  "@_url"?: string;
  "@_type"?: string;
}

/** Extracts the first media enclosure (RSS <enclosure> or Atom <link rel=alternate>). */
function extractMedia(node: unknown): { url: string; type: string } | undefined {
  const candidates = asArray<EnclosureNode>(node as EnclosureNode).filter(
    (item) => item && typeof item["@_url"] === "string" && item["@_url"].length > 0
  );
  const first = candidates[0];
  if (!first) return undefined;
  return { url: first["@_url"] as string, type: textOf(first["@_type"]) };
}

interface RssItemNode {
  title?: unknown;
  link?: unknown;
  guid?: unknown;
  pubDate?: unknown;
  "dc:date"?: unknown;
  description?: unknown;
  "content:encoded"?: unknown;
  author?: unknown;
  "dc:creator"?: unknown;
  category?: unknown;
  enclosure?: unknown;
  "media:content"?: unknown;
}

function parseRssItem(node: RssItemNode, feedName: string, feedId: string): RssFeedItem {
  const description = textOf(node.description);
  const content = textOf(node["content:encoded"]) || description;
  const guid = textOf(node.guid) || textOf(node.link);
  return {
    guid: guid || `${feedId}-${description.slice(0, 64)}`,
    title: textOf(node.title) || "Untitled",
    link: textOf(node.link),
    description: stripHtml(description),
    content,
    pubDate: normalizeDate(node.pubDate ?? node["dc:date"]),
    author: textOf(node.author) || textOf(node["dc:creator"]),
    categories: asArray(node.category).map((c) => textOf(c)).filter(Boolean),
    media: extractMedia(node.enclosure) ?? extractMedia(node["media:content"]),
    feedId,
    feedName,
  };
}

interface RssChannelNode {
  title?: unknown;
  link?: unknown;
  description?: unknown;
  item?: unknown;
}

function parseRss(root: Record<string, unknown>, feedId: string, feedName: string): RssFetchResult {
  const channel = root.channel as RssChannelNode | undefined;
  const items = asArray<RssItemNode>(channel?.item as RssItemNode).map((node) =>
    parseRssItem(node, feedName || textOf(channel?.title), feedId)
  );
  return {
    source: {
      title: textOf(channel?.title),
      link: textOf(channel?.link),
      description: textOf(channel?.description),
    },
    items,
    fetchedAt: new Date().toISOString(),
    fromCache: false,
  };
}

interface AtomEntryNode {
  title?: unknown;
  link?: unknown;
  id?: unknown;
  updated?: unknown;
  published?: unknown;
  summary?: unknown;
  content?: unknown;
  author?: unknown;
  category?: unknown;
}

function parseAtom(root: Record<string, unknown>, feedId: string, feedName: string): RssFetchResult {
  const feed = root.feed as Record<string, unknown> | undefined;
  const linkNode = asArray<{ "@_href"?: string }>(feed?.link as { "@_href"?: string })[0];
  const entries = asArray<AtomEntryNode>(feed?.entry as AtomEntryNode).map((entry) => {
    const title = textOf(entry.title);
    const description = textOf(entry.summary) || textOf(entry.content);
    const authorName = textOf(
      (entry.author as { name?: unknown } | undefined)?.name ?? entry.author
    );
    return {
      guid: textOf(entry.id) || textOf(entry.link as unknown) || `${feedId}-${title.slice(0, 64)}`,
      title: title || "Untitled",
      link: asArray<{ "@_href"?: string }>(entry.link as { "@_href"?: string })[0]?.["@_href"] ?? "",
      description: stripHtml(description),
      content: textOf(entry.content) || description,
      pubDate: normalizeDate(entry.updated ?? entry.published),
      author: authorName,
      categories: asArray(entry.category)
        .map((c) => textOf((c as { "@_term"?: string })["@_term"]))
        .filter(Boolean),
      media: undefined,
      feedId,
      feedName,
    };
  });

  return {
    source: {
      title: textOf(feed?.title),
      link: linkNode?.["@_href"] ?? "",
      description: textOf(feed?.subtitle),
    },
    items: entries,
    fetchedAt: new Date().toISOString(),
    fromCache: false,
  };
}

/**
 * Parses an RSS or Atom XML document into a normalized RssFetchResult.
 * @throws Error when the XML cannot be parsed or the document type is unknown.
 */
export function parseFeedXml(xml: string, feedId: string, feedName: string): RssFetchResult {
  let root: Record<string, unknown>;
  try {
    root = parser.parse(xml) as Record<string, unknown>;
  } catch (error) {
    throw new Error(`Failed to parse feed XML: ${error instanceof Error ? error.message : "unknown error"}`);
  }

  if (root.rss && typeof root.rss === "object") {
    return parseRss(root.rss as Record<string, unknown>, feedId, feedName);
  }
  if (root.feed && typeof root.feed === "object") {
    return parseAtom(root, feedId, feedName);
  }
  throw new Error("Unrecognized feed format: expected RSS 2.0 or Atom XML.");
}
