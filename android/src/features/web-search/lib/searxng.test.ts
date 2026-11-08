// src/features/web-search/lib/searxng.test.ts
import { buildSearxngQuery, normalizeSearxngUrl, parseSearxngResults, toSearxLanguage } from "./searxng";
import type { SearchRequest } from "../types";

const request: SearchRequest = {
  query: "rust async",
  engine: "searxng",
  resultCount: 5,
  region: "de-de",
  timeRange: "m",
  safeSearch: "1",
  page: 2,
};

describe("normalizeSearxngUrl", () => {
  it("trims whitespace and trailing slashes", () => {
    expect(normalizeSearxngUrl("  http://192.168.1.20:8888//  ")).toBe("http://192.168.1.20:8888");
  });

  it("rejects values that are not http(s) addresses", () => {
    expect(normalizeSearxngUrl("192.168.1.20:8888")).toBeNull();
    expect(normalizeSearxngUrl("ftp://host")).toBeNull();
    expect(normalizeSearxngUrl("")).toBeNull();
  });
});

describe("toSearxLanguage", () => {
  it("maps a DuckDuckGo region to a language tag", () => {
    expect(toSearxLanguage("de-de")).toBe("de-DE");
  });

  it("returns null for the global region", () => {
    expect(toSearxLanguage("wt-wt")).toBeNull();
  });
});

describe("buildSearxngQuery", () => {
  it("maps filters and paging to SearXNG parameters", () => {
    expect(buildSearxngQuery(request)).toBe(
      "q=rust%20async&format=json&pageno=2&safesearch=2&language=de-DE&time_range=month",
    );
  });
});

describe("parseSearxngResults", () => {
  it("keeps valid http results, drops duplicates, and respects the limit", () => {
    const payload = {
      results: [
        { title: "Tokio", url: "https://www.tokio.rs/", content: "Async runtime." },
        { title: "Tokio again", url: "https://www.tokio.rs/" },
        { title: "No url" },
        "not an object",
        { title: "Bad scheme", url: "file:///etc/passwd" },
        { title: "Book", url: "https://doc.rust-lang.org/book/", content: 42 },
      ],
    };
    expect(parseSearxngResults(payload, 10)).toEqual([
      { title: "Tokio", url: "https://www.tokio.rs/", host: "tokio.rs", snippet: "Async runtime." },
      { title: "Book", url: "https://doc.rust-lang.org/book/", host: "doc.rust-lang.org", snippet: "" },
    ]);
    expect(parseSearxngResults(payload, 1)).toHaveLength(1);
  });

  it("throws when the payload has no results array", () => {
    expect(() => parseSearxngResults({ answers: [] }, 5)).toThrow("unexpected response shape");
    expect(() => parseSearxngResults(null, 5)).toThrow("unexpected response shape");
  });
});
