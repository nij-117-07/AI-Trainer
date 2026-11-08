// src/features/rss/lib/rss-parser.ts
/**
 * Parses RSS 2.0 and Atom feeds into normalized items. Ports the webui's fast-xml-parser version
 * with the same field rules: ISO-8601 dates, first media enclosure, and flat category lists.
 */
import type { RssFeedItem, RssFetchResult } from "../types";
import { parseXmlTree, type XmlElement } from "./xml-tree";

function childrenNamed(node: XmlElement | undefined, name: string): XmlElement[] {
  return node ? node.children.filter((child) => child.name === name) : [];
}

function firstChild(node: XmlElement | undefined, name: string): XmlElement | undefined {
  return childrenNamed(node, name)[0];
}

function textOf(node: XmlElement | undefined): string {
  return node ? node.text.trim() : "";
}

function normalizeDate(node: XmlElement | undefined): string {
  const raw = textOf(node);
  if (!raw) return "";
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? "" : parsed.toISOString();
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractMedia(nodes: XmlElement[]): { url: string; type: string } | undefined {
  const first = nodes.find((node) => (node.attrs.url ?? "").length > 0);
  if (!first) return undefined;
  return { url: first.attrs.url ?? "", type: (first.attrs.type ?? "").trim() };
}

function parseRssItem(node: XmlElement, feedName: string, feedId: string): RssFeedItem {
  const description = textOf(firstChild(node, "description"));
  const content = textOf(firstChild(node, "content:encoded")) || description;
  const link = textOf(firstChild(node, "link"));
  const guid = textOf(firstChild(node, "guid")) || link;
  return {
    guid: guid || `${feedId}-${description.slice(0, 64)}`,
    title: textOf(firstChild(node, "title")) || "Untitled",
    link,
    description: stripHtml(description),
    content,
    pubDate: normalizeDate(firstChild(node, "pubDate") ?? firstChild(node, "dc:date")),
    author: textOf(firstChild(node, "author")) || textOf(firstChild(node, "dc:creator")),
    categories: childrenNamed(node, "category")
      .map((category) => textOf(category))
      .filter(Boolean),
    media: extractMedia(childrenNamed(node, "enclosure")) ?? extractMedia(childrenNamed(node, "media:content")),
    feedId,
    feedName,
  };
}

function parseRss(rss: XmlElement, feedId: string, feedName: string): RssFetchResult {
  const channel = firstChild(rss, "channel");
  const channelTitle = textOf(firstChild(channel, "title"));
  return {
    source: {
      title: channelTitle,
      link: textOf(firstChild(channel, "link")),
      description: textOf(firstChild(channel, "description")),
    },
    items: childrenNamed(channel, "item").map((node) => parseRssItem(node, feedName || channelTitle, feedId)),
    fetchedAt: new Date().toISOString(),
    fromCache: false,
  };
}

function parseAtom(feed: XmlElement, feedId: string, feedName: string): RssFetchResult {
  const items = childrenNamed(feed, "entry").map((entry): RssFeedItem => {
    const title = textOf(firstChild(entry, "title"));
    const description = textOf(firstChild(entry, "summary")) || textOf(firstChild(entry, "content"));
    const author = firstChild(entry, "author");
    const authorNameNode = firstChild(author, "name");
    const link = firstChild(entry, "link");
    return {
      guid: textOf(firstChild(entry, "id")) || textOf(link) || `${feedId}-${title.slice(0, 64)}`,
      title: title || "Untitled",
      link: link?.attrs.href || "",
      description: stripHtml(description),
      content: textOf(firstChild(entry, "content")) || description,
      pubDate: normalizeDate(firstChild(entry, "updated") ?? firstChild(entry, "published")),
      author: authorNameNode ? textOf(authorNameNode) : textOf(author),
      categories: childrenNamed(entry, "category")
        .map((category) => (category.attrs.term ?? "").trim())
        .filter(Boolean),
      media: undefined,
      feedId,
      feedName,
    };
  });

  return {
    source: {
      title: textOf(firstChild(feed, "title")),
      link: firstChild(feed, "link")?.attrs.href || "",
      description: textOf(firstChild(feed, "subtitle")),
    },
    items,
    fetchedAt: new Date().toISOString(),
    fromCache: false,
  };
}

/**
 * Parses an RSS or Atom XML document into a normalized RssFetchResult.
 * @throws Error when the XML cannot be parsed or the document type is unknown.
 */
export function parseFeedXml(xml: string, feedId: string, feedName: string): RssFetchResult {
  let document: XmlElement;
  try {
    document = parseXmlTree(xml);
  } catch (error) {
    throw new Error(`Failed to parse feed XML: ${error instanceof Error ? error.message : "unknown error"}`);
  }

  const rss = firstChild(document, "rss");
  if (rss) return parseRss(rss, feedId, feedName);
  const feed = firstChild(document, "feed");
  if (feed) return parseAtom(feed, feedId, feedName);
  throw new Error("Unrecognized feed format: expected RSS 2.0 or Atom XML.");
}
