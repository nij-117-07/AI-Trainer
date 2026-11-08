// src/features/web-search/lib/pagination.test.ts
import { appendUnique, duckDuckGoOffset, hasNextPage } from "./pagination";
import type { WebSearchResult } from "../types";

const item = (url: string, title = url): WebSearchResult => ({ title, url, host: "example.com", snippet: "" });

describe("duckDuckGoOffset", () => {
  it("starts page 1 at offset 0 and advances by the page size", () => {
    expect(duckDuckGoOffset(1, 10)).toBe(0);
    expect(duckDuckGoOffset(2, 10)).toBe(10);
    expect(duckDuckGoOffset(3, 5)).toBe(10);
  });

  it("never returns a negative offset", () => {
    expect(duckDuckGoOffset(0, 10)).toBe(0);
  });
});

describe("hasNextPage", () => {
  it("is true only for a full page", () => {
    expect(hasNextPage(10, 10)).toBe(true);
    expect(hasNextPage(7, 10)).toBe(false);
    expect(hasNextPage(0, 10)).toBe(false);
  });
});

describe("appendUnique", () => {
  it("adds only URLs that are new, in order", () => {
    const merged = appendUnique([item("https://a.test"), item("https://b.test")], [
      item("https://b.test", "B again"),
      item("https://c.test"),
    ]);
    expect(merged.map((result) => result.url)).toEqual(["https://a.test", "https://b.test", "https://c.test"]);
    expect(merged[1].title).toBe("https://b.test");
  });

  it("drops duplicates inside the new batch too", () => {
    const merged = appendUnique([], [item("https://a.test"), item("https://a.test")]);
    expect(merged).toHaveLength(1);
  });
});
