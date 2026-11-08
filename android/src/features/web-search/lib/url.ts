// src/features/web-search/lib/url.ts
/** Text and link helpers for scraped search results: entity decoding, DuckDuckGo redirect unwrapping, host names. */

/** Decodes HTML entities and strips nested tags from scraped text. */
export function cleanText(raw: string): string {
  return raw
    .replace(/<[^>]+>/g, "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Resolves a scraped href to its real http(s) destination. DuckDuckGo redirectors
 * (`/l/?uddg=…`) are unwrapped; sponsored links and non-web schemes return null.
 */
export function unwrapResultUrl(href: string): string | null {
  let url = href.replace(/&amp;/g, "&");
  if (url.startsWith("//")) url = `https:${url}`;

  const redirect = /[?&]uddg=([^&]+)/.exec(url);
  if (redirect) {
    try {
      url = decodeURIComponent(redirect[1]);
    } catch {
      return null;
    }
  }

  if (url.includes("duckduckgo.com/y.js")) return null;
  if (!/^https?:\/\//i.test(url)) return null;
  return url;
}

/** Host name without a leading `www.`, or an empty string when the URL is malformed. */
export function toHost(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}
